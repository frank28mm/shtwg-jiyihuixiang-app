
<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900 relative">
    <!-- 移动端菜单按钮 -->
    <button
      @click="toggleMobileMenu"
      class="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-md text-gray-700 hover:text-primary-600 transition-colors shadow-light"
    >
      <Menu v-if="!showMobileMenu" class="w-5 h-5" />
      <X v-else class="w-5 h-5" />
    </button>

    <!-- 左侧导航面板 -->
    <div :class="[
      'bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out shadow-light',
      'md:w-80 md:relative md:translate-x-0',
      'fixed inset-y-0 left-0 w-80 z-40',
      showMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]">
      <!-- 顶部信息区域 -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">天文馆导览</h2>
          <button
            @click="goToWelcome"
            class="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="返回首页"
          >
            <Home class="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <!-- 导航内容 -->
      <div class="flex-1 overflow-y-auto p-4">
        <nav class="space-y-2">
          <div v-for="section in sections" :key="section.name" class="mb-4">
            <!-- 展区标题 -->
            <div class="flex items-center justify-between mb-2 cursor-pointer" @click="toggleSection(section)">
              <h3 class="text-gray-900 font-medium text-sm uppercase tracking-wide">
                {{ section.name }}
              </h3>
              <ChevronDown
                :class="['w-4 h-4 text-gray-500 transition-transform',
                         section.expanded ? 'rotate-180' : '']"
              />
            </div>

            <!-- 模块和段落列表 -->
            <div v-show="section.expanded" class="space-y-1 ml-2">
              <div v-for="module in section.modules" :key="module.name" class="mb-3">
                <!-- 模块标题 -->
                <div class="flex items-center justify-between mb-1 cursor-pointer" @click="toggleModule(module)">
                  <h4 class="text-gray-700 font-medium text-xs uppercase tracking-wide px-2">
                    {{ module.name }}
                  </h4>
                  <ChevronDown
                    :class="['w-3 h-3 text-gray-400 transition-transform',
                             module.expanded ? 'rotate-180' : '']"
                  />
                </div>

                <!-- 段落列表 -->
                <div v-show="module.expanded" class="space-y-1 ml-3">
                  <button
                    v-for="paragraph in module.paragraphs"
                    :key="paragraph.id"
                    @click="selectParagraph(paragraph)"
                    :class="[
                      'w-full text-left px-3 py-3 rounded-lg text-sm transition-all hover:shadow-light',
                      'border border-transparent',
                      selectedParagraph?.id === paragraph.id
                        ? 'text-primary-600 bg-primary-50 border-primary-200 shadow-light'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:border-gray-200'
                    ]"
                  >
                    {{ paragraph.title }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>

    <!-- 移动端遮罩层 -->
    <div
      v-if="showMobileMenu"
      @click="showMobileMenu = false"
      class="md:hidden fixed inset-0 bg-black/20 z-30 backdrop-blur-sm"
    ></div>

    <!-- 主内容区域 -->
    <div class="flex-1 flex flex-col relative md:ml-0" :class="{ 'ml-0': !showMobileMenu }">
      <!-- 内容展示区 -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0" :style="{ paddingBottom: selectedParagraph ? '100px' : '32px' }">
        <div v-if="selectedParagraph" class="max-w-4xl mx-auto">
          <!-- 标题和元信息 -->
          <div class="mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {{ selectedParagraph.title }}
            </h1>
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>{{ selectedParagraph.section }}</span>
              </div>
            </div>
          </div>

          <!-- 内容展示 -->
          <div class="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 md:p-8 mb-8 shadow-light">
            <div class="prose prose-gray max-w-none">
              <div class="text-gray-600 leading-relaxed text-base md:text-lg whitespace-pre-wrap">{{ selectedParagraph.content }}</div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex items-center justify-center h-full">
          <div class="text-center">
            <BookOpen class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500 text-lg">请选择一个展品开始了解</p>
          </div>
        </div>
      </div>

      <!-- 固定底部操作按钮 -->
      <div v-if="selectedParagraph" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-white/80 backdrop-blur-sm border-t border-gray-200 p-4 md:p-6 safe-area-bottom">
        <div class="max-w-4xl mx-auto flex justify-center">
          <!-- 天文馆AI讲解员按钮 -->
          <button
            @click="openAiChat"
            class="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-heavy hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <MessageCircle class="w-4 h-4 md:w-5 md:h-5" />
            向AI讲解员提问
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChevronDown, BookOpen, MessageCircle, Menu, X, Home
} from 'lucide-vue-next'
import { TouchGestureHandler, preventDoubleClickZoom, addSafeAreaSupport, isMobileDevice } from '@/utils/touch'

const router = useRouter()

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

// 响应式数据
const sections = ref<Array<{
  name: string;
  expanded: boolean;
  modules: Array<{
    name: string;
    expanded: boolean;
    paragraphs: Paragraph[];
  }>;
}>>([])
const selectedParagraph = ref<Paragraph | null>(null)
const showMobileMenu = ref(false)

// 方法
const toggleSection = (section: any) => {
  section.expanded = !section.expanded
}

const toggleModule = (module: any) => {
  module.expanded = !module.expanded
}

const selectParagraph = (paragraph: Paragraph) => {
  selectedParagraph.value = paragraph
}

const openAiChat = () => {
  if (selectedParagraph.value) {
    router.push(`/ai-chat/${selectedParagraph.value.id}`)
  }
}

