
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex flex-col safe-area-top safe-area-bottom">
    <!-- 顶部导航栏 -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 md:p-4 shadow-light">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-2 md:mb-0">
          <div class="flex items-center space-x-3 md:space-x-4">
            <button @click="goBack"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-primary-600">
              <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
              <h1 class="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                <Mic class="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary-500" />
                复述训练
              </h1>
              <p class="text-gray-600 text-xs md:text-sm hidden md:block">{{ paragraph?.title }}</p>
            </div>
          </div>
        </div>

        <!-- 移动端标题和历史记录按钮 -->
        <div class="md:hidden flex items-center justify-between">
          <p class="text-gray-600 text-xs truncate flex-1 mr-3">{{ paragraph?.title }}</p>
          <button @click="showHistory = !showHistory"
            class="px-3 py-1.5 text-xs bg-white border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap shadow-light">
            {{ showHistory ? '隐藏' : '历史' }}
          </button>
        </div>

        <!-- 桌面端历史记录按钮 -->
        <div class="hidden md:block absolute top-4 right-4 space-x-2">
          <button @click="showHistory = !showHistory"
            class="px-4 py-2 text-sm bg-white border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors shadow-light">
            {{ showHistory ? '隐藏历史' : '查看历史' }}
          </button>
        </div>
      </div>
    </header>

    <div class="flex-1 flex">
      <!-- 主内容区 -->
      <main class="flex-1 p-4 md:p-8">
        <div class="max-w-4xl mx-auto">
          <!-- 原文展示 -->
          <div class="mb-6 md:mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-3 md:mb-4">原文内容</h2>
            <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 md:p-6 shadow-light">
              <div class="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {{ paragraph?.content }}
              </div>
            </div>
          </div>

          <!-- 录音区域 -->
          <div class="mb-6 md:mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-3 md:mb-4">语音复述</h2>
            <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 md:p-8 text-center shadow-light">
              <!-- 录音状态显示 -->
              <div class="mb-4 md:mb-6">
                <div  :class="[
                  'w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center transition-all duration-300',
                  isRecording
                    ? 'bg-error-100 border-2 border-error-500 animate-pulse shadow-medium'
                    : 'bg-primary-50 border-2 border-primary-500 hover:bg-primary-100 shadow-light hover:shadow-medium'
                ]">
                  <Mic :class="[
                    'w-8 h-8 md:w-12 md:h-12',
                    isRecording ? 'text-error-500' : 'text-primary-500'
                  ]" />
                </div>

                <div class="text-gray-900 mb-2 text-sm md:text-base font-medium">
                  {{ isRecording ? '正在录音...' : '点击开始录音' }}
                </div>

                <div v-if="recordingTime > 0" class="text-gray-500 text-xs md:text-sm">
                  录音时长: {{ formatTime(recordingTime) }}
                </div>
              </div>

              <!-- 录音控制按钮 -->
              <div class="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button v-if="!isRecording" @click="startRecording" :disabled="isProcessing"
                  class="w-full sm:w-auto px-4 md:px-6 py-3 md:py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm md:text-base min-h-[44px] shadow-heavy hover:shadow-xl transform hover:-translate-y-1">
                  <Mic class="w-4 h-4" />
                  <span>开始录音</span>
                </button>

                <button v-else @click="stopRecording"
                  class="w-full sm:w-auto px-4 md:px-6 py-3 md:py-3 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-lg hover:from-error-600 hover:to-error-700 transition-all duration-300 font-medium flex items-center justify-center space-x-2 text-sm md:text-base min-h-[44px] shadow-heavy">
                  <Square class="w-4 h-4" />
                  <span>停止录音</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 转录文本 -->
          <div v-if="transcribedText" class="mb-6 md:mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-3 md:mb-4">语音转录</h2>
            <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 md:p-6 shadow-light">
              <div class="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {{ transcribedText }}
              </div>
            </div>
          </div>

          <!-- AI评估结果 -->
          <div v-if="evaluation" class="mb-6 md:mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-3 md:mb-4">AI评估报告</h2>
            <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-light">
              <!-- 综合评分 -->
              <div class="flex items-center justify-between mb-6">
                <div class="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">{{ evaluation.score }}分</div>
                <div class="text-right">
                  <div class="text-primary-600 font-bold text-lg">{{ getScoreLevel(evaluation.score) }}</div>
                  <div class="flex items-center space-x-2 mt-2">
                    <div class="w-32 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        class="h-full bg-gradient-to-r from-error-500 via-warning-500 to-success-500 transition-all duration-500 rounded-full"
                        :style="{ width: `${evaluation.score}%` }"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 优点 -->
              <div v-if="evaluation.strengths && evaluation.strengths.length > 0" class="mb-4">
                <h3 class="text-success-600 font-medium mb-3 flex items-center">
                  <CheckCircle class="w-5 h-5 mr-2" />
                  优点亮点
                </h3>
                <div class="space-y-2">
                  <div v-for="(strength, index) in evaluation.strengths" :key="`strength-${index}`"
                    class="bg-success-50 border border-success-200 border-l-4 border-l-success-500 rounded-lg p-3">
                    <div class="text-success-700 font-medium text-sm">{{ strength }}</div>
                  </div>
                </div>
              </div>

              <!-- 改进建议 -->
              <div v-if="evaluation.improvements && evaluation.improvements.length > 0" class="mb-4">
                <h3 class="text-warning-600 font-medium mb-3 flex items-center">
                  <AlertTriangle class="w-5 h-5 mr-2" />
                  改进建议
                </h3>
                <div class="space-y-3">
                  <div v-for="(item, index) in evaluation.improvements" :key="`improvement-${index}`"
                    class="bg-warning-50 border border-warning-200 border-l-4 border-l-warning-500 rounded-lg p-3">
                    <div class="text-warning-700 text-sm">{{ item }}</div>
                  </div>
                </div>
              </div>

              <!-- 总体反馈 -->
              <div class="border-t border-gray-200 pt-4">
                <h3 class="text-gray-900 font-medium mb-2">总体评价</h3>
                <p class="text-gray-600 text-sm leading-relaxed">
                  {{ evaluation.overall_feedback }}
                </p>
              </div>
            </div>
          </div>

          <!-- 语音识别状态 -->
          <div v-if="!isSpeechRecognitionSupported" class="mb-4">
            <div class="bg-error-50 border border-error-200 rounded-lg p-4 shadow-light">
              <div class="flex items-center">
                <AlertTriangle class="w-5 h-5 text-error-500 mr-2" />
                <div>
                  <h3 class="text-error-600 font-medium">语音识别不可用</h3>
                  <p class="text-error-600 text-sm">{{ recognitionStatus }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="recognitionStatus" class="mb-4">
            <div class="bg-success-50 border border-success-200 rounded-lg p-3 shadow-light">
              <div class="flex items-center">
                <CheckCircle class="w-4 h-4 text-success-500 mr-2" />
                <span class="text-success-600 text-sm">{{ recognitionStatus }}</span>
              </div>
            </div>
          </div>

          <!-- 处理状态 -->
          <div v-if="isProcessing" class="text-center py-8">
            <Loader2 class="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
            <div class="text-gray-500 mb-4">{{ processingStatus }}</div>
          </div>
        </div>
      </main>

      <!-- 历史记录侧边栏 -->
      <aside v-if="showHistory" :class="[
        'bg-white/90 backdrop-blur-sm border-l border-gray-200 p-3 md:p-4 overflow-y-auto shadow-light',
        'md:w-80',
        'fixed md:relative inset-0 md:inset-auto z-50 md:z-auto',
        'w-full md:w-80'
      ]">
        <div class="flex items-center justify-between mb-3 md:mb-4">
          <h2 class="text-lg font-semibold text-gray-900">历史记录</h2>
          <div class="flex items-center space-x-2">
            <!-- 清除历史按钮 -->
            <button v-if="historyRecords.length > 0" @click="confirmClearHistory"
              class="px-3 py-1.5 text-xs bg-white border border-error-200 text-error-600 rounded-lg hover:bg-error-50 transition-colors shadow-light"
              title="清除所有历史记录">
              清除
            </button>
            <!-- 移动端关闭按钮 -->
            <button @click="showHistory = false"
              class="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <ArrowLeft class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="space-y-3">
          <!-- 历史记录列表 -->
          <div v-for="record in historyRecords" :key="record.id"
            class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-primary-50 hover:border-primary-200 transition-all duration-200 hover:shadow-medium"
            @click="loadHistoryRecord(record)">
            <div class="flex items-center justify-between mb-2">
              <span class="text-primary-600 font-medium text-sm md:text-base">{{ record.score }}分</span>
              <span class="text-gray-400 text-xs">{{ formatDate(record.created_at) }}</span>
            </div>
            <p class="text-gray-600 text-xs md:text-sm line-clamp-2">
              {{ record.paraphrased_text.substring(0, 50) }}...
            </p>
          </div>

          <!-- 空状态提示 -->
          <div v-if="historyRecords.length === 0" class="text-center py-8">
            <div class="text-gray-500 text-sm">暂无历史记录</div>
            <div class="text-gray-400 text-xs mt-1">完成复述训练后会显示在这里</div>
          </div>
        </div>
      </aside>
    </div>

    <!-- 移动端遮罩层 -->
    <div
      v-if="showHistory"
      @click="showHistory = false"
      class="md:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Mic, Square, CheckCircle, AlertTriangle, Loader2
} from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { siliconFlowAPI } from '@/lib/siliconflow'
import { speechRecognizer, checkSpeechRecognitionCompatibility } from '@/lib/speechRecognition'
import { preventDoubleClickZoom, addSafeAreaSupport, isMobileDevice } from '@/utils/touch'
import type { Paragraph, UserParaphraseEvaluation } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const paragraph = ref<Paragraph | null>(null)
const isRecording = ref(false)
const isProcessing = ref(false)
const processingStatus = ref('')
const recordingTime = ref(0)
const transcribedText = ref('')
const evaluation = ref<EvaluationResult | null>(null)
const showHistory = ref(false)
const historyRecords = ref<UserParaphraseEvaluation[]>([])

