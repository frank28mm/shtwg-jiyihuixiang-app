import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import WelcomePage from '@/pages/WelcomePage.vue'
import StudyPage from '@/pages/StudyPage.vue'
import LoginPage from '@/pages/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'welcome',
      component: WelcomePage,
      meta: { requiresAuth: true }
    },
    {
      path: '/study',
      name: 'study',
      component: StudyPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/training/:id',
      name: 'training',
      component: () => import('@/pages/TrainingPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ai-chat/:id',
      name: 'ai-chat',
      component: () => import('@/pages/AiChatPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/paraphrase/:id',
      name: 'paraphrase',
      component: () => import('@/pages/ParaphrasePage.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 初始化认证状态（仅在首次访问时）
  if (!authStore.user && !authStore.loading) {
    await authStore.initAuth()
  }
  
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest
  const isAuthenticated = authStore.isAuthenticated
  
  if (requiresAuth && !isAuthenticated) {
    // 需要认证但未登录，跳转到登录页
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    // 需要游客状态但已登录，跳转到首页
    next('/')
  } else {
    next()
  }
})

export default router
