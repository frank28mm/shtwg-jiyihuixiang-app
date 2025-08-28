<template>
  <div class="min-h-screen bg-[#003049] flex flex-col safe-area-top safe-area-bottom">
    <!-- 顶部导航栏 -->
    <header class="border-b border-[#EAE2B7]/20 p-3 md:p-4">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-2 md:mb-0">
          <div class="flex items-center space-x-3 md:space-x-4">
            <button @click="goBack"
              class="p-2 hover:bg-[#EAE2B7]/10 rounded-md transition-colors text-[#EAE2B7]/65 hover:text-[#F77F00]">
              <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
              <h1 class="text-lg md:text-xl font-bold text-[#EAE2B7] flex items-center">
                <Mic class="w-4 h-4 md:w-5 md:h-5 mr-2 text-[#F77F00]" />
                复述训练
              </h1>
              <p class="text-[#EAE2B7]/65 text-xs md:text-sm hidden md:block">{{ paragraph?.title }}</p>
            </div>
          </div>
        </div>

        <!-- 移动端标题和历史记录按钮 -->
        <div class="md:hidden flex items-center justify-between">
          <p class="text-[#EAE2B7]/65 text-xs truncate flex-1 mr-3">{{ paragraph?.title }}</p>
          <button @click="showHistory = !showHistory"
            class="px-2 py-1 text-xs bg-transparent border border-[#EAE2B7]/30 text-[#EAE2B7]/65 rounded-md hover:bg-[#EAE2B7]/5 transition-colors whitespace-nowrap">
            {{ showHistory ? '隐藏' : '历史' }}
          </button>
        </div>

        <!-- 桌面端历史记录按钮 -->
        <div class="hidden md:block absolute top-4 right-4 space-x-2">
          <button @click="showHistory = !showHistory"
            class="px-3 py-1 text-sm bg-transparent border border-[#EAE2B7]/30 text-[#EAE2B7]/65 rounded-md hover:bg-[#EAE2B7]/5 transition-colors">
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
            <h2 class="text-lg font-semibold text-[#EAE2B7] mb-3 md:mb-4">原文内容</h2>
            <div class="bg-[#EAE2B7]/5 border border-[#EAE2B7]/20 rounded-lg p-4 md:p-6">
              <div class="text-[#EAE2B7] leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {{ paragraph?.content }}
              </div>
            </div>
          </div>

          <!-- 录音区域 -->
          <div class="mb-6 md:mb-8">
            <h2 class="text-lg font-semibold text-[#EAE2B7] mb-3 md:mb-4">语音复述</h2>
            <div class="bg-[#003049] border border-[#EAE2B7]/20 rounded-lg p-4 md:p-8 text-center">
              <!-- 录音状态显示 -->
              <div class="mb-4 md:mb-6">
                <div  :class="[
                  'w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center transition-all duration-300',
                  isRecording
                    ? 'bg-[#D62828]/20 border-2 border-[#D62828] animate-pulse'
                    : 'bg-[#F77F00]/10 border-2 border-[#F77F00] hover:bg-[#F77F00]/20'
                ]"></div>

                <div class="text-[#EAE2B7] mb-2 text-sm md:text-base">
                  {{ isRecording ? '正在录音...' : '点击开始录音' }}
                </div>

                <div v-if="recordingTime > 0" class="text-[#EAE2B7]/65 text-xs md:text-sm">
                  录音时长: {{ formatTime(recordingTime) }}
                </div>
              </div>

              <!-- 录音控制按钮 -->
              <div class="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button v-if="!isRecording" @click="startRecording" :disabled="isProcessing"
                  class="w-full sm:w-auto px-4 md:px-6 py-3 md:py-3 bg-[#F77F00] text-[#003049] rounded-lg hover:bg-[#F77F00]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm md:text-base min-h-[44px]">
                  <Mic class="w-4 h-4" />
                  <span>开始录音</span>
                </button>

                <button v-else @click="stopRecording"
                  class="w-full sm:w-auto px-4 md:px-6 py-3 md:py-3 bg-[#D62828] text-white rounded-lg hover:bg-[#D62828]/90 transition-colors font-medium flex items-center justify-center space-x-2 text-sm md:text-base min-h-[44px]">
                  <Square class="w-4 h-4" />
                  <span>停止录音</span>
                </button>

                <button v-if="audioBlob && !isRecording" @click="playRecording" :disabled="isPlaying"
                  class="w-full sm:w-auto px-4 py-3 bg-transparent border border-[#F77F00] text-[#F77F00] rounded-lg hover:bg-[#F77F00]/10 transition-colors disabled:opacity-50 flex items-center justify-center min-h-[44px]">
                  <Play v-if="!isPlaying" class="w-4 h-4" />
                  <Pause v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 转录文本 -->
          <div v-if="transcribedText" class="mb-6 md:mb-8">
            <h2 class="text-lg font-semibold text-[#EAE2B7] mb-3 md:mb-4">语音转录</h2>
            <div class="bg-[#EAE2B7]/5 border border-[#EAE2B7]/20 rounded-lg p-4 md:p-6">
              <div class="text-[#EAE2B7] leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {{ transcribedText }}
              </div>
            </div>
          </div>

          <!-- AI评估结果 -->
          <div v-if="evaluation" class="mb-6 md:mb-8">
            <h2 class="text-lg font-semibold text-[#EAE2B7] mb-3 md:mb-4">AI评估报告</h2>
            <div class="bg-[#003049] border border-[#EAE2B7]/20 rounded-lg p-6">
              <!-- 综合评分 -->
              <div class="flex items-center justify-between mb-6">
                <div class="text-3xl font-bold text-[#F77F00]">{{ evaluation.score }}分</div>
                <div class="text-right">
                  <div class="text-[#F77F00] font-bold text-lg">{{ getScoreLevel(evaluation.score) }}</div>
                  <div class="flex items-center space-x-2 mt-2">
                    <div class="w-32 h-2 bg-[#EAE2B7]/20 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-gradient-to-r from-[#D62828] via-[#FCBF49] to-[#F77F00] transition-all duration-500"
                        :style="{ width: `${evaluation.score}%` }"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 各维度评分 -->
              <div
                v-if="evaluation.accuracy_score || evaluation.completeness_score || evaluation.clarity_score || evaluation.presentation_score"
                class="mb-6">
                <h3 class="text-[#EAE2B7] font-medium mb-3">各维度评分</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="bg-[#EAE2B7]/5 rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-[#F77F00]">{{ evaluation.accuracy_score || 0 }}</div>
                    <div class="text-xs text-[#EAE2B7]/65">信息准确性</div>
                  </div>
                  <div class="bg-[#EAE2B7]/5 rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-[#F77F00]">{{ evaluation.completeness_score || 0 }}</div>
                    <div class="text-xs text-[#EAE2B7]/65">完整性</div>
                  </div>
                  <div class="bg-[#EAE2B7]/5 rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-[#F77F00]">{{ evaluation.clarity_score || 0 }}</div>
                    <div class="text-xs text-[#EAE2B7]/65">表达清晰度</div>
                  </div>
                  <div class="bg-[#EAE2B7]/5 rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-[#F77F00]">{{ evaluation.presentation_score || 0 }}</div>
                    <div class="text-xs text-[#EAE2B7]/65">讲解技巧</div>
                  </div>
                </div>
              </div>

              <!-- 优点 -->
              <div v-if="evaluation.strengths && evaluation.strengths.length > 0" class="mb-4">
                <h3 class="text-[#F77F00] font-medium mb-3 flex items-center">
                  <CheckCircle class="w-5 h-5 mr-2" />
                  优点亮点
                </h3>
                <div class="space-y-2">
                  <div  v-for="(strength, index) in evaluation.strengths"   :key="`strength-${index}`"
                    class="bg-[#F77F00]/10 border-l-4 border-[#F77F00] rounded-r-lg p-3">
                    <div class="text-[#F77F00] font-medium text-sm">{{ strength }}</div>
                  </div>
                </div>
              </div>

              <!-- 改进建议 -->
              <div v-if="evaluation.improvements && evaluation.improvements.length > 0" class="mb-4">
                <h3 class="text-[#FCBF49] font-medium mb-3 flex items-center">
                  <AlertTriangle class="w-5 h-5 mr-2" />
                  改进建议
                </h3>
                <div class="space-y-3">
                  <div  v-for="(item, index) in evaluation.improvements"   :key="`improvement-${index}`"
                    class="bg-[#FCBF49]/10 border-l-4 border-[#FCBF49] rounded-r-lg p-3">
                    <div v-if="typeof item === 'object' && item !== null && 'issue' in item"
                      class="text-[#FCBF49] font-medium text-sm mb-1">{{ item.issue }}</div>
                    <div v-if="typeof item === 'object' && item !== null && 'suggestion' in item"
                      class="text-[#EAE2B7]/80 text-xs">{{ item.suggestion }}</div>
                    <div v-else-if="typeof item === 'string'" class="text-[#EAE2B7]/80 text-sm">{{ item }}</div>
                  </div>
                </div>
              </div>

              <!-- 关键词汇建议 -->
              <div v-if="evaluation.key_terms && evaluation.key_terms.length > 0" class="mb-4">
                <h3 class="text-[#EAE2B7] font-medium mb-2 flex items-center">
                  <BookOpen class="w-4 h-4 mr-2" />
                  关键词汇建议
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span  v-for="term in evaluation.key_terms"   :key="`term-${term}`"
                    class="px-2 py-1 bg-[#EAE2B7]/20 text-[#EAE2B7] text-xs rounded-full">{{ term }}</span>
                </div>
              </div>

              <!-- 讲解技巧建议 -->
              <div v-if="evaluation.presentation_tips && evaluation.presentation_tips.length > 0" class="mb-4">
                <h3 class="text-[#EAE2B7] font-medium mb-2 flex items-center">
                  <Mic class="w-4 h-4 mr-2" />
                  讲解技巧建议
                </h3>
                <div class="space-y-2">
                  <div  v-for="(tip, index) in evaluation.presentation_tips"   :key="index"
                    class="text-[#EAE2B7]/80 text-sm bg-[#EAE2B7]/5 rounded-lg p-2">{{ tip }}</div>
                </div>
              </div>

              <!-- 总体反馈 -->
              <div class="border-t border-[#EAE2B7]/20 pt-4">
                <h3 class="text-[#EAE2B7] font-medium mb-2">总体评价</h3>
                <p class="text-[#EAE2B7]/80 text-sm leading-relaxed">
                  {{ evaluation.overall_feedback }}
                </p>
              </div>
            </div>
          </div>

          <!-- 语音识别状态 -->
          <div v-if="!isSpeechRecognitionSupported" class="mb-4">
            <div class="bg-[#D62828]/10 border border-[#D62828]/20 rounded-lg p-4">
              <div class="flex items-center">
                <AlertTriangle class="w-5 h-5 text-[#D62828] mr-2" />
                <div>
                  <h3 class="text-[#D62828] font-medium">语音识别不可用</h3>
                  <p class="text-[#D62828]/80 text-sm">{{ recognitionStatus }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="recognitionStatus" class="mb-4">
            <div class="bg-[#F77F00]/10 border border-[#F77F00]/20 rounded-lg p-3">
              <div class="flex items-center">
                <CheckCircle class="w-4 h-4 text-[#F77F00] mr-2" />
                <span class="text-[#F77F00] text-sm">{{ recognitionStatus }}</span>
              </div>
            </div>
          </div>

          <!-- 处理状态 -->
          <div v-if="isProcessing" class="text-center py-8">
            <Loader2 class="w-8 h-8 text-[#F77F00] animate-spin mx-auto mb-4" />
            <div class="text-[#EAE2B7]/65 mb-4">{{ processingStatus }}</div>

            <!-- AI思考过程显示 -->
            <div v-if="aiThinkingSteps.length > 0" class="max-w-2xl mx-auto">
              <div class="bg-[#EAE2B7]/5 border border-[#EAE2B7]/20 rounded-lg p-4 text-left">
                <h3 class="text-[#F77F00] font-medium mb-2">AI思考过程：</h3>
                <div class="space-y-2">
                  <div  v-for="(step, index) in aiThinkingSteps"   :key="index"
                    class="text-[#EAE2B7]/70 text-sm flex items-start">
                    <span  :class="[
                      'w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0',
                      step.status === 'processing' ? 'bg-[#F77F00] animate-pulse' :
                        step.status === 'completed' ? 'bg-[#008000]' :
                          'bg-[#EAE2B7]/30'
                    ]"></span>
                    <span>{{ step.text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 历史记录侧边栏 -->
      <aside  v-if="showHistory"   :class="[
        'border-l border-[#EAE2B7]/20 p-3 md:p-4 overflow-y-auto',
        'md:w-80',
        'fixed md:relative inset-0 md:inset-auto z-50 md:z-auto',
        'bg-[#003049] md:bg-transparent',
        'w-full md:w-80'
      ]">
        <div class="flex items-center justify-between mb-3 md:mb-4">
          <h2 class="text-lg font-semibold text-[#EAE2B7]">历史记录</h2>
          <div class="flex items-center space-x-2">
            <!-- 清除历史按钮 -->
            <button v-if="historyRecords.length > 0" @click="confirmClearHistory"
              class="px-2 py-1 text-xs bg-transparent border border-[#D62828]/50 text-[#D62828] rounded-md hover:bg-[#D62828]/10 transition-colors"
              title="清除所有历史记录">
              清除
            </button>
            <!-- 移动端关闭按钮 -->
            <button  @click="showHistory = false"
              class="md:hidden p-2 hover:bg-[#EAE2B7]/10 rounded-md transition-colors text-[#EAE2B7]/65">
              <ArrowLeft class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="space-y-3">
          <!-- 历史记录列表 -->
          <div  v-for="record in historyRecords"   :key="record.id"
            class="bg-[#EAE2B7]/5 border border-[#EAE2B7]/20 rounded-lg p-3 cursor-pointer hover:bg-[#EAE2B7]/10 transition-colors"
            @click="loadHistoryRecord(record)">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[#F77F00] font-medium text-sm md:text-base">{{ record.score }}分</span>
              <span class="text-[#EAE2B7]/50 text-xs">{{ formatDate(record.created_at) }}</span>
            </div>
            <p class="text-[#EAE2B7]/80 text-xs md:text-sm line-clamp-2">
              {{ record.paraphrased_text.substring(0, 50) }}...
            </p>
          </div>

          <!-- 空状态提示 -->
          <div v-if="historyRecords.length === 0" class="text-center py-8">
            <div class="text-[#EAE2B7]/50 text-sm">暂无历史记录</div>
            <div class="text-[#EAE2B7]/30 text-xs mt-1">完成复述训练后会显示在这里</div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Mic, Square, Play, Pause, CheckCircle, AlertTriangle, Loader2, BookOpen
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
const isPlaying = ref(false)
const isProcessing = ref(false)
const processingStatus = ref('')
const recordingTime = ref(0)
const audioBlob = ref<Blob | null>(null)
const transcribedText = ref('')
const evaluation = ref<EvaluationResult | null>(null)
const showHistory = ref(false)
const historyRecords = ref<UserParaphraseEvaluation[]>([])
const aiThinkingSteps = ref<Array<{
  text: string
  status: 'pending' | 'processing' | 'completed'
}>>([])
const error = ref<string | null>(null) // For general error messages
const evaluationResult = ref<any>(null) // To store the result of the evaluation process
const currentStep = ref<'input' | 'evaluating' | 'result'>('input') // To track the progress state

// 录音相关
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordingInterval: number | null = null
let audioElement: HTMLAudioElement | null = null
const isSpeechRecognitionSupported = ref(false)
const recognitionStatus = ref('')
const usingIFlytek = ref(false) // Not used in the current logic, but kept for potential future use.
const recordedText = ref('') // Renamed from transcribedText for clarity within processRecording
const isEvaluating = ref(false)
const evaluationProgress = ref('')
const abortController = ref<AbortController | null>(null) // For cancelling requests

// 方法
const goBack = async () => {
  try {
    await router.push('/study')
  } catch (error) {
    console.error('路由跳转失败:', error)
    // 强制跳转
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
  usingIFlytek.value = compatibility.currentService === 'iflytek'

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
    // 检查语音识别支持
    checkSpeechRecognitionSupport()

    if (!isSpeechRecognitionSupported.value) {
      alert(recognitionStatus.value)
      return
    }

    // 清理之前的录音状态
    if (audioBlob.value) {
      audioBlob.value = null
    }
    if (transcribedText.value) {
      transcribedText.value = ''
    }
    if (evaluation.value) {
      evaluation.value = null
    }

    isRecording.value = true
    recordingTime.value = 0
    currentStep.value = 'input' // Reset to input step

    // 开始计时
    recordingInterval = window.setInterval(() => {
      recordingTime.value++
    }, 1000)

    console.log('开始语音识别...', recognitionStatus.value)

    // 使用新的语音识别服务
    await speechRecognizer.startRecognition(
      (text) => {
        console.log('语音识别结果:', text)
        transcribedText.value = text // Update the displayed transcribed text
        recordedText.value = text // Also update the internal variable used by processRecording
        // AI评估在停止录音时触发，这里只更新转录文本
      },
      (error) => {
        console.error('语音识别错误:', error)
        alert(`语音识别失败: ${error}`)
        stopRecording() // 停止录音并清理
      }
    )

  } catch (error) {
    console.error('启动语音识别失败:', error)
    alert(`启动失败: ${(error as Error).message || '未知错误'}`)
    stopRecording() // 停止录音并清理
  }
}

const stopRecording = async () => {
  try {
    // 停止语音识别
    speechRecognizer.stopRecognition()

    isRecording.value = false

    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }

    console.log('语音识别已停止')

    // 如果有转录文本，开始AI评估
    if (transcribedText.value && transcribedText.value.trim().length > 0) {
      await processRecording()
    } else {
      // 如果没有转录文本，可能需要清理状态或提示用户
      // 例如： 如果录音时间很短，可能没有有效的转录
      if (recordingTime.value < 1) {
        alert('录音时间太短，未能获取有效语音。')
      }
      // 重置录音状态，允许用户重新开始
      recordingTime.value = 0
      audioBlob.value = null
    }

  } catch (error) {
    console.error('停止语音识别失败:', error)
    // 确保即使停止失败，也清理相关状态
    isRecording.value = false
    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }
  }
}

