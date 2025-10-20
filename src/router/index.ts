
import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../pages/Home.vue')
const MovieDetails = () => import('../pages/MovieDetails.vue')
const Favorites = () => import('../pages/Favorites.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/movie/:id', name: 'movie', component: MovieDetails, props: true },
    { path: '/favorites', name: 'favorites', component: Favorites },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
