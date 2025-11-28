import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Live2DTool',
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