// 类型定义
interface EvaluationResult {
  score: number
  strengths: string[]
  improvements: (string | { issue: string; suggestion: string })[]
  overall_feedback: string
  evaluation_type?: 'ai' | 'fallback' | 'low_quality'
  similarity_score?: number
  quality_issues?: string[]
  error_message?: string
  accuracy_score?: number
  completeness_score?: number
  clarity_score?: number
  presentation_score?: number
  key_terms?: string[]
  presentation_tips?: string[]
}

interface QualityCheckResult {
  isValid: boolean
  reason: 'empty' | 'too_short' | 'repeated_content' | 'too_short_compared' | 'valid'
  score: number | null
}

// 分析转录文本质量
const analyzeTranscriptionQuality = (text: string, originalContent: string): QualityCheckResult => {
  if (!text || text.trim().length === 0) {
    return { isValid: false, reason: 'empty', score: 0 }
  }

  const cleanText = text.trim()
  const wordCount = cleanText.length
  const originalWordCount = originalContent.length

  // 长度检查
  if (wordCount < 10) {
    return { isValid: false, reason: 'too_short', score: 20 }
  }

  // 重复内容检查
  const repeatedPattern = /(.)\1{4,}/g
  if (repeatedPattern.test(cleanText)) {
    return { isValid: false, reason: 'repeated_content', score: 25 }
  }

  // 长度比例检查
  const lengthRatio = originalWordCount > 0 ? wordCount / originalContent.length : 0
  if (lengthRatio < 0.3) {
    return { isValid: false, reason: 'too_short_compared', score: 30 }
  }

  return { isValid: true, reason: 'valid', score: null }
}

