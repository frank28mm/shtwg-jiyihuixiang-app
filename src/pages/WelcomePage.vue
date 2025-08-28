<template>
  <div class="min-h-screen bg-gradient-to-br from-[#001D3D] via-[#003566] to-[#001D3D] flex items-center justify-center p-4">
    <div class="max-w-4xl mx-auto text-center">
      <!-- 主标题区域 -->
      <div class="mb-12">
        <div class="mb-6">
          <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#F77F00] to-[#FCBF49] rounded-full flex items-center justify-center shadow-2xl">
            <Telescope class="w-12 h-12 text-[#001D3D]" />
          </div>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold text-[#EAE2B7] mb-4">
          欢迎来到
        </h1>
        <h2 class="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#F77F00] to-[#FCBF49] bg-clip-text text-transparent mb-6">
          记忆回响
        </h2>
        <p class="text-xl md:text-2xl text-[#EAE2B7]/80 mb-8">
          讲解员个人记忆辅助工具
        </p>
      </div>

      <!-- 用户信息卡片 -->
      <div class="bg-[#001D3D]/50 backdrop-blur-sm border border-[#EAE2B7]/20 rounded-2xl p-8 mb-12 shadow-2xl">
        <div class="flex items-center justify-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-[#F77F00] to-[#FCBF49] rounded-full flex items-center justify-center mr-4">
            <User class="w-8 h-8 text-[#001D3D]" />
          </div>
          <div class="text-left">
            <h3 class="text-2xl font-semibold text-[#EAE2B7] mb-1">欢迎回来！</h3>
            <p class="text-[#EAE2B7]/70">{{ userEmail }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-[#003566]/50 rounded-lg p-4">
            <BookOpen class="w-8 h-8 text-[#FCBF49] mx-auto mb-2" />
            <h4 class="text-lg font-semibold text-[#EAE2B7] mb-1">学习内容</h4>
            <p class="text-[#EAE2B7]/70 text-sm">上海天文馆讲解内容</p>
          </div>
          <div class="bg-[#003566]/50 rounded-lg p-4">
            <Brain class="w-8 h-8 text-[#FCBF49] mx-auto mb-2" />
            <h4 class="text-lg font-semibold text-[#EAE2B7] mb-1">记忆训练</h4>
            <p class="text-[#EAE2B7]/70 text-sm">填空练习与复述训练</p>
          </div>
          <div class="bg-[#003566]/50 rounded-lg p-4">
            <MessageCircle class="w-8 h-8 text-[#FCBF49] mx-auto mb-2" />
            <h4 class="text-lg font-semibold text-[#EAE2B7] mb-1">AI助手</h4>
            <p class="text-[#EAE2B7]/70 text-sm">智能讲解员助手</p>
          </div>
        </div>
      </div>

      <!-- 快速开始按钮 -->
      <div class="flex flex-col items-center space-y-4">
        <button
          @click="startLearning"
          class="px-12 py-4 bg-gradient-to-r from-[#F77F00] to-[#FCBF49] text-[#001D3D] rounded-xl font-bold text-xl hover:from-[#FCBF49] hover:to-[#F77F00] transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 flex items-center justify-center gap-3"
        >
          <Rocket class="w-6 h-6" />
          开始学习之旅
        </button>
        
        <p class="text-[#EAE2B7]/60 text-sm">
          点击开始，进入学习模式
        </p>
      </div>

      <!-- 底部装饰 -->
      <div class="mt-16 flex justify-center space-x-8 opacity-30">
        <Star class="w-6 h-6 text-[#FCBF49] animate-pulse" />
        <Star class="w-4 h-4 text-[#F77F00] animate-pulse" style="animation-delay: 0.5s" />
        <Star class="w-5 h-5 text-[#FCBF49] animate-pulse" style="animation-delay: 1s" />
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
</style>