import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/mapbox'
    },
    {
      path: '/mapbox',
      name: 'mapbox',
      component: () => import('../views/MapboxView.vue')
    },
    {
      path: '/cesium',
      name: 'cesium',
      component: () => import('../views/CesiumView.vue')
    }
  ]
})

export default router
