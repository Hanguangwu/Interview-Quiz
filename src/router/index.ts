import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CategoryView from '../views/CategoryView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/category/:name',
      name: 'category',
      component: CategoryView,
    },
    {
      path: '/category/:name/flashcard',
      name: 'flashcard',
      component: CategoryView,
      props: { flashcardMode: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      path: '/admin/category/:name',
      name: 'admin-category',
      component: AdminView,
    },
  ],
})

export default router
