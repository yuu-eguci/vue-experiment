/// <reference types="vitest/config" />
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig, mergeConfig, type Plugin } from 'vite'

// Vue CLI 4 と同じ規則で、画像は img/、フォントは fonts/、メディアは media/、CSS は css/ へ出力します。
function assetFileName({ names }: { names: string[] }): string {
  const name = names[0] ?? ''
  if (/\.css$/i.test(name)) return 'css/[name].[hash:8][extname]'
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/i.test(name)) return 'img/[name].[hash:8][extname]'
  if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) return 'fonts/[name].[hash:8][extname]'
  if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i.test(name)) return 'media/[name].[hash:8][extname]'
  return 'assets/[name].[hash:8][extname]'
}

// 既定の構成と MPA 構成 (vite.mpa.config.mts) で共通の設定です。
export const sharedConfig = defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // '@/assets/logo.png' のような '@/' から始まるパスを src 配下として解決します。
      // root を変える MPA 構成でも同じ場所を指すように、絶対パスにしています。
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    // vue-i18n の esm-bundler 版が参照する機能フラグです。
    // Composition API モード (legacy: false) だけを使うため、Legacy API はバンドルに含めません。
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },
  build: {
    // Vue CLI 4 と同じく、JavaScript のソースマップ (js/*.js.map) も出力します。
    sourcemap: true,
    rolldownOptions: {
      output: {
        // Vue CLI 4 と同じ dist/js/<名前>.<8 桁の 16 進ハッシュ>.js というパスにします。
        entryFileNames: 'js/[name].[hash:8].js',
        chunkFileNames: 'js/[name].[hash:8].js',
        assetFileNames: assetFileName,
        hashCharacters: 'hex',
        codeSplitting: {
          groups: [
            // Vue CLI 4 と同じく、node_modules のコードを chunk-vendors にまとめます。
            // @vitejs/plugin-vue のヘルパー (Vue CLI では vue-loader のコード) と Vite の modulepreload の polyfill も、
            // アプリのコードではなくツールが追加するコードのため、ここに含めます。
            { name: 'chunk-vendors', test: /node_modules|plugin-vue:export-helper|vite\/modulepreload-polyfill/ },
          ],
        },
      },
    },
  },
  server: {
    // Vue CLI のころと同じポートで開発サーバーを起動します。
    port: 8080,
  },
  test: {
    // tests/typecheck.test.js は node で直接実行するスクリプトのため、Vitest の対象から外しています。
    include: ['tests/**/*.spec.ts'],
  },
})

// Vue CLI 4 の既定の構成では、public/spa.html がそのまま dist/spa.html にコピーされていました。
// 同じパスにページを出力するため、MPA 用のテンプレート src/pages/spa.html から
// MPA のエントリースクリプトを取り除き、favicon のパスに base を埋め込んだ静的なページを作ります。
// 以前のファイルに残っていた未展開の <%= BASE_URL %> は含めません。開発サーバーでも同じページを /spa.html で返します。
function staticSpaHtml(): Plugin {
  const template = fileURLToPath(new URL('./src/pages/spa.html', import.meta.url))
  const entryScript = /\n[ \t]*<script type="module" src="\.\/spa\/main\.ts"><\/script>/
  let base = '/'
  const render = (): string => {
    const html = fs.readFileSync(template, 'utf8')
    if (!entryScript.test(html)) {
      throw new Error('src/pages/spa.html に MPA のエントリースクリプトが見つかりません。staticSpaHtml を更新してください。')
    }
    return html.replace(entryScript, '').replace('href="/favicon.ico"', `href="${base}favicon.ico"`)
  }
  return {
    name: 'vue-experiment:static-spa-html',
    configResolved(config) {
      base = config.base
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== `${base}spa.html`) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(render())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'spa.html', source: render() })
    },
  }
}

// 既定のアプリ (index.html + src/main.ts) の設定です。
export default mergeConfig(
  sharedConfig,
  defineConfig({
    plugins: [staticSpaHtml()],
    build: {
      rolldownOptions: {
        // Vue CLI 4 と同じく、エントリーのチャンク名を app にします (dist/js/app.<ハッシュ>.js)。
        input: { app: fileURLToPath(new URL('./index.html', import.meta.url)) },
      },
    },
  }),
)