// 计算文本相似度 (Jaccard 相似度)
const calculateSimilarity = (text1: string, text2: string): number => {
  const clean1 = text1.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase()
  const clean2 = text2.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase()

  if (clean1.length === 0 || clean2.length === 0) return 0

  const set1 = new Set(clean1)
  const set2 = new Set(clean2)
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return union.size > 0 ? intersection.size / union.size : 0
}

// 生成低质量内容的评估结果
const generateFallbackEvaluation = (qualityCheck: QualityCheckResult): EvaluationResult => {
  const reasonMessages: Record<string, { strengths: string[], improvements: string[], feedback: string, score: number }> = {
    empty: {
      strengths: [],
      improvements: ['请确保录音设备工作正常', '尝试重新录制您的复述'],
      feedback: '未检测到有效的语音内容，请重新录制。',
      score: 0
    },
    too_short: {
      strengths: [],
      improvements: ['请完整地复述整个段落内容', '建议先仔细阅读原文'],
      feedback: '复述内容过于简短，请尝试更完整地表达。',
      score: 20
    },
    repeated_content: {
      strengths: [],
      improvements: ['请避免重复的口语表达', '建议重新组织语言'],
      feedback: '检测到重复内容，请重新录制。',
      score: 25
    },
    too_short_compared: {
      strengths: ['已尝试进行复述'],
      improvements: ['需要包含更多原文中的关键信息', '建议重新阅读并理解原文'],
      feedback: '复述内容相对原文过短，请尝试更完整地表达。',
      score: 30
    }
  }

  const messages = reasonMessages[qualityCheck.reason] || reasonMessages.empty

  return {
    score: messages.score,
    strengths: messages.strengths,
    improvements: messages.improvements,
    overall_feedback: messages.feedback,
    evaluation_type: 'low_quality',
    quality_issues: [qualityCheck.reason]
  }
}

