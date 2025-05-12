import { createRouter, createWebHistory } from 'vue-router'
import TrackDesignerView from '../views/TrackDesignerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'trackDesigner',
      component: TrackDesignerView
    }
  ]
})

export default router
