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
    this.model = import.meta.env.VITE_SILICONFLOW_MODEL || 'Pro/moonshotai/Kimi-K2-Instruct'

    if (!this.apiKey || this.apiKey === 'your_siliconflow_api_key_here') {
      console.warn('SiliconFlow API key not configured. Please set VITE_SILICONFLOW_API_KEY in your .env file.')
    }
  }

  async chat(messages: SiliconFlowMessage[]): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your_siliconflow_api_key_here') {
      throw new Error('SiliconFlow API key not configured')
    }

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
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        let errorMessage = `SiliconFlow API error: ${response.status} ${response.statusText}`
        try {
          const errorText = await response.text()
          console.error('❌ [ERROR] API错误响应:', errorText.substring(0, 500))
          try {
            const errorJson = JSON.parse(errorText)
            if (errorJson.error?.message) {
              errorMessage += ` - ${errorJson.error.message}`
            }
          } catch {
            if (errorText.trim()) {
              errorMessage += ` - ${errorText.substring(0, 200)}`
            }
          }
        } catch (textError) {
          console.error('❌ [ERROR] 无法读取错误响应:', textError)
        }

        if (response.status === 401) {
          errorMessage = 'API密钥无效或已过期，请检查 VITE_SILICONFLOW_API_KEY 配置'
        } else if (response.status === 403) {
          errorMessage = 'API访问被拒绝，请检查API密钥权限'
        } else if (response.status === 429) {
          errorMessage = 'API调用频率过高，请稍后重试'
        } else if (response.status >= 500) {
          errorMessage = 'SiliconFlow服务器暂时不可用，请稍后重试'
        }
        throw new Error(errorMessage)
      }

      const data: SiliconFlowResponse = await response.json()
      return data.choices[0]?.message?.content || '抱歉，我无法回答这个问题。'
    } catch (error) {
      console.error('❌ [ERROR] SiliconFlow API调用失败:', error)

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('网络连接失败，请检查网络设置后重试')
      }

      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        throw new Error('请求超时，请稍后重试')
      }

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

    // Use the simplified chat method, ignoring onProgress and signal as they are not supported in the simplified version
    try {
      // Constructing the fetch call similar to the simplified chat method
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: false // Explicitly not streaming
        }),
        // No signal here as it's not supported in the simplified chat
      });

      if (!response.ok) {
        let errorMessage = `SiliconFlow API error: ${response.status} ${response.statusText}`
        try {
          const errorText = await response.text()
          console.error('❌ [ERROR] API错误响应:', errorText.substring(0, 500))
          try {
            const errorJson = JSON.parse(errorText)
            if (errorJson.error?.message) {
              errorMessage += ` - ${errorJson.error.message}`
            }
          } catch {
            if (errorText.trim()) {
              errorMessage += ` - ${errorText.substring(0, 200)}`
            }
          }
        } catch (textError) {
          console.error('❌ [ERROR] 无法读取错误响应:', textError)
        }

        if (response.status === 401) {
          errorMessage = 'API密钥无效或已过期，请检查 VITE_SILICONFLOW_API_KEY 配置'
        } else if (response.status === 403) {
          errorMessage = 'API访问被拒绝，请检查API密钥权限'
        } else if (response.status === 429) {
          errorMessage = 'API调用频率过高，请稍后重试'
        } else if (response.status >= 500) {
          errorMessage = 'SiliconFlow服务器暂时不可用，请稍后重试'
        }
        throw new Error(errorMessage)
      }

      const data: SiliconFlowResponse = await response.json()
      return data.choices[0]?.message?.content || '抱歉，我无法回答这个问题。'

    } catch (error) {
      console.error('❌ [ERROR] SiliconFlow API调用失败:', error)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('网络连接失败，请检查网络设置后重试')
      }
      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        throw new Error('请求超时，请稍后重试')
      }
      throw error
    }
  }

  // 为复述评估提供AI服务
  async evaluateParaphrase(
    originalContent: string,
    paraphrasedContent: string
  ): Promise<string> {
    const prompt = `请作为专业的天文馆讲解员评估员，对以下复述内容进行专业评估。

原文内容：
${originalContent}

复述内容：
${paraphrasedContent}

请提供详细的评估报告，包括：
1. 综合评分 (0-100分)
2. 主要优点
3. 改进建议
4. 总体评价

请以JSON格式返回，结构如下：
{
  "score": 85,
  "strengths": ["优点1", "优点2"],
  "improvements": ["建议1", "建议2"],
  "overall_feedback": "总体评价"
}`

    const messages: SiliconFlowMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的天文馆讲解员培训专家，能够客观、详细地评估讲解员的复述表现。'
      },
      { role: 'user', content: prompt }
    ]

    // Calling the simplified chat method
    return await this.chat(messages)
  }
}

// 导出单例实例
export const siliconFlowAPI = new SiliconFlowAPI()
export type { SiliconFlowMessage }