import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import ArchiveManage from '../views/ArchiveManage.vue'
import GameView from '../views/GameView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/archive'
        },
        {
          path: 'archive',
          name: 'ArchiveManage',
          component: ArchiveManage
        },
        {
          path: 'game/:archiveId',
          name: 'Game',
          component: GameView,
          props: true
        }
      ]
    }
  ]
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.path !== '/login' && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/archive')
  } else {
    next()
  }
})

export default router
