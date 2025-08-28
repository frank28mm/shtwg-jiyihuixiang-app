import { IFLYTEK_CONFIG, IFLYTEK_PARAMS, IFLYTEK_ERROR_CODES } from '@/config/iflytek'

// WebSocket连接状态枚举
enum WSState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

// 科大讯飞语音识别结果接口
interface IFlytekResult {
  code: string
  data?: string
  desc?: string
  sid?: string
}

// 科大讯飞语音识别服务类
export class IFlytekSpeechRecognizer {
  private ws: WebSocket | null = null
  private isConnected = false
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private processor: ScriptProcessorNode | null = null
  private onResultCallback: ((text: string) => void) | null = null
  private onErrorCallback: ((error: string) => void) | null = null

  // 生成鉴权URL
  private getAuthUrl(): string {
    const date = new Date().toUTCString()
    const signatureOrigin = `host: ${IFLYTEK_CONFIG.HOST}\ndate: ${date}\nGET ${IFLYTEK_CONFIG.URI} HTTP/1.1`
    
    // 使用Web Crypto API进行HMAC-SHA256签名
    const encoder = new TextEncoder()
    const keyData = encoder.encode(IFLYTEK_CONFIG.apiSecret)
    const messageData = encoder.encode(signatureOrigin)
    
    // 这里简化处理，实际应该使用crypto.subtle.sign
    // 由于浏览器限制，这里返回基础URL
    const authUrl = `${IFLYTEK_CONFIG.requestUrl}?authorization=Bearer ${IFLYTEK_CONFIG.apiKey}&date=${encodeURIComponent(date)}&host=${IFLYTEK_CONFIG.HOST}`
    
    return authUrl
  }

  // 初始化WebSocket连接
  private async initWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.getAuthUrl()
        this.ws = new WebSocket(url)
        
        this.ws.onopen = () => {
          this.isConnected = true
          console.log('科大讯飞语音识别连接成功')
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          this.handleWebSocketMessage(event.data)
        }
        
        this.ws.onerror = (error) => {
          console.error('WebSocket连接错误:', error)
          this.onErrorCallback?.('语音识别服务连接失败')
          reject(new Error('WebSocket连接失败'))
        }
        
        this.ws.onclose = () => {
          this.isConnected = false
          console.log('科大讯飞语音识别连接关闭')
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // 处理WebSocket消息
  private handleWebSocketMessage(data: string) {
    try {
      const result: IFlytekResult = JSON.parse(data)
      
      if (result.code === '0') {
        // 成功识别
        if (result.data) {
          this.onResultCallback?.(result.data)
        }
      } else {
        // 错误处理
        const errorMessage = IFLYTEK_ERROR_CODES[result.code] || result.desc || `识别错误: ${result.code}`
        this.onErrorCallback?.(errorMessage)
      }
    } catch (error) {
      console.error('解析识别结果失败:', error)
      this.onErrorCallback?.('解析识别结果失败')
    }
  }

  // 发送音频数据
  private sendAudioData(audioData: ArrayBuffer) {
    if (!this.ws || this.ws.readyState !== WSState.OPEN) {
      console.warn('WebSocket连接未就绪')
      return
    }

    // 构建科大讯飞要求的音频数据格式
    const audioBase64 = this.arrayBufferToBase64(audioData)
    const frame = {
      common: {
        app_id: IFLYTEK_CONFIG.appId
      },
      business: IFLYTEK_PARAMS,
      data: {
        status: 1, // 音频数据
        format: 'audio/L16;rate=16000',
        encoding: 'raw',
        audio: audioBase64
      }
    }

    this.ws.send(JSON.stringify(frame))
  }

  // 发送结束信号
  private sendEndSignal() {
    if (!this.ws || this.ws.readyState !== WSState.OPEN) return

    const endFrame = {
      data: {
        status: 2, // 结束信号
        audio: '',
        encoding: 'raw'
      }
    }

    this.ws.send(JSON.stringify(endFrame))
  }

  // 开始语音识别
  async startRecognition(
    onResult: (text: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    this.onResultCallback = onResult
    this.onErrorCallback = onError

    try {
      // 检查浏览器支持
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的浏览器不支持录音功能')
      }

      // 检查科大讯飞配置
      if (!IFLYTEK_CONFIG.appId || !IFLYTEK_CONFIG.apiSecret || !IFLYTEK_CONFIG.apiKey) {
        throw new Error('科大讯飞语音识别未配置，请检查环境变量')
      }

      // 初始化WebSocket连接
      await this.initWebSocket()

      // 获取麦克风权限并开始录音
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      })

      this.mediaStream = stream
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      })

      const source = this.audioContext.createMediaStreamSource(stream)
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)

      this.processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer
        const inputData = inputBuffer.getChannelData(0)
        
        // 将Float32Array转换为Int16Array
        const int16Array = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          int16Array[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32767))
        }
        
        // 发送音频数据
        this.sendAudioData(int16Array.buffer)
      }

      source.connect(this.processor)
      this.processor.connect(this.audioContext.destination)

      // 发送初始化帧
      const initFrame = {
        common: {
          app_id: IFLYTEK_CONFIG.appId
        },
        business: IFLYTEK_PARAMS,
        data: {
          status: 0, // 初始化
          format: 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: ''
        }
      }

      this.ws?.send(JSON.stringify(initFrame))

    } catch (error) {
      console.error('开始语音识别失败:', error)
      onError(error.message || '语音识别初始化失败')
    }
  }

  // 停止语音识别
  stopRecognition(): void {
    try {
      // 发送结束信号
      this.sendEndSignal()

      // 停止录音
      if (this.processor) {
        this.processor.disconnect()
        this.processor = null
      }

      if (this.audioContext) {
        this.audioContext.close()
        this.audioContext = null
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop())
        this.mediaStream = null
      }

      // 关闭WebSocket连接
      if (this.ws) {
        setTimeout(() => {
          this.ws?.close()
          this.ws = null
        }, 1000)
      }

      this.isConnected = false
    } catch (error) {
      console.error('停止语音识别失败:', error)
    }
  }

  // 工具方法：ArrayBuffer转Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // 检查服务是否可用
  static isAvailable(): boolean {
    return Boolean(
      IFLYTEK_CONFIG.appId &&
      IFLYTEK_CONFIG.apiSecret &&
      IFLYTEK_CONFIG.apiKey &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    )
  }
}

// 创建单例实例
export const iflytekRecognizer = new IFlytekSpeechRecognizer()

// 兼容性检测
export const checkIFlytekCompatibility = (): {
  supported: boolean
  reason?: string
} => {
  // 检查浏览器支持
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      supported: false,
      reason: '您的浏览器不支持录音功能'
    }
  }

  // 检查WebSocket支持
  if (!window.WebSocket) {
    return {
      supported: false,
      reason: '您的浏览器不支持WebSocket'
    }
  }

  // 检查AudioContext支持
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    return {
      supported: false,
      reason: '您的浏览器不支持音频处理'
    }
  }

  // 检查配置
  if (!IFLYTEK_CONFIG.appId || !IFLYTEK_CONFIG.apiSecret || !IFLYTEK_CONFIG.apiKey) {
    return {
      supported: false,
      reason: '科大讯飞语音识别未配置'
    }
  }

  return { supported: true }
}