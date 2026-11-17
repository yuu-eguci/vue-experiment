# vue-experiment

I want to practice Vue-cli + SPA + i18n.

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

## TypeScript

The application code is written in TypeScript (`src/**/*.ts` and `<script lang="ts">` in single-file components).
`vue-tsc` type-checks both the scripts and the Vue templates.

- `tsconfig.json` holds the compiler settings. `skipLibCheck` is enabled because the bundled typings of vue-i18n 8.15 conflict with newer DOM typings.
- `src/shims-vue.d.ts` lets the webpack-side type checker import `.vue` files.
- `vue.config@.js` is not loaded by Vue CLI because of the `@` in its name. Rename it to `vue.config.js` to try the MPA setup (`src/pages/*/main.ts`).

## Requirements

Use Node.js 16. webpack 4 fails on Node.js 17 and later (`ERR_OSSL_EVP_UNSUPPORTED`), and `vue-tsc` needs Node.js 15 or later.

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Type-checks scripts and templates
```
yarn typecheck
```

### Checks that the type checker catches deliberate type mistakes
```
yarn test:typecheck
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
