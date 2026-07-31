import { createRouter, createWebHistory } from 'vue-router';
import SmokeView from '@/views/SmokeView.vue';

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: SmokeView
    }
  ]
});