// 生成智能评估结果
const generateIntelligentEvaluation = (transcribedText: string, originalContent: string, similarity: number): EvaluationResult => {
  const evaluation: EvaluationResult = {
    score: 0,
    strengths: [],
    improvements: [],
    overall_feedback: '',
    evaluation_type: 'fallback',
    similarity_score: similarity
  }

  // 基于相似度的分数计算
  if (similarity >= 0.8) {
    evaluation.score = Math.floor(Math.random() * 10) + 85 // 85-95
    evaluation.strengths.push('内容表达非常准确', '很好地抓住了核心要点')
    if (transcribedText.length >= originalContent.length * 0.8) {
      evaluation.strengths.push('复述内容详细完整')
    }
    evaluation.overall_feedback = '优秀的复述！您很好地理解并表达了原文内容。'
  } else if (similarity >= 0.6) {
    evaluation.score = Math.floor(Math.random() * 15) + 70 // 70-85
    evaluation.strengths.push('基本掌握了主要内容', '表达思路清晰')
    evaluation.improvements.push('可以更准确地表达一些细节', '建议加强对专业术语的记忆')
    evaluation.overall_feedback = '良好的复述表现，继续努力可以达到更高水平。'
  } else if (similarity >= 0.4) {
    evaluation.score = Math.floor(Math.random() * 15) + 55 // 55-70
    evaluation.strengths.push('已经理解了部分内容')
    evaluation.improvements.push('需要更仔细地理解原文内容', '建议多练习几次', '注意抓住文章的重点信息')
    evaluation.overall_feedback = '有一定基础，但还需要加强对内容的理解和记忆。'
  } else {
    evaluation.score = Math.floor(Math.random() * 15) + 40 // 40-55
    evaluation.improvements.push('建议重新阅读原文', '理解核心概念后再进行复述', '可以先进行填空练习来加强记忆')
    evaluation.overall_feedback = '建议先通过其他练习方式加强对内容的理解，然后再进行复述练习。'
  }

  // 根据长度给出额外建议
  const lengthRatio = originalContent.length > 0 ? transcribedText.length / originalContent.length : 0
  if (lengthRatio < 0.5) {
    evaluation.improvements.push('复述内容可以更加详细完整')
  } else if (lengthRatio > 1.5) {
    evaluation.improvements.push('表达可以更加简洁明了')
  }

  return evaluation
}

