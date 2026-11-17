import { createRouter, createWebHistory } from 'vue-router'
import Page1 from '../../components/Page1.vue'
import Page2 from '../../components/Page2.vue'
import Page3 from '../../components/Page3.vue'

// vue-router 4 以降ではトップレベルのルートのパスを '/' から始める必要があるため、'/page1' のように書いています。
export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/page1',
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