// 录音相关
let recordingInterval: number | null = null
const isSpeechRecognitionSupported = ref(false)
const recognitionStatus = ref('')

// 类型定义
interface EvaluationResult {
  score: number
  strengths: string[]
  improvements: string[]
  overall_feedback: string
}

// 方法
const goBack = async () => {
  try {
    await router.push('/study')
  } catch (error) {
    console.error('路由跳转失败:', error)
    window.location.href = '/study'
  }
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getScoreLevel = (score: number) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '需要改进'
}

const checkSpeechRecognitionSupport = () => {
  const compatibility = checkSpeechRecognitionCompatibility()
  isSpeechRecognitionSupported.value = compatibility.supported

  if (!compatibility.supported) {
    recognitionStatus.value = compatibility.reason || '语音识别不可用'
  } else {
    recognitionStatus.value = compatibility.currentService === 'iflytek'
      ? '使用科大讯飞语音识别'
      : '使用浏览器原生语音识别'
  }
}

const startRecording = async () => {
  try {
    checkSpeechRecognitionSupport()

    if (!isSpeechRecognitionSupported.value) {
      alert(recognitionStatus.value)
      return
    }

    // 清理之前的状态
    transcribedText.value = ''
    evaluation.value = null

    isRecording.value = true
    recordingTime.value = 0

    // 开始计时
    recordingInterval = window.setInterval(() => {
      recordingTime.value++
    }, 1000)

    // 开始语音识别
    await speechRecognizer.startRecognition(
      (text) => {
        transcribedText.value = text
      },
      (error) => {
        console.error('语音识别错误:', error)
        alert(`语音识别失败: ${error}`)
        stopRecording()
      }
    )

  } catch (error) {
    console.error('启动语音识别失败:', error)
    alert(`启动失败: ${(error as Error).message || '未知错误'}`)
    stopRecording()
  }
}

