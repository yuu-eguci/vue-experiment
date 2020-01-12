import Vue from 'vue'
import App from './App.vue'  // App を import している -> App.vue へ
import router from './router'
import VueI18n from 'vue-i18n'

Vue.config.productionTip = false

// vue-i18n を Vue にインストールする。
Vue.use(VueI18n)

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

// VueI18n のコンストラクタには locale と messages。
const i18n = new VueI18n({
  locale: 'en',
  messages,
})

new Vue({
  router,
  i18n,
  render: h => h(App),
}).$mount('#app')  // app に対して何かをしている。