// 处理录音结果
const processRecording = async () => {
  console.log('🚀 [DEBUG] 开始处理录音结果...')

  if (!recordedText.value?.trim()) {
    console.warn('⚠️ [WARNING] 录音文本为空')
    return
  }

  console.log('📝 [DEBUG] 转录文本:', recordedText.value)
  console.log('📖 [DEBUG] 原文内容:', paragraph.value?.content)

  // 内容质量检测
  const qualityCheck = analyzeTranscriptionQuality(recordedText.value, paragraph.value?.content || '')

  if (!qualityCheck.isValid) {
    // 使用预设的评估结果
    const fallbackEvaluation = generateFallbackEvaluation(qualityCheck)
    evaluation.value = fallbackEvaluation
    console.log('⚠️ [DEBUG] 使用备用评估结果:', fallbackEvaluation)
    // 保存评估结果
    if (authStore.user && paragraph.value) {
      try {
        await saveEvaluation(recordedText.value, fallbackEvaluation)
      } catch (saveError) {
        console.error('❌ [ERROR] 保存评估结果失败:', saveError)
      }
    }
    return
  }

  // 设置默认状态
  isEvaluating.value = true
  evaluationProgress.value = ''
  evaluation.value = null

  try {
    console.log('🤖 [DEBUG] 尝试调用AI评估...')

    // 创建新的AbortController，确保之前的请求被取消
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
    abortController.value = new AbortController()

    // 设置超时机制（25秒）
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        if (abortController.value && !abortController.value.signal.aborted) {
          abortController.value.abort()
          reject(new Error('AI评估超时'))
        }
      }, 25000)
    })

    let result: string
    let aiEvaluationSuccess = false

    try {
      // 使用Promise.race确保超时处理
      result = await Promise.race([
        siliconFlowAPI.evaluateParaphrase(
          paragraph.value?.content || '',
          recordedText.value,
          (progress) => {
            // 流式更新评估进度
            evaluationProgress.value = progress
            console.log('📊 [DEBUG] 评估进度:', progress.length, '字符')
          },
          abortController.value.signal
        ),
        timeoutPromise
      ])
      
      aiEvaluationSuccess = true
      console.log('✅ [DEBUG] AI评估成功:', result.substring(0, 200) + '...')

    } catch (apiError) {
      // 检查是否是用户取消操作
      if (abortController.value?.signal.aborted || (apiError as Error).name === 'AbortError') {
        console.log('🛑 [DEBUG] AI评估被取消')
        return
      }

      console.error('❌ [ERROR] AI API调用失败:', apiError)
      throw apiError // 重新抛出错误，让外层catch处理
    }

    // 解析AI返回的JSON结果
    let parsedEvaluation: EvaluationResult
    try {
      // 清理结果文本，移除可能的markdown标记
      let cleanedResult = result.trim()
      
      // 移除可能的markdown代码块标记
      cleanedResult = cleanedResult.replace(/^```json\s*\n?/i, '').replace(/\n?\s*```$/i, '')
      cleanedResult = cleanedResult.replace(/^```\s*\n?/i, '').replace(/\n?\s*```$/i, '')
      
      // 尝试找到JSON内容
      const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[0]
        parsedEvaluation = JSON.parse(jsonStr)
        
        // 验证必要字段
        if (typeof parsedEvaluation.score !== 'number' || 
            !Array.isArray(parsedEvaluation.strengths) || 
            !Array.isArray(parsedEvaluation.improvements)) {
          throw new Error('AI返回的JSON格式不完整')
        }
        
        // 确保分数在合理范围内
        if (parsedEvaluation.score < 0 || parsedEvaluation.score > 100) {
          parsedEvaluation.score = Math.max(0, Math.min(100, parsedEvaluation.score))
        }
        
        console.log('✅ [DEBUG] JSON解析成功:', parsedEvaluation.score, '分')
        
      } else {
        throw new Error('无法从AI响应中提取JSON')
      }
    } catch (parseError) {
      console.warn('⚠️ [WARNING] 解析AI评估结果失败:', parseError)
      console.warn('⚠️ [WARNING] 原始AI响应前200字符:', result.substring(0, 200))
      
      // 使用智能备用评估
      parsedEvaluation = generateIntelligentEvaluation(
        recordedText.value, 
        paragraph.value?.content || '', 
        calculateSimilarity(recordedText.value, paragraph.value?.content || '')
      )
      aiEvaluationSuccess = false
    }

    // 补充评估元数据
    const finalEvaluation: EvaluationResult = {
      ...parsedEvaluation,
      similarity_score: calculateSimilarity(recordedText.value, paragraph.value?.content || ''),
      evaluation_type: aiEvaluationSuccess ? 'ai' : 'fallback'
    }
    
    evaluation.value = finalEvaluation

    // 保存评估结果
    if (authStore.user && paragraph.value) {
      try {
        await saveEvaluation(recordedText.value, finalEvaluation)
      } catch (saveError) {
        console.error('❌ [ERROR] 保存评估结果失败:', saveError)
      }
    }

  } catch (error) {
    // 检查是否是取消操作
    if (abortController.value?.signal.aborted || (error as Error).name === 'AbortError') {
      console.log('🛑 [DEBUG] 操作已取消')
      return
    }

    console.error('❌ [ERROR] 处理录音结果时发生错误:', error)

    // 使用智能备用评估作为最终方案
    try {
      const fallbackEvaluation = generateIntelligentEvaluation(
        recordedText.value,
        paragraph.value?.content || '',
        calculateSimilarity(recordedText.value, paragraph.value?.content || '')
      )
      evaluation.value = fallbackEvaluation

      // 保存备用评估结果
      if (authStore.user && paragraph.value) {
        await saveEvaluation(recordedText.value, fallbackEvaluation)
      }

      console.log('🔄 [DEBUG] 使用最终备用评估:', evaluation.value.score, '分')
    } catch (fallbackError) {
      console.error('❌ [ERROR] 备用评估也失败:', fallbackError)
      // 设置一个最基本的评估结果
      evaluation.value = {
        score: 60,
        strengths: ['已完成复述练习'],
        improvements: ['建议重新尝试'],
        overall_feedback: '评估服务暂时不可用，请稍后重试。',
        evaluation_type: 'error'
      }
    }
  } finally {
    // 确保状态清理
    isEvaluating.value = false
    evaluationProgress.value = ''
    
    // 清理AbortController
    if (abortController.value) {
      abortController.value = null
    }
  }
}

