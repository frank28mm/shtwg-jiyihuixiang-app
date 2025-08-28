/**
 * 移动端触摸手势工具
 */

export interface TouchGestureOptions {
  threshold?: number // 滑动阈值，默认50px
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export class TouchGestureHandler {
  private startX = 0
  private startY = 0
  private endX = 0
  private endY = 0
  private threshold: number
  private options: TouchGestureOptions

  constructor(element: HTMLElement, options: TouchGestureOptions = {}) {
    this.threshold = options.threshold || 50
    this.options = options
    this.bindEvents(element)
  }

  private bindEvents(element: HTMLElement) {
    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true })
  }

  private handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    this.startX = touch.clientX
    this.startY = touch.clientY
  }

  private handleTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0]
    this.endX = touch.clientX
    this.endY = touch.clientY
    this.handleGesture()
  }

  private handleGesture() {
    const deltaX = this.endX - this.startX
    const deltaY = this.endY - this.startY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // 判断是否达到滑动阈值
    if (Math.max(absDeltaX, absDeltaY) < this.threshold) {
      return
    }

    // 判断滑动方向
    if (absDeltaX > absDeltaY) {
      // 水平滑动
      if (deltaX > 0) {
        this.options.onSwipeRight?.()
      } else {
        this.options.onSwipeLeft?.()
      }
    } else {
      // 垂直滑动
      if (deltaY > 0) {
        this.options.onSwipeDown?.()
      } else {
        this.options.onSwipeUp?.()
      }
    }
  }

  destroy(element: HTMLElement) {
    element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
  }
}

/**
 * 防止移动端双击缩放
 */
export function preventDoubleClickZoom(element: HTMLElement) {
  let lastTouchEnd = 0
  element.addEventListener('touchend', (e) => {
    const now = new Date().getTime()
    if (now - lastTouchEnd <= 300) {
      e.preventDefault()
    }
    lastTouchEnd = now
  }, false)
}

/**
 * 移动端长按事件
 */
export function addLongPressEvent(element: HTMLElement, callback: () => void, duration = 500) {
  let timer: NodeJS.Timeout | null = null
  let startTouch = false

  const start = () => {
    startTouch = true
    timer = setTimeout(() => {
      if (startTouch) {
        callback()
      }
    }, duration)
  }

  const end = () => {
    startTouch = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  element.addEventListener('touchstart', start, { passive: true })
  element.addEventListener('touchend', end, { passive: true })
  element.addEventListener('touchmove', end, { passive: true })
  element.addEventListener('touchcancel', end, { passive: true })

  return () => {
    element.removeEventListener('touchstart', start)
    element.removeEventListener('touchend', end)
    element.removeEventListener('touchmove', end)
    element.removeEventListener('touchcancel', end)
    if (timer) {
      clearTimeout(timer)
    }
  }
}

/**
 * 移动端安全区域适配
 */
export function addSafeAreaSupport() {
  // 添加CSS变量支持安全区域
  const style = document.createElement('style')
  style.textContent = `
    :root {
      --safe-area-inset-top: env(safe-area-inset-top);
      --safe-area-inset-right: env(safe-area-inset-right);
      --safe-area-inset-bottom: env(safe-area-inset-bottom);
      --safe-area-inset-left: env(safe-area-inset-left);
    }
    
    .safe-area-top {
      padding-top: var(--safe-area-inset-top);
    }
    
    .safe-area-bottom {
      padding-bottom: var(--safe-area-inset-bottom);
    }
    
    .safe-area-left {
      padding-left: var(--safe-area-inset-left);
    }
    
    .safe-area-right {
      padding-right: var(--safe-area-inset-right);
    }
  `
  document.head.appendChild(style)
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 获取视口高度（考虑移动端键盘弹出）
 */
export function getViewportHeight(): number {
  return window.visualViewport?.height || window.innerHeight
}

/**
 * 监听视口变化（移动端键盘弹出/收起）
 */
export function onViewportChange(callback: (height: number) => void): () => void {
  const handleResize = () => {
    const height = window.visualViewport?.height || window.innerHeight
    callback(height)
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize)
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
  } else {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }
}