// 科大讯飞语音识别API配置
export const IFLYTEK_CONFIG = {
  // WebAPI配置
  APPID: import.meta.env.VITE_IFLYTEK_APPID || 'd9548d17',
  API_SECRET: import.meta.env.VITE_IFLYTEK_API_SECRET || 'ODJiOGQ0YmUzMTU4MmU5ZmIyODJmYzQw',
  API_KEY: import.meta.env.VITE_IFLYTEK_API_KEY || 'ef04a637ba9435d2afcd6d7e78efacd',
  
  // 语音听写API配置
  HOST: 'iat-api.xfyun.cn',
  URI: '/v2/iat',
  
  // 应用ID和密钥
  get appId() { return this.APPID },
  get apiSecret() { return this.API_SECRET },
  get apiKey() { return this.API_KEY },
  
  // 请求URL
  get requestUrl() {
    return `wss://${this.HOST}${this.URI}`
  }
}

// 科大讯飞API错误码映射
export const IFLYTEK_ERROR_CODES: Record<string, string> = {
  '10105': 'appid无效',
  '10106': 'ip无效',
  '10107': 'digest校验失败',
  '10108': '当前时间戳无效',
  '10109': '当前接口未授权',
  '10110': '当前接口未开通或已过期',
  '10111': '当前接口已过期',
  '10112': '当前接口调用次数已用完',
  '10113': '当前接口并发数已用完',
  '10114': '当前接口调用频率超限',
  '10115': '当前接口并发数已用完',
  '10116': '当前接口调用次数已用完',
  '10117': '当前接口调用频率超限',
  '10118': '当前接口已过期',
  '10119': '当前接口未开通或已过期',
  '10120': '当前接口未授权',
  '10121': '当前接口已过期',
  '10122': '当前接口调用次数已用完',
  '10123': '当前接口调用频率超限',
  '10124': '当前接口并发数已用完',
  '10125': '当前接口未授权',
  '10126': '当前接口未开通或已过期',
  '10127': '当前接口已过期',
  '10128': '当前接口调用次数已用完',
  '10129': '当前接口调用频率超限',
  '10130': '当前接口并发数已用完',
  '10131': '当前接口未授权',
  '10132': '当前接口未开通或已过期',
  '10133': '当前接口已过期',
  '10134': '当前接口调用次数已用完',
  '10135': '当前接口调用频率超限',
  '10136': '当前接口并发数已用完',
  '10137': '当前接口未授权',
  '10138': '当前接口未开通或已过期',
  '10139': '当前接口已过期',
  '10140': '当前接口调用次数已用完',
  '10141': '当前接口调用频率超限',
  '10142': '当前接口并发数已用完',
  '10143': '当前接口未授权',
  '10144': '当前接口未开通或已过期',
  '10145': '当前接口已过期',
  '11200': '引擎错误',
  '11201': '引擎超时',
  '11202': '引擎内部错误',
  '10313': '音频解码失败',
  '10317': '音频格式错误',
}

// 科大讯飞语音识别参数配置
export const IFLYTEK_PARAMS = {
  // 引擎类型
  engine_type: 'cloud',
  
  // 音频格式
  aue: 'raw',
  
  // 采样率
  sample_rate: 16000,
  
  // 语言区域
  language: 'zh_cn',
  
  // 口音
  accent: 'mandarin',
  
  // 领域
  domain: 'iat',
  
  // 返回结果格式
  result_type: 'plain',
  
  // 是否返回词级别时间戳
  nlp_version: '2.0',
  
  // 是否开启标点符号
  ptt: 1,
  
  // 是否开启VAD
  vad_eos: 2000,
  
  // 是否开启语义理解
  pd: 'all'
}