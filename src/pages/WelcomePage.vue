
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
    <!-- 动画装饰星星 -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-20 left-20 w-2 h-2 bg-primary-400 rounded-full animate-pulse opacity-60"></div>
      <div class="absolute top-40 right-32 w-1 h-1 bg-primary-300 rounded-full animate-pulse opacity-40" style="animation-delay: 0.5s"></div>
      <div class="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse opacity-50" style="animation-delay: 1s"></div>
      <div class="absolute bottom-20 right-20 w-1 h-1 bg-primary-400 rounded-full animate-pulse opacity-30" style="animation-delay: 1.5s"></div>
    </div>

    <div class="max-w-4xl mx-auto text-center relative z-10">
      <!-- 主标题区域 -->
      <div class="mb-12">
        <div class="mb-6">
          <div class="w-24 h-24 mx-auto mb-6 bg-gray-900 rounded-full flex items-center justify-center shadow-heavy">
            <Telescope class="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          欢迎来到
        </h1>
        <h2 class="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent mb-6">
          记忆回响
        </h2>
        <p class="text-xl md:text-2xl text-gray-600 mb-8">
          讲解员个人记忆辅助工具
        </p>
      </div>

      <!-- 用户信息卡片 -->
      <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 mb-12 shadow-light">
        <div class="flex items-center justify-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-4 shadow-medium">
            <User class="w-8 h-8 text-white" />
          </div>
          <div class="text-left">
            <h3 class="text-2xl font-semibold text-gray-900 mb-1">欢迎回来！</h3>
            <p class="text-gray-600">{{ userEmail }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6 hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1">
            <BookOpen class="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold text-gray-900 mb-2">学习内容</h4>
            <p class="text-gray-600 text-sm">上海天文馆讲解内容</p>
          </div>
          <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6 hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1">
            <Brain class="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold text-gray-900 mb-2">记忆训练</h4>
            <p class="text-gray-600 text-sm">填空练习与复述训练</p>
          </div>
          <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6 hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1">
            <MessageCircle class="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold text-gray-900 mb-2">AI助手</h4>
            <p class="text-gray-600 text-sm">智能讲解员助手</p>
          </div>
        </div>
      </div>

      <!-- 快速开始按钮 -->
      <div class="flex flex-col items-center space-y-4">
        <button
          @click="startLearning"
          class="px-12 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-heavy hover:shadow-xl transform hover:-translate-y-2 flex items-center justify-center gap-3"
        >
          <Rocket class="w-6 h-6" />
          开始学习之旅
        </button>
        
        <p class="text-gray-500 text-sm">
          点击开始，进入学习模式
        </p>
      </div>

      <!-- 底部装饰星星 -->
      <div class="mt-16 flex justify-center space-x-8 opacity-60">
        <Star class="w-6 h-6 text-primary-400 animate-pulse" />
        <Star class="w-4 h-4 text-primary-500 animate-pulse" style="animation-delay: 0.5s" />
        <Star class="w-5 h-5 text-primary-400 animate-pulse" style="animation-delay: 1s" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Telescope, User, BookOpen, Brain, MessageCircle, Rocket, Star
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 计算属性
const userEmail = computed(() => {
  return authStore.user?.email || '未知用户'
})

// 方法
const startLearning = () => {
  router.push('/study')
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 安全区域支持 */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