const goToWelcome = () => {
  router.push('/')
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// 触摸手势处理
let touchHandler: TouchGestureHandler | null = null

// 初始化移动端优化
const initMobileOptimizations = () => {
  if (isMobileDevice()) {
    addSafeAreaSupport()
    preventDoubleClickZoom(document.body)

    touchHandler = new TouchGestureHandler(document.body, {
      threshold: 80,
      onSwipeRight: () => {
        if (!showMobileMenu.value) {
          showMobileMenu.value = true
        }
      },
      onSwipeLeft: () => {
        if (showMobileMenu.value) {
          showMobileMenu.value = false
        }
      }
    })
  }
}

// 从本地JSON文件加载数据
const loadParagraphs = async () => {
  try {
    console.log('开始加载段落数据...')

    let paragraphsData = []
    let markdownContent = ''

    try {
      const response = await fetch('/shanghai_astronomy_museum.json')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      paragraphsData = await response.json()
      console.log(`从JSON文件加载了${paragraphsData.length}个段落`)
    } catch (jsonError) {
      console.warn('加载JSON文件失败:', jsonError)
      paragraphsData = [{
        id: 'fallback-1',
        title: '加载中...',
        content: '正在加载内容，请稍候。',
        section: '默认展区',
        module: '默认模块',
        order_index: 1,
        keywords: [],
        fill_blanks: '',
        fill_blanks_answers: [],
        voice_check_phrases: ''
      }]
    }

    try {
      const markdownResponse = await fetch('/讲解逐字稿.md')
      if (markdownResponse.ok) {
        markdownContent = await markdownResponse.text()
        console.log('成功加载Markdown文件')
      }
    } catch (markdownError) {
      console.warn('加载Markdown文件失败:', markdownError)
    }

    // 解析Markdown内容
    const markdownSections = markdownContent ? parseMarkdownContent(markdownContent) : {}

    // 按展区和模块分组
    const groupedData = paragraphsData.reduce((acc: Record<string, Record<string, any[]>>, paragraph: any) => {
      const section = paragraph.section || '默认展区'
      const module = paragraph.module || '默认模块'

      if (!acc[section]) {
        acc[section] = {}
      }
      if (!acc[section][module]) {
        acc[section][module] = []
      }

      const originalContent = findOriginalContent(markdownSections, paragraph.section, paragraph.title)

      acc[section][module].push({
        ...paragraph,
        content: originalContent || paragraph.content
      })
      return acc
    }, {})

    // 转换为sections格式
    sections.value = Object.entries(groupedData).map(([sectionName, modules]) => ({
      name: sectionName,
      expanded: true,
      modules: Object.entries(modules).map(([moduleName, paragraphs]) => ({
        name: moduleName,
        expanded: true,
        paragraphs
      }))
    }))

    // 默认选择第一个段落
    if (sections.value.length > 0 && sections.value[0].modules.length > 0 && sections.value[0].modules[0].paragraphs.length > 0) {
      selectedParagraph.value = sections.value[0].modules[0].paragraphs[0]
    }

    console.log('数据加载完成')

  } catch (error) {
    console.error('加载段落数据失败:', error)
    sections.value = [{
      name: '默认展区',
      expanded: true,
      modules: [{
        name: '默认模块',
        expanded: true,
        paragraphs: [{
          id: 'fallback-1',
          title: '加载中...',
          content: '正在加载内容，请稍候。',
          section: '默认展区',
          module: '默认模块',
          order_index: 1,
          keywords: [],
          fill_blanks: '',
          fill_blanks_answers: [],
          voice_check_phrases: ''
        }]
      }]
    }]

    if (sections.value[0].modules[0].paragraphs[0]) {
      selectedParagraph.value = sections.value[0].modules[0].paragraphs[0]
    }
  }
}

// 解析Markdown内容
const parseMarkdownContent = (content: string) => {
  const sections: Record<string, Record<string, string>> = {}
  const lines = content.split('\n')
  let currentSection = ''
  let currentSubtitle = ''
  let currentContent = ''

  for (const line of lines) {
    if (line.trim() === '') {
      if (currentContent.trim()) {
        currentContent += '\n'
      }
      continue
    }

    if (line.match(/^[^#\s].*展区$/) || line === '上海天文馆简介') {
      if (currentSection && currentSubtitle && currentContent.trim()) {
        if (!sections[currentSection]) sections[currentSection] = {}
        sections[currentSection][currentSubtitle] = currentContent.trim()
      }

      currentSection = line.trim()
      currentSubtitle = ''
      currentContent = ''
    }
    else if (line.match(/^[^\s]/) && !line.includes('：') && currentSection) {
      if (currentSubtitle && currentContent.trim()) {
        if (!sections[currentSection]) sections[currentSection] = {}
        sections[currentSection][currentSubtitle] = currentContent.trim()
      }

      currentSubtitle = line.trim()
      currentContent = ''
    }
    else if (currentSection) {
      currentContent += line + '\n'
    }
  }

  if (currentSection && currentSubtitle && currentContent.trim()) {
    if (!sections[currentSection]) sections[currentSection] = {}
    sections[currentSection][currentSubtitle] = currentContent.trim()
  }

  return sections
}

// 查找原文内容
const findOriginalContent = (markdownSections: Record<string, Record<string, string>>, section: string, title: string) => {
  if (!markdownSections[section]) return null

  if (markdownSections[section][title]) {
    return markdownSections[section][title]
  }

  for (const [key, content] of Object.entries(markdownSections[section])) {
    if (key.includes(title) || title.includes(key)) {
      return content
    }
  }

  return null
}

// 组件挂载
onMounted(async () => {
  await loadParagraphs()
  initMobileOptimizations()
})

// 组件卸载
onUnmounted(() => {
  if (touchHandler) {
    touchHandler.destroy(document.body)
  }
})
</script>

<style scoped>
/* 安全区域支持 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