const stopRecording = async () => {
  try {
    speechRecognizer.stopRecognition()
    isRecording.value = false

    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }

    // 如果有转录文本，开始AI评估
    if (transcribedText.value && transcribedText.value.trim().length > 0) {
      await processRecording()
    }

  } catch (error) {
    console.error('停止语音识别失败:', error)
    isRecording.value = false
    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }
  }
}

// 处理录音结果
const processRecording = async () => {
  if (!transcribedText.value?.trim() || !paragraph.value) return

  isProcessing.value = true
  processingStatus.value = '正在进行AI评估...'

  try {
    const result = await siliconFlowAPI.evaluateParaphrase(
      paragraph.value.content,
      transcribedText.value
    )

    // 解析AI返回的JSON结果
    let parsedEvaluation: EvaluationResult
    try {
      // 清理结果文本
      let cleanedResult = result.trim()
      cleanedResult = cleanedResult.replace(/^```json\s*\n?/i, '').replace(/\n?\s*```$/i, '')

      const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedEvaluation = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法解析AI响应')
      }
    } catch (parseError) {
      // 使用备用评估
      parsedEvaluation = {
        score: 70,
        strengths: ['已完成复述练习'],
        improvements: ['AI评估暂时不可用，请重试'],
        overall_feedback: '评估服务暂时不可用，这是一个基础评分。'
      }
    }

    evaluation.value = parsedEvaluation

    // 保存评估结果
    if (authStore.user && paragraph.value) {
      await saveEvaluation(transcribedText.value, parsedEvaluation)
    }

  } catch (error) {
    console.error('处理录音结果失败:', error)

    // 使用备用评估
    evaluation.value = {
      score: 60,
      strengths: ['已完成复述练习'],
      improvements: ['建议重新尝试'],
      overall_feedback: '评估服务暂时不可用，请稍后重试。'
    }
  } finally {
    isProcessing.value = false
    processingStatus.value = ''
  }
}

