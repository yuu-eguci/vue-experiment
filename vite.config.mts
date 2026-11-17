/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 既定のアプリ (index.html + src/main.ts) の設定です。
// MPA 構成の vite.mpa.config.mts もこの設定を土台にしています。
export default defineConfig({
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
  server: {
    // Vue CLI のころと同じポートで開発サーバーを起動します。
    port: 8080,
  },
  test: {
    // tests/typecheck.test.js は node で直接実行するスクリプトのため、Vitest の対象から外しています。
    include: ['tests/**/*.spec.ts'],
  },
})
