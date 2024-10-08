import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeScreen.vue'),
    meta: {
      path: 'Default',
      title: 'Просмотр IFC файлов',
    },
  },
]

const router = createRouter({
  history: createWebHistory(''),
  routes,
})

export default router