const saveEvaluation = async (paraphrasedText: string, evaluationResult: EvaluationResult) => {
  if (!authStore.user || !paragraph.value) return

  try {
    const { error } = await supabase
      .from('user_paraphrase_evaluations')
      .insert({
        user_id: authStore.user.id,
        paragraph_id: paragraph.value.id, // Assuming paragraph.value.id is the UUID
        paraphrased_text: paraphrasedText,
        evaluation_result: evaluationResult as any, // Use type assertion to bypass strict checks if needed
        score: evaluationResult.score
      })

    if (error) throw error

    // 刷新历史记录
    await loadHistoryRecords()

  } catch (error) {
    console.error('保存评估结果失败:', error)
  }
}

const loadHistoryRecord = (record: UserParaphraseEvaluation) => {
  transcribedText.value = record.paraphrased_text
  recordedText.value = record.paraphrased_text // Ensure recordedText is also updated
  evaluation.value = record.evaluation_result as EvaluationResult
}

// 确认清除历史记录
const confirmClearHistory = () => {
  if (confirm('确定要清除所有历史记录吗？此操作无法撤销。')) {
    clearHistory()
  }
}

// 清除历史记录
const clearHistory = async () => {
  if (!authStore.user || !paragraph.value) return

  try {
    const { error } = await supabase
      .from('user_paraphrase_evaluations')
      .delete()
      .eq('user_id', authStore.user.id)
      .eq('paragraph_id', paragraph.value.id)

    if (error) {
      console.error('清除历史记录错误:', error)
      throw error
    }

    // 清空本地历史记录
    historyRecords.value = []

    console.log('历史记录已清除')

    // 可选：显示成功提示
    // alert('历史记录已清除')

  } catch (error) {
    console.error('清除历史记录失败:', error)
    alert(`清除历史记录失败: ${(error as Error).message || '未知错误'}`)
  }
}

