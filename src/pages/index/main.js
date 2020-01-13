import Vue from 'vue'
import Index from './Index.vue'

// Vue の起動時のプロダクションのヒントを表示する(true)。
Vue.config.productionTip = false

new Vue({
  render: h => h(Index),
}).$mount('#app')