import Vue from 'vue'
import App from './App.vue'  // App を import している -> App.vue へ
import router from './router'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')  // app に対して何かをしている。