const loadParagraph = async () => {
  const paragraphId = route.params.id as string
  if (!paragraphId) {
    console.error('缺少段落ID参数')
    router.push('/study').catch(err => console.error('路由跳转失败:', err))
    return
  }

  try {
    console.log('正在加载段落:', paragraphId)

    // 首先尝试使用custom_id查询
    let { data, error } = await supabase
      .from('paragraphs')
      .select('*')
      .eq('custom_id', paragraphId)
      .single()

    // 如果custom_id查询失败，尝试使用id查询
    if (error && error.code === 'PGRST116') {
      console.log('custom_id查询失败，尝试使用id查询...')
      const result = await supabase
        .from('paragraphs')
        .select('*')
        .eq('id', paragraphId)
        .single()

      data = result.data
      error = result.error
    }

    if (error) {
      console.error('数据库查询错误:', error)
      throw error
    }

    if (!data) {
      console.error('未找到段落:', paragraphId)
      throw new Error('段落不存在')
    }

    paragraph.value = data
    console.log('段落加载成功:', data.title)

  } catch (error) {
    console.error('加载段落失败:', error)

    // 尝试从本地JSON文件加载作为备用方案
    try {
      console.log('尝试从本地文件加载段落...')
      const response = await fetch('/shanghai_astronomy_museum.json')
      if (response.ok) {
        const paragraphsData = await response.json()
        const found = paragraphsData.find((p: any) => p.id === paragraphId || p.custom_id === paragraphId)

        if (found) {
          paragraph.value = {
            id: found.id,
            title: found.title,
            content: found.content,
            section: found.section,
            order_index: found.order_index || 0,
            fill_blanks: found.fill_blanks || [],
            potential_qa: found.potential_qa || [],
            created_at: new Date().toISOString()
          }
          console.log('从本地文件成功加载段落:', found.title)
          return
        }
      }
    } catch (localError) {
      console.warn('本地文件加载也失败:', localError)
    }

    // 如果所有方法都失败，显示错误并返回
    alert(`加载段落失败: ${(error as Error).message || '未知错误'}\n段落ID: ${paragraphId}`)
    router.push('/study').catch(err => console.error('路由跳转失败:', err))
  }
}

