<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex flex-col justify-center items-center px-4">
    <div class="max-w-md w-full">
      <!-- 应用标题 -->
      <div class="text-center mb-6 md:mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-primary-600 mb-2">记忆回响</h1>
        <p class="text-sm md:text-base text-gray-600/65">讲解员个人记忆辅助工具</p>
      </div>

      <!-- 登录表单 -->
      <div class="w-full max-w-md bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-light p-6 md:p-8">
        <form @submit.prevent="handleSubmit" class="space-y-4 md:space-y-6">
          <!-- 邮箱输入 -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              :disabled="authStore.loading"
              class="w-full px-3 py-2 md:py-3 bg-transparent border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              placeholder="请输入您的邮箱地址"
            />
          </div>

          <!-- 密码输入 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              :disabled="authStore.loading"
              class="w-full px-3 py-2 md:py-3 bg-transparent border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              placeholder="请输入您的密码"
            />
          </div>

          <!-- 错误信息 -->
          <div v-if="authStore.error" class="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
            <p class="text-red-500 text-sm flex items-center">
              <AlertCircle class="w-4 h-4 mr-2 flex-shrink-0" />
              {{ authStore.error }}
            </p>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="authStore.loading || !form.email || !form.password"
            class="w-full bg-transparent border border-primary-500 text-primary-500 py-2 md:py-3 px-4 rounded-md font-medium hover:bg-primary-500/10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm md:text-base"
          >
            <Loader2 v-if="authStore.loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ authStore.loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 管理员提示 -->
        <div class="mt-4 md:mt-6 p-3 md:p-4 bg-primary-500/5 border border-primary-500/20 rounded-md">
          <p class="text-gray-600/65 text-xs md:text-sm text-center">
            <Info class="w-3 md:w-4 h-3 md:h-4 inline mr-1" />
            账户由管理员统一分配，如需帮助请联系管理员
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, Loader2, Info } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const form = reactive({
  email: '',
  password: ''
})

// 处理表单提交
const handleSubmit = async () => {
  // 清除之前的错误信息
  authStore.clearError()

  const result = await authStore.signIn(form.email, form.password)

  if (result.success) {
    // 登录成功，跳转到主页
    router.push('/')
  }
}

// 组件挂载时检查认证状态
onMounted(async () => {
  await authStore.initAuth()

  // 如果已经登录，直接跳转到主页
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>