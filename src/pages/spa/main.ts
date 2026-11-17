import { createApp } from 'vue'
import Spa from './Spa.vue'
import router from './router'
import { createI18n } from 'vue-i18n'

// NOTE: main.js ではなく各コンポーネントごとに定義したいんだけど……
const messages = {
  en: {
    message: {
      welcome: 'Welcome!!',
      change_locale: 'Change Locale'
    }
  },
  ja: {
    message: {
      welcome: 'ようこそ!',
      change_locale: 'ロケール変更'
    }
  }
}

// createI18n には locale と messages を渡します。
// Legacy API モードは vue-i18n 11 で非推奨のため、Composition API モード (legacy: false) を使います。
// この場合もテンプレートの $t と this.$i18n.locale はそのまま使えます。
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages,
})

// アプリを作り、ルーターと vue-i18n をインストールしてから #app にマウントします。
createApp(Spa)
  .use(router)
  .use(i18n)
  .mount('#app')
