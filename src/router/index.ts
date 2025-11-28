import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/Landing/index.vue')
  },
  {
    path: '/tool/live2d/:name',
    name: 'Live2DRender',
    component: () => import('@/views/Tools/Live2DTool/index.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_PUBLIC_PATH),
  routes,
  scrollBehavior: () => ({ top: 0, left: 0 })
})

export default router
