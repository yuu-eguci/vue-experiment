import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// 以前の package.json の eslintConfig (plugin:vue/essential + eslint:recommended、
// パーサーは @typescript-eslint/parser) を、ESLint 10 の flat config に置き換えた設定です。
export default [
  {
    ignores: ['dist/**'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    rules: {
      // 次の 2 つは、以前使っていた eslint-plugin-vue 5 の essential には含まれていなかったルールです。
      // Footer、Index、Page1 などの既存のコンポーネント名を変えずに、以前と同じ基準で検査するため無効にしています。
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
]
