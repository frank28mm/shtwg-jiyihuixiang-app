// 硅基流动AI API配置和工具函数

// 支持的模型列表
export const SILICONFLOW_MODELS = {
  // DeepSeek 系列
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
  'deepseek-ai/DeepSeek-V2.5': {
    name: 'DeepSeek-V2.5',
    description: 'DeepSeek经典版本，性能稳定',
    maxTokens: 4096,
    temperature: 0.7
  },
  
  // Moonshot AI 系列
  'Pro/moonshotai/Kimi-K2-Instruct': {
    name: 'Kimi-K2',
    description: 'Moonshot AI模型，对话能力出色',
    maxTokens: 8192,
    temperature: 0.8
  },
  'moonshot-v1-8k': {
    name: 'Moonshot-8K',
    description: 'Moonshot标准版，适合日常对话',
    maxTokens: 8192,
    temperature: 0.7
  },
  'moonshot-v1-32k': {
    name: 'Moonshot-32K',
    description: 'Moonshot长文本版，处理大量文本',
    maxTokens: 32768,
    temperature: 0.7
  },
  
  // Qwen 系列
  'Qwen/Qwen2.5-7B-Instruct': {
    name: 'Qwen2.5-7B',
    description: '通义千问2.5，均衡性能',
    maxTokens: 4096,
    temperature: 0.7
  },
  'Qwen/Qwen2.5-14B-Instruct': {
    name: 'Qwen2.5-14B',
    description: '通义千问2.5增强版，更强推理',
    maxTokens: 4096,
    temperature: 0.6
  },
  'Qwen/Qwen2.5-72B-Instruct': {
    name: 'Qwen2.5-72B',
    description: '通义千问2.5旗舰版，顶级性能',
    maxTokens: 4096,
    temperature: 0.6
  },
  
  // ChatGLM 系列
  'THUDM/glm-4-9b-chat': {
    name: 'GLM-4-9B',
    description: '智谱ChatGLM-4，中文优化',
    maxTokens: 4096,
    temperature: 0.7
  },
  'THUDM/chatglm3-6b': {
    name: 'ChatGLM3-6B',
    description: '智谱ChatGLM3，轻量高效',
    maxTokens: 2048,
    temperature: 0.8
  },
  
  // Yi 系列
  '01-ai/Yi-1.5-9B-Chat': {
    name: 'Yi-1.5-9B',
    description: '零一万物Yi模型，创新思维',
    maxTokens: 4096,
    temperature: 0.7
  },
  '01-ai/Yi-1.5-34B-Chat': {
    name: 'Yi-1.5-34B',
    description: '零一万物Yi大模型，专业级别',
    maxTokens: 4096,
    temperature: 0.6
  },
  
  // Baichuan 系列
  'baichuan-inc/Baichuan2-13B-Chat': {
    name: 'Baichuan2-13B',
    description: '百川智能大模型，中文理解佳',
    maxTokens: 4096,
    temperature: 0.7
  },
  
  // InternLM 系列
  'internlm/internlm2_5-7b-chat': {
    name: 'InternLM2.5-7B',
    description: '上海AI实验室模型，学术优化',
    maxTokens: 4096,
    temperature: 0.7
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
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      mode: 'cors', // 明确指定CORS模式
      credentials: 'omit', // 不发送凭据
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
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
  } catch (error) {
    console.error('❌ [ERROR] 硅基流动API调用错误:', error);
    console.error('❌ [ERROR] Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause
    });
    
    // 详细的错误分类和处理
    let enhancedError = error;
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('🌐 [ERROR] Network fetch failed - possible causes:');
      console.error('  - CORS policy blocking the request');
      console.error('  - Network connectivity issues');
      console.error('  - DNS resolution problems');
      console.error('  - Firewall or proxy blocking');
      
      enhancedError = new Error('网络请求失败：可能是网络连接问题、CORS策略限制或防火墙阻止。请检查网络连接并稍后重试。');
      enhancedError.name = 'NetworkError';
      enhancedError.originalError = error;
    } else if (error?.name === 'AbortError') {
      enhancedError = new Error('请求被中止：可能是网络超时或用户取消了请求。');
      enhancedError.name = 'AbortError';
      enhancedError.originalError = error;
    } else if (error?.message?.includes('ERR_NETWORK')) {
      enhancedError = new Error('网络错误：无法连接到硅基流动服务器，请检查网络连接。');
      enhancedError.name = 'NetworkError';
      enhancedError.originalError = error;
    }
    
    throw enhancedError;
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
  // 确保默认模型在支持列表中
  if (defaultModel in SILICONFLOW_MODELS) {
    return defaultModel as SiliconFlowModel;
  }
  // 如果配置的默认模型不在列表中，使用第一个可用模型
  return 'Pro/deepseek-ai/DeepSeek-V3.1';
}

// 获取推荐的模型（根据用途）
export function getRecommendedModels() {
  return {
    // 推理和逻辑思考
    reasoning: ['Pro/deepseek-ai/DeepSeek-R1', 'Qwen/Qwen2.5-72B-Instruct', '01-ai/Yi-1.5-34B-Chat'],
    // 日常对话
    conversation: ['Pro/moonshotai/Kimi-K2-Instruct', 'moonshot-v1-8k', 'THUDM/glm-4-9b-chat'],
    // 长文本处理
    longText: ['moonshot-v1-32k', 'Pro/deepseek-ai/DeepSeek-V3.1'],
    // 中文优化
    chinese: ['THUDM/glm-4-9b-chat', 'baichuan-inc/Baichuan2-13B-Chat', 'Qwen/Qwen2.5-14B-Instruct'],
    // 轻量快速
    lightweight: ['Qwen/Qwen2.5-7B-Instruct', 'THUDM/chatglm3-6b', '01-ai/Yi-1.5-9B-Chat']
  };
}

// 根据任务类型选择最适合的模型
export function getModelForTask(taskType: 'reasoning' | 'conversation' | 'longText' | 'chinese' | 'lightweight' = 'conversation'): SiliconFlowModel {
  const recommendations = getRecommendedModels();
  const models = recommendations[taskType];
  
  // 返回第一个推荐的模型，如果不存在则返回默认模型
  for (const model of models) {
    if (model in SILICONFLOW_MODELS) {
      return model as SiliconFlowModel;
    }
  }
  
  return getDefaultModel();
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