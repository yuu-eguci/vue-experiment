import Vue from 'vue'
import VueRouter from 'vue-router'
import Page1 from './components/Page1.vue'
import Page2 from './components/Page2.vue'
import Page3 from './components/Page3.vue'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'page1',
      component: Page1,
    },
    {
      path: '/page2',
      name: 'page2',
      component: Page2,
    },
    {
      path: '/page3',
      name: 'page3',
      component: Page3,
    }
  ]
})