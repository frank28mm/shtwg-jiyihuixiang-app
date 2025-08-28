<template>
  <div class="min-h-screen bg-gradient-to-br from-[#003049] to-[#001D3D] text-[#EAE2B7] flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="bg-[#001D3D]/50 backdrop-blur-sm border-b border-[#EAE2B7]/20 p-3 md:p-4">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-2 md:mb-0">
          <div class="flex items-center space-x-3 md:space-x-4">
            <button
              @click="goBack"
              class="p-2 hover:bg-[#EAE2B7]/10 rounded-md transition-colors text-[#EAE2B7]/65 hover:text-[#F77F00]"
            >
              <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
              <h1 class="text-lg md:text-xl font-bold text-[#EAE2B7]">填空训练</h1>
              <p class="text-[#EAE2B7]/65 text-xs md:text-sm hidden md:block">{{ paragraph?.title }}</p>
            </div>
          </div>
        </div>
        
        <!-- 训练统计 -->
        <div class="flex items-center justify-center md:justify-end space-x-4 md:space-x-6 text-xs md:text-sm">
          <div class="text-center">
            <div class="text-[#F77F00] font-bold">{{ correctCount }}</div>
            <div class="text-[#EAE2B7]/65">正确</div>
          </div>
          <div class="text-center">
            <div class="text-[#D62828] font-bold">{{ incorrectCount }}</div>
            <div class="text-[#EAE2B7]/65">错误</div>
          </div>
          <div class="text-center">
            <div class="text-[#EAE2B7] font-bold">{{ Math.round(accuracy) }}%</div>
            <div class="text-[#EAE2B7]/65">准确率</div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 p-4 md:p-8">
      <div class="max-w-4xl mx-auto">
        <div v-if="paragraph && fillBlanks.length > 0" class="space-y-6">
          <!-- 填空内容 -->
          <div class="bg-[#003049] border border-[#EAE2B7]/20 rounded-lg p-4 md:p-8">
            <div class="text-base md:text-lg leading-relaxed">
              <template v-for="(item, index) in fillBlanks" :key="index">
                <!-- 文本部分 -->
                <span class="text-[#EAE2B7]">{{ item.text }}</span>
                
                <!-- 填空输入框 (只有当有答案时才显示) -->
                <template v-if="item.blank">
                  <span class="inline-block mx-2">
                    <input
                      v-model="userAnswers[index]"
                      @keyup.enter="focusNext(index)"
                      :class="[
                        'px-2 md:px-3 py-1 bg-transparent border-b-2 text-center min-w-[80px] md:min-w-[120px] transition-colors text-sm md:text-base',
                        'focus:outline-none focus:border-[#F77F00]',
                        getInputClass(index)
                      ]"
                      :placeholder="`填入答案 (${item.blank.length}字)`"
                      :disabled="answerStates[index] === 'correct'"
                    />
                  </span>
                  
                  <!-- 正确答案提示 -->
                  <span 
                    v-if="answerStates[index] === 'incorrect' && showCorrectAnswer[index]"
                    class="inline-block ml-2 px-2 py-1 bg-[#F77F00]/10 text-[#F77F00] text-sm rounded"
                  >
                    正确答案: {{ item.blank }}
                  </span>
                </template>
              </template>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              @click="checkAllAnswers"
              :disabled="!hasAnyAnswer"
              class="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-transparent border border-[#F77F00] text-[#F77F00] rounded-md hover:bg-[#F77F00]/10 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              检查答案
            </button>
            
            <button
              @click="resetTraining"
              class="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-transparent border border-[#EAE2B7]/65 text-[#EAE2B7]/65 rounded-md hover:bg-[#EAE2B7]/5 transition-colors font-medium text-sm md:text-base"
            >
              重新开始
            </button>
            
            <button
              v-if="isCompleted"
              @click="saveProgress"
              class="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-[#F77F00] text-[#003049] rounded-md hover:bg-[#F77F00]/90 transition-colors font-medium text-sm md:text-base"
            >
              保存进度
            </button>
          </div>

          <!-- 完成提示 -->
          <div v-if="isCompleted" class="text-center p-4 md:p-6 bg-[#F77F00]/10 border border-[#F77F00]/30 rounded-lg">
            <CheckCircle class="w-12 h-12 text-[#F77F00] mx-auto mb-4" />
            <h3 class="text-lg md:text-xl font-bold text-[#F77F00] mb-2">训练完成！</h3>
            <p class="text-[#EAE2B7]/65 text-sm md:text-base">
              准确率: {{ Math.round(accuracy) }}% | 
              正确: {{ correctCount }} | 
              错误: {{ incorrectCount }}
            </p>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-else-if="loading" class="flex items-center justify-center h-64">
          <div class="text-center">
            <Loader2 class="w-8 h-8 text-[#F77F00] animate-spin mx-auto mb-4" />
            <p class="text-[#EAE2B7]/65">加载训练内容...</p>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else class="flex items-center justify-center h-64">
          <div class="text-center">
            <AlertCircle class="w-12 h-12 text-[#D62828] mx-auto mb-4" />
            <h3 class="text-xl text-[#D62828] mb-2">加载失败</h3>
            <p class="text-[#EAE2B7]/65 mb-4">无法加载训练内容，请稍后重试</p>
            <button
              @click="loadParagraph"
              class="px-3 md:px-4 py-2 bg-transparent border border-[#F77F00] text-[#F77F00] rounded-md hover:bg-[#F77F00]/10 transition-colors text-sm md:text-base"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, CheckCircle, Loader2, AlertCircle
} from 'lucide-vue-next'
// 移除Supabase相关导入，改用本地JSON数据加载
// import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
// import type { Paragraph, FillBlank } from '@/lib/supabase'

