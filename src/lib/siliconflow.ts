// SiliconFlow AI API 配置和工具函数

interface SiliconFlowMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface SiliconFlowResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
  }>
}

class SiliconFlowAPI {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor() {
    this.apiKey = import.meta.env.VITE_SILICONFLOW_API_KEY
    this.baseUrl = import.meta.env.VITE_SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1'
    this.model = import.meta.env.VITE_SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct'

    if (!this.apiKey || this.apiKey === 'your_siliconflow_api_key_here') {
      console.warn('SiliconFlow API key not configured. Please set VITE_SILICONFLOW_API_KEY in your .env file.')
    }
  }

  async chat(messages: SiliconFlowMessage[], options?: {
    onProgress?: (content: string) => void;
    signal?: AbortSignal;
  }): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your_siliconflow_api_key_here') {
      throw new Error('SiliconFlow API key not configured')
    }

    const isStreaming = options?.onProgress !== undefined;
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: isStreaming
        }),
        signal: options?.signal
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`SiliconFlow API error: ${response.status} - ${errorText}`)
      }

      if (isStreaming) {
        // 处理流式响应
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('无法读取响应流');
        }

        let fullContent = '';
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullContent += content;
                    options?.onProgress?.(fullContent);
                  }
                } catch (e) {
                  console.warn('Failed to parse streaming chunk:', e);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        return fullContent || '抱歉，我无法回答这个问题。';
      } else {
        // 非流式响应
        const data: SiliconFlowResponse = await response.json()
        return data.choices[0]?.message?.content || '抱歉，我无法回答这个问题。'
      }
    } catch (error) {
      console.error('SiliconFlow API error:', error)
      throw error
    }
  }

  // 创建天文馆讲解员的系统提示词
  createAstronomyGuideSystemPrompt(currentContent?: string): string {
    const basePrompt = `你是上海天文馆的专业AI讲解员，具有以下特点：

1. **专业背景**：
   - 拥有深厚的天文学知识背景
   - 熟悉上海天文馆的所有展区和展品
   - 了解最新的天文学发现和研究成果

2. **讲解风格**：
   - 友好、耐心、富有启发性
   - 能够将复杂的天文概念用通俗易懂的语言解释
   - 善于引导观众思考和探索
   - 注重互动和参与感

3. **回答原则**：
   - 基于科学事实，准确可靠
   - 结合上海天文馆的展区内容
   - 适合不同年龄层的观众
   - 鼓励进一步学习和探索

4. **服务对象**：
   - 主要为讲解员提供专业支持
   - 帮助解答天文相关问题
   - 提供深入的知识讲解
   - 协助准备讲解内容`

    if (currentContent) {
      return `${basePrompt}

5. **当前讲解内容**：
${currentContent}

请基于以上内容和你的专业知识，为讲解员提供准确、生动的解答和补充说明。`
    }

    return basePrompt
  }

  // 为讲解员提供专业的天文问答服务
  async askAstronomyGuide(
    question: string, 
    currentContent?: string, 
    conversationHistory: SiliconFlowMessage[] = [],
    options?: {
      onProgress?: (content: string) => void;
      signal?: AbortSignal;
    }
  ): Promise<string> {
    const systemPrompt = this.createAstronomyGuideSystemPrompt(currentContent)
    
    const messages: SiliconFlowMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: question }
    ]

    return await this.chat(messages, options)
  }

  // 为复述评估提供流式AI服务
  async evaluateParaphrase(
    originalContent: string,
    paraphrasedContent: string,
    onProgress?: (content: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    // 检查取消信号
    if (signal?.aborted) {
      throw new Error('操作已被取消')
    }
    const prompt = `请作为专业的天文馆讲解员评估员，对以下复述内容进行专业评估。

原文内容：
${originalContent}

复述内容：
${paraphrasedContent}

## 评估标准

请从以下维度进行专业评估：

### 1. 信息准确性 (40分)
- 关键事实的正确性
- 数据准确性
- 概念理解的正确性
- 时间顺序的准确性

### 2. 完整性 (25分)
- 核心信息的涵盖程度
- 重要细节的保留
- 逻辑结构的完整性
- 关键概念的完整性

### 3. 表达清晰度 (20分)
- 语言流畅性
- 逻辑连贯性
- 专业术语使用恰当性
- 观众理解度

### 4. 讲解技巧 (15分)
- 引人入胜的程度
- 互动性元素
- 情感表达
- 记忆点设计

## 评估要求

请提供详细的评估报告，包括：

1. **综合评分** (0-100分)
2. **各维度评分** (信息准确性、完整性、表达清晰度、讲解技巧)
3. **复述的主要优点** (至少3条)
4. **具体改进建议** (针对每个不足提供具体改进方案)
5. **关键词汇建议** (建议使用的天文专业术语)
6. **讲解技巧建议** (如何更好地吸引观众)
7. **总体评价** (总结性评价)

## 评分标准
- 90-100分：优秀，几乎完美复述
- 80-89分：良好，有小瑕疵
- 70-79分：中等，需要改进
- 60-69分：及格，有明显不足
- 60分以下：需要重新学习

请以JSON格式返回，结构如下：
{
  "score": 85,
  "accuracy_score": 35,
  "completeness_score": 20,
  "clarity_score": 18,
  "presentation_score": 12,
  "strengths": [
    "信息准确：准确传达了上海天文馆的主要展区信息",
    "表达清晰：使用通俗易懂的语言解释复杂概念",
    "结构完整：按照原文的逻辑顺序进行复述"
  ],
  "improvements": [
    {
      "issue": "缺少具体数据",
      "suggestion": "加入上海天文馆的具体建设时间：2016年开工，2021年开馆"
    },
    {
      "issue": "专业术语使用不足",
      "suggestion": "增加如'光年'、'星系'等专业术语的使用"
    }
  ],
  "key_terms": ["光年", "星系", "宇宙演化", "天文观测"],
  "presentation_tips": [
    "可以使用类比法：将天体距离比作从上海到北京的距离",
    "增加互动问题：如'大家猜猜宇宙有多大?'"
  ],
  "overall_feedback": "整体表现良好，建议加强专业术语的使用和具体数据的准确性。"
}`

    const messages: SiliconFlowMessage[] = [
      { 
        role: 'system', 
        content: `你是一个专业的天文馆讲解员培训专家，具有以下特点：

1. **专业背景**：拥有天文学教育背景和多年讲解员培训经验
2. **评估标准**：熟悉讲解员复述评估的各项标准
3. **实用建议**：能够提供具体、可操作的改进建议
4. **鼓励性**：在指出问题的同时给予积极的鼓励
5. **针对性**：针对天文馆讲解员的需求提供定制化建议

请基于专业标准进行客观、详细的评估。` 
      },
      { role: 'user', content: prompt }
    ]

    try {
      return await this.chat(messages, { onProgress, signal })
    } catch (error) {
      // 如果是取消错误，重新抛出
      if (signal?.aborted || error.name === 'AbortError') {
        const abortError = new Error('评估已被取消')
        abortError.name = 'AbortError'
        throw abortError
      }
      
      // 其他错误正常处理
      throw error
    }
  }
}

// 导出单例实例
export const siliconFlowAPI = new SiliconFlowAPI()
export type { SiliconFlowMessage }