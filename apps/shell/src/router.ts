import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/weather',
      name: 'weather',
      component: () => import('./views/WeatherView.vue'),
    },
    {
      path: '/wordle',
      name: 'wordle',
      component: () => import('./views/WordleView.vue'),
    },
  ],
});
