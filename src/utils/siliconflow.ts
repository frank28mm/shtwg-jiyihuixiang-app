// 硅基流动AI API配置和工具函数

// 支持的模型列表
export const SILICONFLOW_MODELS = {
  'Pro/deepseek-ai/DeepSeek-V3.1': {
    name: 'DeepSeek-V3.1',
    description: '深度求索最新模型，推理能力强',
    maxTokens: 8192,
    temperature: 0.7
  },
  'Pro/deepseek-ai/DeepSeek-R1': {
    name: 'DeepSeek-R1',
    description: '深度求索推理模型，逻辑思维优秀',
    maxTokens: 8192,
    temperature: 0.6
  },
  'Pro/moonshotai/Kimi-K2-Instruct': {
    name: 'Kimi-K2',
    description: 'Moonshot AI模型，对话能力出色',
    maxTokens: 8192,
    temperature: 0.8
  }
} as const;

export type SiliconFlowModel = keyof typeof SILICONFLOW_MODELS;

// 获取API配置
const getApiConfig = () => {
  const apiKey = import.meta.env.VITE_SILICONFLOW_API_KEY;
  const baseUrl = import.meta.env.VITE_SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
  const defaultModel = import.meta.env.VITE_SILICONFLOW_DEFAULT_MODEL || 'Pro/deepseek-ai/DeepSeek-V3.1';

  if (!apiKey || apiKey === 'your_siliconflow_api_key_here') {
    throw new Error('请配置硅基流动API Key');
  }

  return { apiKey, baseUrl, defaultModel };
};

// 调用硅基流动API
export async function callSiliconFlowAPI(
  messages: Array<{ role: string; content: string }>,
  model: SiliconFlowModel = 'Pro/moonshotai/Kimi-K2-Instruct'
) {
  console.log('🔌 [DEBUG] callSiliconFlowAPI started:', {
    model,
    messagesCount: messages.length,
    messages: messages.map(msg => ({ role: msg.role, contentLength: msg.content.length }))
  });

  const { apiKey, baseUrl } = getApiConfig();
  const modelConfig = SILICONFLOW_MODELS[model];

  console.log('⚙️ [DEBUG] API Config:', {
    baseUrl,
    model,
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
    modelConfig
  });

  const requestBody = {
    model,
    messages,
    max_tokens: modelConfig.maxTokens,
    temperature: modelConfig.temperature,
    stream: false
  };

  console.log('📤 [DEBUG] Request body:', {
    model: requestBody.model,
    messagesCount: requestBody.messages.length,
    max_tokens: requestBody.max_tokens,
    temperature: requestBody.temperature,
    stream: requestBody.stream
  });

  try {
    console.log('🌐 [DEBUG] Making fetch request to:', `${baseUrl}/chat/completions`);

    // 添加CORS和网络调试信息
    console.log('🔍 [DEBUG] Browser environment check:', {
      userAgent: navigator.userAgent,
      onLine: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20秒超时

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      mode: 'cors', // 明确指定CORS模式
      credentials: 'omit', // 不发送凭据
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    console.log('📥 [DEBUG] Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
        console.error('❌ [ERROR] API Error Response:', errorData);
      } catch (parseError) {
        console.error('❌ [ERROR] Failed to parse error response:', parseError);
      }

      const errorMessage = `API调用失败: ${response.status} ${response.statusText} - ${errorData.error?.message || '未知错误'}`;
      console.error('❌ [ERROR] Final error message:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ [DEBUG] API Response data:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      firstChoice: data.choices?.[0] ? {
        hasMessage: !!data.choices[0].message,
        messageRole: data.choices[0].message?.role,
        contentLength: data.choices[0].message?.content?.length || 0
      } : null,
      usage: data.usage
    });

    const content = data.choices[0]?.message?.content;
    if (!content) {
      console.warn('⚠️ [WARNING] No content in API response, using fallback message');
      return '抱歉，我无法生成回复。';
    }

    console.log('✅ [DEBUG] Returning content:', {
      contentLength: content.length,
      contentPreview: content.substring(0, 100) + '...'
    });

    return content;
  } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ [ERROR] 硅基流动API调用错误:', error);
    console.error('❌ [ERROR] Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack?.substring(0, 500) + '...' // 截断长堆栈信息
    });

    // 网络错误特殊处理
    if (error?.name === 'TypeError' && error?.message === 'Failed to fetch') {
      console.error('🌐 [ERROR] Network fetch failed - possible causes:');
      console.error('  - CORS policy blocking the request');
      console.error('  - Network connectivity issues');
      console.error('  - DNS resolution problems');
      console.error('  - Firewall or proxy blocking');

      throw new NetworkError('网络请求失败：可能是网络连接问题、CORS策略限制或防火墙阻止。请检查网络连接并稍后重试。', error);
    }

    // 超时错误处理
    if (error?.name === 'AbortError') {
      throw new NetworkError('请求超时：服务器响应时间过长，请稍后重试。', error);
    }

    throw error;
  }
}

// 获取天文馆AI讲解员的系统提示词
export function getAstronomyGuidePrompt(currentContent?: string) {
  const basePrompt = `你是上海天文馆的专业AI讲解员，具有以下特点：

🌟 专业背景：
- 拥有丰富的天文学知识和科普经验
- 熟悉上海天文馆的所有展区和展品
- 了解不同年龄段观众的学习特点

🎯 讲解风格：
- 用通俗易懂的语言解释复杂的天文概念
- 善于用生动的比喻和例子帮助理解
- 鼓励提问，营造互动学习氛围
- 根据观众兴趣调整讲解深度

📚 服务范围：
- 回答天文学相关问题
- 解释展区内容和展品原理
- 提供学习建议和延伸知识
- 分享有趣的天文故事和最新发现

请以友好、专业、耐心的态度为观众提供优质的讲解服务。`;

  if (currentContent) {
    return `${basePrompt}\n\n当前讲解内容：\n${currentContent}\n\n请基于以上内容回答观众的问题，并适当提供相关的延伸知识。`;
  }

  return basePrompt;
}

// 获取默认模型
export function getDefaultModel(): SiliconFlowModel {
  const { defaultModel } = getApiConfig();
  return defaultModel as SiliconFlowModel;
}

// 备用回复机制
export function getFallbackResponse(query: string): string {
  console.log('🔄 [DEBUG] Using fallback response for query:', query);

  const fallbackResponses = {
    greeting: '您好！我是上海天文馆的AI讲解员。虽然当前网络连接有些问题，但我很乐意为您介绍天文知识。请稍后重试，或者您可以浏览展区内容了解更多信息。',
    question: '抱歉，由于网络连接问题，我暂时无法为您提供详细回答。建议您稍后重试，或者查看展区的详细介绍内容。',
    general: '很抱歉，当前AI服务暂时不可用。您可以：\n\n1. 检查网络连接后重试\n2. 浏览展区的详细内容\n3. 稍后再次尝试提问\n\n感谢您的理解！'
  };

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('你好') || lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
    return fallbackResponses.greeting;
  } else if (lowerQuery.includes('?') || lowerQuery.includes('？') || lowerQuery.includes('什么') || lowerQuery.includes('如何') || lowerQuery.includes('为什么')) {
    return fallbackResponses.question;
  } else {
    return fallbackResponses.general;
  }
}

// 自定义网络错误类，用于区分不同类型的网络错误
class NetworkError extends Error {
  originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }
}