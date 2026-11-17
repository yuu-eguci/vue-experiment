import { fileURLToPath } from 'node:url'
import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config.mts'

// MPA 構成を試すための設定です。既定の設定 (vite.config.mts) に次の変更を加えます。
//   npx vite --config vite.mpa.config.mts
//   npx vite build --config vite.mpa.config.mts
// src/pages を root にすることで、src/pages/index.html は dist/index.html、
// src/pages/spa.html は dist/spa.html として出力されます。
export default mergeConfig(
  baseConfig,
  defineConfig({
    root: fileURLToPath(new URL('./src/pages', import.meta.url)),
    // favicon.ico などの静的ファイルは既定の構成と同じ public から読み込みます。
    publicDir: fileURLToPath(new URL('./public', import.meta.url)),
    build: {
      outDir: fileURLToPath(new URL('./dist', import.meta.url)),
      emptyOutDir: true,
      rolldownOptions: {
        input: {
          // index ページ (エントリーは src/pages/index/main.ts) です。
          index: fileURLToPath(new URL('./src/pages/index.html', import.meta.url)),
          // spa ページ (エントリーは src/pages/spa/main.ts) です。
          spa: fileURLToPath(new URL('./src/pages/spa.html', import.meta.url)),
        },
      },
    },
  }),
)