const loadHistoryRecords = async () => {
  if (!authStore.user || !paragraph.value) return

  try {
    const { data, error } = await supabase
      .from('user_paraphrase_evaluations')
      .select('*')
      .eq('user_id', authStore.user.id)
      .eq('paragraph_id', paragraph.value.id) // Use the actual UUID primary key
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('历史记录查询错误:', error)
      throw error
    }

    historyRecords.value = data || []
    console.log(`加载了 ${data?.length || 0} 条历史记录`)
  } catch (error) {
    console.error('加载历史记录失败:', error)
    // History loading failure is not critical, so just log it.
  }
}

// 全局错误处理函数
let handleUnhandledRejection: ((event: PromiseRejectionEvent) => void) | null = null

// 组件挂载
onMounted(async () => {
  try {
    await loadParagraph()
    if (authStore.user) { // Load history only if user is logged in
      await loadHistoryRecords()
    }
    checkSpeechRecognitionSupport()

    // 移动端优化
    if (isMobileDevice()) {
      addSafeAreaSupport()
      // 防止双击缩放
      const mainElement = document.querySelector('main')
      if (mainElement) {
        preventDoubleClickZoom(mainElement)
      }
    }

    // 添加全局未处理Promise拒绝的监听
    handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 [ERROR] 未处理的Promise拒绝:', event.reason)
      event.preventDefault() // 防止错误传播到控制台
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
  } catch (error) {
    console.error('组件初始化失败:', error)
  }
})

// 组件销毁时的清理
onUnmounted(() => {
  try {
    // 移除全局监听器
    if (handleUnhandledRejection) {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      handleUnhandledRejection = null
    }

    // 取消任何进行中的请求
    if (abortController.value) {
      abortController.value.abort()
    }

    // 停止语音识别
    if (isRecording.value) {
      speechRecognizer.stopRecognition()
    }
    // 清理录音计时器
    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }
    // 停止音频播放
    if (audioElement) {
      audioElement.pause()
      if (audioElement.src) {
        URL.revokeObjectURL(audioElement.src)
      }
      audioElement = null
    }
  } catch (error) {
    console.error('组件清理失败:', error)
  }
})

// 播放录音
const playRecording = async () => {
  if (!audioBlob.value) return

  if (isPlaying.value) {
    if (audioElement) {
      audioElement.pause()
      isPlaying.value = false
    }
    return
  }

  try {
    isPlaying.value = true
    if (!audioElement) {
      audioElement = new Audio()
    }
    const url = URL.createObjectURL(audioBlob.value)
    audioElement.src = url
    audioElement.play()

    audioElement.onended = () => {
      isPlaying.value = false
      // Clean up the object URL after playback
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    console.error('播放录音失败:', err)
    isPlaying.value = false
    alert('播放录音失败')
  }
}

</script>