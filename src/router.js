import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from './components/Index.vue'
import PagesLayout from './components/PagesLayout.vue'
import Page1 from './components/Page1.vue'
import Page2 from './components/Page2.vue'
import Page3 from './components/Page3.vue'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    // トップページ。1種類目のデザインを使う。
    {
      path: '/',
      name: 'index',
      component: Index,
    },
    // 他のページ。2種類目のデザインを使うページ。
    {
      // ここで設定した url では PagesLayout だけが出る。 Page1,2,3 は表示されず PagesLayout だけが。
      // path: '/aaaa',
      // ただ↑のトップページと同じにしとけばトップページのほうが出る。ここは / にしとけばいいかも。
      path: '/',
      component: PagesLayout,
      children: [
        {
          path: '/page1',
          component: Page1,
        },
        {
          path: '/page2',
          component: Page2,
        },
        {
          path: '/page3',
          component: Page3,
        },
      ],
    }
  ]
})