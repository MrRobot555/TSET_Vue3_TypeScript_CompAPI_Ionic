import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Calculator from '../views/Calculator.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Calculator',
    component: Calculator
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
