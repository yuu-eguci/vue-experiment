# vue-experiment

I want to practice Vue + SPA + i18n.

## This repository was archived

Progress.

- [x] SPA was successfully added.
- [x] MPA was successfully added.
- [ ] vue-i18n was successfully added though, each message couldn't be set in each component.
- [x] Use different layout in each component.
- [ ] Cannot import different external css files and use them only in each component.

```html
<style scoped>
  @import '../assets/index.css';
</style>
```

Gave up this experiment and have gone to angular-experiment.

## Stack

- Vue 3, vue-router 5, vue-i18n 11 (Composition API mode, `legacy: false`)
- Vite 8 with `@vitejs/plugin-vue` for the dev server and the production build
- TypeScript 6 with `vue-tsc`
- ESLint 10 (flat config in `eslint.config.mjs`) with eslint-plugin-vue and the typescript-eslint parser
- Vitest with `@vue/test-utils` and jsdom

The project was originally created with Vue CLI 4 and Vue 2.
Vue 2 and Vue CLI 4 no longer receive security fixes, so the project now uses Vue 3 and Vite.

## TypeScript

The application code is written in TypeScript (`src/**/*.ts` and `<script lang="ts">` in single-file components).
`vue-tsc` type-checks the scripts, the Vue templates, the tests and the Vite config files.

- `tsconfig.json` holds the compiler settings. `skipLibCheck` is enabled so that only this project's code is checked, not the bundled typings of dependencies.
- The `types` option loads the Vite client types (`import.meta.env`, asset imports) and the Node.js types (tests and Vite config files).
- `npm run build` runs `vue-tsc` before `vite build`, so a type error fails the build.

## Entry points

- `index.html` + `src/main.ts`: the default app (SPA with vue-router and vue-i18n). `npm run serve` and `npm run build` use it.
- `src/pages/index.html` + `src/pages/index/main.ts`, `src/pages/spa.html` + `src/pages/spa/main.ts`: the MPA setup. It is opt-in. Use `vite.mpa.config.mts` to try it:

```
npx vite --config vite.mpa.config.mts
npx vite build --config vite.mpa.config.mts
```

Without Node.js on the host, use the Docker commands in [Docker](#docker).

## Build output

Both setups write the build to `dist/` with the same layout that Vue CLI 4 used (`<hash>` is an 8-character hex content hash):

| Default setup (`npm run build`) | MPA setup (`vite.mpa.config.mts`) |
|---|---|
| `dist/index.html` | `dist/index.html` |
| `dist/spa.html` (static page, see below) | `dist/spa.html` (the SPA page) |
| `dist/favicon.ico` | `dist/favicon.ico` |
| `dist/js/app.<hash>.js` (+ `.map`) | `dist/js/index.<hash>.js` (+ `.map`) |
| `dist/js/chunk-vendors.<hash>.js` (+ `.map`) | `dist/js/spa.<hash>.js` (+ `.map`) |
| `dist/css/app.<hash>.css` | `dist/js/chunk-vendors.<hash>.js` (+ `.map`) |
| `dist/img/logo.<hash>.png` | |

- Code from `node_modules` goes to `chunk-vendors`. Images go to `img/`, fonts to `fonts/` and media files to `media/`, as in Vue CLI.
- Static files in `public/` are copied to `dist/` as they are.
- Vue CLI copied `public/spa.html` into the default build without rendering its `<%= BASE_URL %>` placeholder. The default build still writes `dist/spa.html`, but generates it from `src/pages/spa.html` with the base path filled in and without the MPA entry script, so it is the same static page with a working favicon link. `npm run serve` serves the same page at `/spa.html`.
- The HTML files load the scripts as ES modules (`<script type="module">` and `<link rel="modulepreload">`), because Vite outputs ES modules.

## Requirements

Node.js 26 (Active LTS). The exact version is in `.node-version`.
npm comes with Node.js. Use `npm ci` so that `package-lock.json` is respected.

Node.js is not needed on the host if you use Docker instead (see [Docker](#docker)).

## Project setup
```
npm ci
```

### Compiles and hot-reloads for development
```
npm run serve
```

The dev server listens on http://localhost:8080/.

### Type-checks and builds for production
```
npm run build
```

### Previews the production build
```
npm run preview
```

### Lints and fixes files
```
npm run lint
```

### Type-checks scripts and templates
```
npm run typecheck
```

### Runs the component and build tests
```
npm test
```

### Checks that the type checker catches deliberate type mistakes
```
npm run test:typecheck
```

## Docker

The `Dockerfile` installs the dependencies with the Node.js version above and starts the dev server.
Only Docker is needed on the host.

```
docker build -t vue-experiment .
docker run --rm -it -p 8080:8080 vue-experiment
```

Open http://localhost:8080/. Press Ctrl+C to stop the server.
Keep `-it`: without a terminal, Ctrl+C does not reach the dev server and the container keeps running (stop it with `docker stop`).
The source files are copied into the image, so run `docker build` again after you change them.
If port 8080 or 4173 is already in use on the host, change only the host side of `-p`, for example `-p 18080:8080`, and open that port instead.

To run the checks in the container, pass the command:

```
docker run --rm vue-experiment npm run typecheck
docker run --rm vue-experiment npx eslint .
docker run --rm vue-experiment npm test
docker run --rm vue-experiment npm run test:typecheck
```

To build for production and preview the build on http://localhost:4173/:

```
docker run --rm -it -p 4173:4173 vue-experiment sh -c "npm run build && npm run preview -- --host 0.0.0.0"
```

To try the MPA setup, start the dev server on http://localhost:8080/, or build it and preview the build on http://localhost:4173/:

```
docker run --rm -it -p 8080:8080 vue-experiment npx vite --config vite.mpa.config.mts --host 0.0.0.0
docker run --rm -it -p 4173:4173 vue-experiment sh -c "npx vite build --config vite.mpa.config.mts && npx vite preview --config vite.mpa.config.mts --host 0.0.0.0"
```

`.dockerignore` keeps `node_modules`, `dist` and the local env files (`.env.local` and `.env.*.local`, which Vite reads for local-only values such as secrets) out of the image.

To check the image itself, run `sh tests/docker.test.sh` (needs Docker and curl).
It builds the image with dummy local env files in a temporary copy of the project, checks that they are not in the image, starts the default command and checks the HTTP responses of the dev server.
It removes the image and the container it created when it finishes.

## CI

`.github/workflows/ci.yml` runs on pull requests and on pushes to `master`.
It type-checks, lints, runs the tests, builds both setups, builds the Docker image, runs the tests in the container and runs `tests/docker.test.sh`. It does not deploy anything.

### Customize configuration
See [Vite Configuration Reference](https://vite.dev/config/).