// 定义本地段落数据类型
interface Paragraph {
  id: string
  section: string
  module: string
  title: string
  content: string
  keywords: string[]
  fill_blanks: string
  fill_blanks_answers: string[]
  voice_check_phrases: string
}

// 定义填空数据类型
interface FillBlank {
  text: string
  blank: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const paragraph = ref<Paragraph | null>(null)
const fillBlanks = ref<FillBlank[]>([])
const userAnswers = ref<string[]>([])
const answerStates = ref<('pending' | 'correct' | 'incorrect')[]>([])
const showCorrectAnswer = ref<boolean[]>([])
const loading = ref(true)
const correctCount = ref(0)
const incorrectCount = ref(0)

// 计算属性
const hasAnyAnswer = computed(() => {
  return userAnswers.value.some(answer => answer.trim() !== '')
})

const accuracy = computed(() => {
  const total = correctCount.value + incorrectCount.value
  return total > 0 ? (correctCount.value / total) * 100 : 0
})

const isCompleted = computed(() => {
  return answerStates.value.every(state => state === 'correct')
})

// 方法
const goBack = () => {
  router.push('/study')
}

const getInputClass = (index: number) => {
  const state = answerStates.value[index]
  if (state === 'correct') {
    return 'border-[#F77F00] text-[#F77F00] bg-[#F77F00]/5'
  } else if (state === 'incorrect') {
    return 'border-[#D62828] text-[#D62828]'
  }
  return 'border-[#EAE2B7]/65 text-[#EAE2B7]'
}

const checkAnswer = (index: number) => {
  // 安全检查数组边界
  if (index < 0 || index >= fillBlanks.value.length) {
    console.warn('checkAnswer: 索引超出范围', index)
    return
  }
  
  const userAnswer = userAnswers.value[index]?.trim().toLowerCase()
  const correctAnswer = fillBlanks.value[index]?.blank?.toLowerCase()
  
  if (!userAnswer || !correctAnswer) {
    answerStates.value[index] = 'pending'
    return
  }
  
  const previousState = answerStates.value[index]
  
  if (userAnswer === correctAnswer) {
    if (previousState !== 'correct') {
      answerStates.value[index] = 'correct'
      if (previousState === 'incorrect') {
        incorrectCount.value = Math.max(0, incorrectCount.value - 1)
      }
      correctCount.value++
      // 不在输入时显示答案，只在检查时显示
      // showCorrectAnswer.value[index] = false
    }
  } else {
    if (previousState !== 'incorrect') {
      answerStates.value[index] = 'incorrect'
      if (previousState === 'correct') {
        correctCount.value = Math.max(0, correctCount.value - 1)
      }
      incorrectCount.value++
      // 不在输入时显示答案，只在检查时显示
      // showCorrectAnswer.value[index] = true
    }
  }
}

const checkAllAnswers = () => {
  fillBlanks.value.forEach((_, index) => {
    checkAnswer(index)
    
    // 只有在点击"检查答案"按钮时才显示正确答案
    const userAnswer = userAnswers.value[index]?.trim().toLowerCase()
    const correctAnswer = fillBlanks.value[index]?.blank?.toLowerCase()
    
    if (userAnswer && correctAnswer) {
      if (userAnswer === correctAnswer) {
        showCorrectAnswer.value[index] = false
      } else {
        showCorrectAnswer.value[index] = true
      }
    }
  })
}

const focusNext = (currentIndex: number) => {
  const nextIndex = currentIndex + 1
  if (nextIndex < fillBlanks.value.length) {
    const nextInput = document.querySelectorAll('input')[nextIndex] as HTMLInputElement
    nextInput?.focus()
  }
}

const resetTraining = () => {
  userAnswers.value = new Array(fillBlanks.value.length).fill('')
  answerStates.value = new Array(fillBlanks.value.length).fill('pending')
  showCorrectAnswer.value = new Array(fillBlanks.value.length).fill(false)
  correctCount.value = 0
  incorrectCount.value = 0
}

// 解析填空数据
const parseFillBlanks = (paragraphData: Paragraph) => {
  const fillBlanksText = paragraphData.fill_blanks
  const answers = paragraphData.fill_blanks_answers
  
  if (!fillBlanksText || !answers || answers.length === 0) {
    fillBlanks.value = []
    return
  }
  
  // 将填空文本按照"___"分割
  const parts = fillBlanksText.split('___')
  const blanks: FillBlank[] = []
  
  // 确保答案数量与分割后的空白数量匹配
  const blankCount = parts.length - 1 // 分割后的空白数量
  if (blankCount !== answers.length) {
    console.warn(`填空数量不匹配: 文本中有${blankCount}个空白，但提供了${answers.length}个答案`)
  }
  
  // 为每个空白位置创建填空项
  for (let i = 0; i < blankCount && i < answers.length; i++) {
    let text = parts[i] || ''
    
    // 如果是最后一个填空项，将剩余的文本也加入
    if (i === blankCount - 1) {
      const lastPart = parts[parts.length - 1]
      if (lastPart && lastPart.trim() !== '') {
        // 这个填空项将包含最后的文本，但不会有额外的输入框
        blanks.push({
          text: text,
          blank: answers[i] || ''
        })
        // 添加最后一部分文本作为纯文本项
        blanks.push({
          text: lastPart,
          blank: '' // 最后一部分没有填空
        })
      } else {
        blanks.push({
          text: text,
          blank: answers[i] || ''
        })
      }
    } else {
      blanks.push({
        text: text,
        blank: answers[i] || ''
      })
    }
  }
  
  fillBlanks.value = blanks
}

const saveProgress = async () => {
  if (!authStore.user || !paragraph.value) return
  
  try {
    const masteryLevel = Math.round(accuracy.value)
    
    // 本地存储进度数据（替代Supabase）
    const progressData = {
      user_id: authStore.user.id,
      paragraph_id: paragraph.value.id,
      mastery_level: masteryLevel,
      practice_count: 1,
      last_practiced: new Date().toISOString(),
      training_data: {
        fill_blank_accuracy: accuracy.value,
        correct_count: correctCount.value,
        incorrect_count: incorrectCount.value
      }
    }
    
    // 存储到localStorage
    const existingProgress = JSON.parse(localStorage.getItem('user_progress') || '{}')
    const key = `${authStore.user.id}_${paragraph.value.id}`
    existingProgress[key] = progressData
    localStorage.setItem('user_progress', JSON.stringify(existingProgress))
    
    // 显示成功提示
    alert('进度已保存！')
  } catch (error) {
    console.error('保存进度失败:', error)
    alert('保存进度失败，请稍后重试')
  }
}

const loadParagraph = async () => {
  const paragraphId = route.params.id as string
  if (!paragraphId) {
    router.push('/')
    return
  }
  
  try {
    loading.value = true
    
    // 从本地JSON文件加载数据
    const response = await fetch('/shanghai_astronomy_museum.json')
    if (!response.ok) {
      throw new Error('无法加载数据文件')
    }
    
    const data: Paragraph[] = await response.json()
    
    // 查找对应ID的段落
    const foundParagraph = data.find(p => p.id === paragraphId)
    
    if (!foundParagraph) {
      throw new Error(`未找到ID为 ${paragraphId} 的段落`)
    }
    
    paragraph.value = foundParagraph
    
    // 解析填空数据
    parseFillBlanks(foundParagraph)
    
    // 初始化答案状态
    resetTraining()
  } catch (error) {
    console.error('加载段落失败:', error)
    // 设置错误状态，但不跳转
    paragraph.value = null
    fillBlanks.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载
onMounted(() => {
  loadParagraph()
})
</script>