const saveEvaluation = async (paraphrasedText: string, evaluationResult: EvaluationResult) => {
  if (!authStore.user || !paragraph.value) return

  try {
    const { error } = await supabase
      .from('user_paraphrase_evaluations')
      .insert({
        user_id: authStore.user.id,
        paragraph_id: paragraph.value.id,
        paraphrased_text: paraphrasedText,
        evaluation_result: evaluationResult as any,
        score: evaluationResult.score
      })

    if (error) throw error

    await loadHistoryRecords()

  } catch (error) {
    console.error('保存评估结果失败:', error)
  }
}

const loadHistoryRecord = (record: UserParaphraseEvaluation) => {
  transcribedText.value = record.paraphrased_text
  evaluation.value = record.evaluation_result as EvaluationResult
}

const confirmClearHistory = () => {
  if (confirm('确定要清除所有历史记录吗？此操作无法撤销。')) {
    clearHistory()
  }
}

const clearHistory = async () => {
  if (!authStore.user || !paragraph.value) return

  try {
    const { error } = await supabase
      .from('user_paraphrase_evaluations')
      .delete()
      .eq('user_id', authStore.user.id)
      .eq('paragraph_id', paragraph.value.id)

    if (error) throw error

    historyRecords.value = []

  } catch (error) {
    console.error('清除历史记录失败:', error)
    alert(`清除历史记录失败: ${(error as Error).message || '未知错误'}`)
  }
}

const loadParagraph = async () => {
  const paragraphId = route.params.id as string
  if (!paragraphId) {
    router.push('/study')
    return
  }

  try {
    let { data, error } = await supabase
      .from('paragraphs')
      .select('*')
      .eq('custom_id', paragraphId)
      .single()

    if (error && error.code === 'PGRST116') {
      const result = await supabase
        .from('paragraphs')
        .select('*')
        .eq('id', paragraphId)
        .single()

      data = result.data
      error = result.error
    }

    if (error) throw error
    if (!data) throw new Error('段落不存在')

    paragraph.value = data

  } catch (error) {
    console.error('加载段落失败:', error)
    alert(`加载段落失败: ${(error as Error).message || '未知错误'}`)
    router.push('/study')
  }
}

const loadHistoryRecords = async () => {
  if (!authStore.user || !paragraph.value) return

  try {
    const { data, error } = await supabase
      .from('user_paraphrase_evaluations')
      .select('*')
      .eq('user_id', authStore.user.id)
      .eq('paragraph_id', paragraph.value.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    historyRecords.value = data || []
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

onMounted(async () => {
  try {
    await loadParagraph()
    if (authStore.user) {
      await loadHistoryRecords()
    }
    checkSpeechRecognitionSupport()

    if (isMobileDevice()) {
      addSafeAreaSupport()
      const mainElement = document.querySelector('main')
      if (mainElement) {
        preventDoubleClickZoom(mainElement)
      }
    }
  } catch (error) {
    console.error('组件初始化失败:', error)
  }
})

onUnmounted(() => {
  if (isRecording.value) {
    speechRecognizer.stopRecognition()
  }
  if (recordingInterval) {
    clearInterval(recordingInterval)
    recordingInterval = null
  }
})
</script>

<style scoped>
/* 安全区域支持 */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 文本截断 */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
