<template>
  <div class="flex h-screen bg-gradient-to-br from-[#003049] to-[#001D3D] text-[#EAE2B7] relative">
    <!-- 移动端菜单按钮 -->
    <button
      @click="toggleMobileMenu"
      class="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#001D3D]/80 backdrop-blur-sm border border-[#EAE2B7]/20 rounded-md text-[#EAE2B7] hover:text-[#F77F00] transition-colors"
    >
      <Menu v-if="!showMobileMenu" class="w-5 h-5" />
      <X v-else class="w-5 h-5" />
    </button>

    <!-- 左侧导航面板 -->
    <div :class="[
      'bg-[#001D3D]/50 backdrop-blur-sm border-r border-[#EAE2B7]/20 flex flex-col transition-transform duration-300 ease-in-out',
      'md:w-80 md:relative md:translate-x-0',
      'fixed inset-y-0 left-0 w-80 z-40',
      showMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]">
      <!-- 用户信息区域 -->
      <div class="p-4 border-b border-[#EAE2B7]/20">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-[#F77F00] rounded-full flex items-center justify-center">
              <User class="w-4 h-4 text-white" />
            </div>
            <div>
              <p class="text-sm font-medium text-[#EAE2B7]">{{ userEmail }}</p>
              <p class="text-xs text-[#EAE2B7]/65">讲解员</p>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <button 
              @click="goToWelcome" 
              class="p-2 hover:bg-[#EAE2B7]/10 rounded-md transition-colors"
              title="返回欢迎页"
            >
              <Home class="w-4 h-4 text-[#EAE2B7]/65" />
            </button>
            <button 
              @click="handleSignOut" 
              class="p-2 hover:bg-[#EAE2B7]/10 rounded-md transition-colors"
              title="退出登录"
            >
              <LogOut class="w-4 h-4 text-[#EAE2B7]/65" />
            </button>
          </div>
        </div>
      </div>

      <!-- 导航内容 -->
      <div class="flex-1 overflow-y-auto p-4">
        <nav class="space-y-2">
          <div v-for="section in sections" :key="section.name" class="mb-4">
            <!-- 展区标题 -->
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-[#EAE2B7] font-medium text-sm uppercase tracking-wide">
                {{ section.name }}
              </h3>
              <ChevronDown 
                :class="['w-4 h-4 text-[#EAE2B7]/65 transition-transform', 
                         section.expanded ? 'rotate-180' : '']"
                @click="toggleSection(section)"
              />
            </div>
            
            <!-- 模块和段落列表 -->
            <div v-show="section.expanded" class="space-y-1 ml-2">
              <div v-for="module in section.modules" :key="module.name" class="mb-3">
                <!-- 模块标题 -->
                <div class="flex items-center justify-between mb-1">
                  <h4 class="text-[#EAE2B7]/80 font-medium text-xs uppercase tracking-wide px-2">
                    {{ module.name }}
                  </h4>
                  <ChevronDown 
                    :class="['w-3 h-3 text-[#EAE2B7]/50 transition-transform cursor-pointer', 
                             module.expanded ? 'rotate-180' : '']"
                    @click="toggleModule(module)"
                  />
                </div>
                
                <!-- 段落列表 -->
                <div v-show="module.expanded" class="space-y-1 ml-3">
                  <button
                    v-for="paragraph in module.paragraphs"
                    :key="paragraph.id"
                    @click="selectParagraph(paragraph)"
                    :class="[
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-all',
                      'border-l-3 border-transparent',
                      selectedParagraph?.id === paragraph.id
                        ? 'text-[#F77F00] bg-[#F77F00]/10 border-l-[#F77F00]'
                        : 'text-[#EAE2B7]/65 hover:text-[#EAE2B7] hover:bg-[#EAE2B7]/5'
                    ]"
                  >
                    {{ paragraph.title }}
                    <!-- 进度指示器 -->
                    <div class="mt-1 flex items-center space-x-1">
                      <div class="flex-1 h-1 bg-[#EAE2B7]/20 rounded-full overflow-hidden">
                        <div 
                          class="h-full bg-[#F77F00] transition-all duration-300"
                          :style="{ width: `${getProgress(paragraph.id)}%` }"
                        ></div>
                      </div>
                      <span class="text-xs text-[#EAE2B7]/50">{{ getProgress(paragraph.id) }}%</span>
                    </div>
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
      class="md:hidden fixed inset-0 bg-black/50 z-30"
    ></div>

    <!-- 主内容区域 -->
    <div class="flex-1 flex flex-col relative md:ml-0" :class="{ 'ml-0': !showMobileMenu }">
      <!-- 内容展示区 -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0" :style="{ paddingBottom: selectedParagraph ? '120px' : '32px' }">
        <div v-if="selectedParagraph" class="max-w-4xl mx-auto">
          <!-- 标题和元信息 -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-[#EAE2B7] mb-2">
              {{ selectedParagraph.title }}
            </h1>
            <div class="flex items-center space-x-4 text-sm text-[#EAE2B7]/65">
              <span>练习次数: {{ getPracticeCount(selectedParagraph.id) }}</span>
              <span>掌握度: {{ getProgress(selectedParagraph.id) }}%</span>
            </div>
          </div>

          <!-- 内容展示 -->
          <div class="bg-[#001D3D]/30 rounded-lg p-6 mb-8">
            <div class="prose prose-invert max-w-none">
              <div class="text-[#EAE2B7] leading-relaxed whitespace-pre-wrap">{{ selectedParagraph.content }}</div>
            </div>
          </div>


        </div>
        
        <!-- 空状态 -->
        <div v-else class="flex items-center justify-center h-full">
          <div class="text-center">
            <BookOpen class="w-16 h-16 text-[#EAE2B7]/30 mx-auto mb-4" />
            <p class="text-[#EAE2B7]/65 text-lg">请选择一个段落开始学习</p>
          </div>
        </div>
      </div>

      <!-- 固定底部操作按钮 -->
      <div v-if="selectedParagraph" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#001D3D] to-[#001D3D]/95 backdrop-blur-sm border-t border-[#EAE2B7]/20 p-4 md:p-6">
        <div class="max-w-4xl mx-auto">
          <div class="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-4">
            <!-- 天文馆AI讲解员按钮 -->
            <button
              @click="openAiChat"
              class="w-full md:w-auto px-4 md:px-6 py-3 bg-transparent border border-[#F77F00] text-[#F77F00] rounded-md hover:bg-[#F77F00]/10 transition-colors font-medium text-sm md:text-base flex items-center justify-center gap-2"
            >
              <MessageCircle class="w-4 h-4 md:w-5 md:h-5" />
              天文馆AI讲解员
            </button>
            
            <!-- 开始填空训练按钮 -->
            <button
              @click="startFillBlankTraining"
              class="w-full md:w-auto px-4 md:px-6 py-3 bg-gradient-to-r from-[#F77F00] to-[#FCBF49] text-[#001D3D] rounded-md font-semibold hover:from-[#FCBF49] hover:to-[#F77F00] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 text-sm md:text-base"
            >开始填空训练</button>
            
            <!-- 复述训练功能 -->
            <button
              @click="startParaphraseTraining"
              class="w-full md:w-auto px-4 md:px-6 py-3 bg-transparent border border-[#F77F00] text-[#F77F00] rounded-md hover:bg-[#F77F00]/10 transition-colors font-medium text-sm md:text-base flex items-center justify-center gap-2"
            >
              <Mic class="w-4 h-4" />
              复述训练
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, LogOut, ChevronDown, BookOpen, MessageCircle, Menu, X, Home, Mic
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import type { Paragraph } from '@/lib/supabase'
import { TouchGestureHandler, preventDoubleClickZoom, addSafeAreaSupport, isMobileDevice } from '@/utils/touch'

const router = useRouter()
const authStore = useAuthStore()

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
const userProgress = ref<Record<string, { mastery_level: number; practice_count: number }>>({})
const showMobileMenu = ref(false)

// 计算属性
const userEmail = computed(() => {
  return authStore.user?.email || '未知用户'
})

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

const getProgress = (paragraphId: string): number => {
  return userProgress.value[paragraphId]?.mastery_level || 0
}

const getPracticeCount = (paragraphId: string): number => {
  return userProgress.value[paragraphId]?.practice_count || 0
}

const startFillBlankTraining = () => {
  if (selectedParagraph.value) {
    router.push(`/training/${selectedParagraph.value.id}`)
  }
}

const startParaphraseTraining = () => {
  if (selectedParagraph.value) {
    router.push(`/paraphrase/${selectedParagraph.value.id}`)
  }
}

const openAiChat = () => {
  if (selectedParagraph.value) {
    router.push(`/ai-chat/${selectedParagraph.value.id}`)
  }
}

const handleSignOut = async () => {
  await authStore.signOut()
  router.push('/login')
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
    // 添加安全区域支持
    addSafeAreaSupport()
    
    // 防止双击缩放
    preventDoubleClickZoom(document.body)
    
    // 添加触摸手势支持
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

// 加载数据
const loadParagraphs = async () => {
  try {
    console.log('开始加载段落数据...')
    
    // 优先从Supabase加载数据
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('paragraphs')
      .select('*')
      .order('section', { ascending: true })
      .order('order_index', { ascending: true })

    if (supabaseData && supabaseData.length > 0 && !supabaseError) {
      console.log(`从Supabase加载了${supabaseData.length}个段落`)
      
      // 按展区和模块分组
      const groupedData = supabaseData.reduce((acc: Record<string, Record<string, any[]>>, paragraph: any) => {
        const section = paragraph.section || '默认展区'
        const module = '默认模块' // Supabase数据可能没有module字段
        
        if (!acc[section]) {
          acc[section] = {}
        }
        if (!acc[section][module]) {
          acc[section][module] = []
        }
        
        acc[section][module].push({
          id: paragraph.custom_id || paragraph.id,
          title: paragraph.title,
          content: paragraph.content,
          section: paragraph.section,
          order_index: paragraph.order_index,
          fill_blanks: paragraph.fill_blanks || [],
          potential_qa: paragraph.potential_qa || []
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
      
      console.log('从Supabase成功加载数据')
      return
    }
    
    console.log('Supabase数据为空，尝试加载本地文件...')
    
    // 备用方案：从本地JSON文件加载数据
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
      // 使用默认数据
      paragraphsData = [{
        id: 'default-1',
        title: '默认段落',
        content: '这是一个默认段落，用于演示功能。',
        section: '默认展区',
        module: '默认模块',
        fill_blanks: [],
        potential_qa: []
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
    
    // 解析Markdown内容，创建段落映射
    const markdownSections = markdownContent ? parseMarkdownContent(markdownContent) : {}
    
    // 按展区和模块分组并合并原文内容
    const groupedData = paragraphsData.reduce((acc: Record<string, Record<string, any[]>>, paragraph: any) => {
      const section = paragraph.section || '默认展区'
      const module = paragraph.module || '默认模块'
      
      if (!acc[section]) {
        acc[section] = {}
      }
      if (!acc[section][module]) {
        acc[section][module] = []
      }
      
      // 查找对应的原文内容
      const originalContent = findOriginalContent(markdownSections, paragraph.section, paragraph.title)
      
      acc[section][module].push({
        ...paragraph,
        content: originalContent || paragraph.content // 优先使用原文，否则使用JSON中的内容
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
    // 提供最基本的默认数据
    sections.value = [{
      name: '默认展区',
      expanded: true,
      modules: [{
        name: '默认模块',
        expanded: true,
        paragraphs: [{
          id: 'fallback-1',
          title: '示例段落',
          content: '这是一个示例段落，用于确保应用正常运行。请检查数据源配置。',
          section: '默认展区',
          order_index: 1,
          fill_blanks: [],
          potential_qa: []
        }]
      }]
    }]
    
    if (sections.value[0].modules[0].paragraphs[0]) {
      selectedParagraph.value = sections.value[0].modules[0].paragraphs[0]
    }
  }
}

const loadUserProgress = async () => {
  if (!authStore.user) return

  try {
    const { data: progress, error } = await supabase
      .from('user_progress')
      .select('paragraph_id, mastery_level, practice_count')
      .eq('user_id', authStore.user.id)

    if (error) throw error

    // 转换为字典格式
    userProgress.value = progress?.reduce((acc, item) => {
      acc[item.paragraph_id] = {
        mastery_level: item.mastery_level,
        practice_count: item.practice_count
      }
      return acc
    }, {} as Record<string, { mastery_level: number; practice_count: number }>) || {}
  } catch (error) {
    console.error('加载用户进度失败:', error)
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
    
    // 检查是否是主标题（展区）
    if (line.match(/^[^#\s].*展区$/) || line === '上海天文馆简介') {
      // 保存之前的内容
      if (currentSection && currentSubtitle && currentContent.trim()) {
        if (!sections[currentSection]) sections[currentSection] = {}
        sections[currentSection][currentSubtitle] = currentContent.trim()
      }
      
      currentSection = line.trim()
      currentSubtitle = ''
      currentContent = ''
    }
    // 检查是否是子标题
    else if (line.match(/^[^\s]/) && !line.includes('：') && currentSection) {
      // 保存之前的内容
      if (currentSubtitle && currentContent.trim()) {
        if (!sections[currentSection]) sections[currentSection] = {}
        sections[currentSection][currentSubtitle] = currentContent.trim()
      }
      
      currentSubtitle = line.trim()
      currentContent = ''
    }
    // 内容行
    else if (currentSection) {
      currentContent += line + '\n'
    }
  }
  
  // 保存最后一段内容
  if (currentSection && currentSubtitle && currentContent.trim()) {
    if (!sections[currentSection]) sections[currentSection] = {}
    sections[currentSection][currentSubtitle] = currentContent.trim()
  }
  
  return sections
}

// 查找原文内容
const findOriginalContent = (markdownSections: Record<string, Record<string, string>>, section: string, title: string) => {
  if (!markdownSections[section]) return null
  
  // 尝试直接匹配标题
  if (markdownSections[section][title]) {
    return markdownSections[section][title]
  }
  
  // 尝试模糊匹配
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
  await loadUserProgress()
  initMobileOptimizations()
})

// 组件卸载
onUnmounted(() => {
  if (touchHandler) {
    touchHandler.destroy(document.body)
  }
})
</script>
