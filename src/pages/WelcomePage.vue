
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
          上海天文馆智能导览
        </h2>
        <p class="text-xl md:text-2xl text-gray-600 mb-8">
          您的专属天文馆智能导游
        </p>
      </div>

      <!-- 功能介绍卡片 -->
      <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 mb-12 shadow-light">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6 hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1">
            <BookOpen class="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold text-gray-900 mb-2">展品讲解</h4>
            <p class="text-gray-600 text-sm">浏览上海天文馆各展区的详细介绍</p>
          </div>
          <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-6 hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1">
            <MessageCircle class="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold text-gray-900 mb-2">AI智能问答</h4>
            <p class="text-gray-600 text-sm">随时向AI讲解员提问，获取详细解答</p>
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
          开始探索天文馆
        </button>
        
        <p class="text-gray-500 text-sm">
          点击开始，探索宇宙的奥秘
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
import { useRouter } from 'vue-router'
import { 
  Telescope, BookOpen, MessageCircle, Rocket, Star
} from 'lucide-vue-next'

const router = useRouter()

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
