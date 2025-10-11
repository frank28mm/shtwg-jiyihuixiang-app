import { createRouter, createWebHistory } from 'vue-router'
import WelcomePage from '@/pages/WelcomePage.vue'
import StudyPage from '@/pages/StudyPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomePage
    },
    {
      path: '/study',
      name: 'study',
      component: StudyPage
    },
    {
      path: '/ai-chat/:id',
      name: 'ai-chat',
      component: () => import('@/pages/AiChatPage.vue')
    }
  ]
})

export default router
