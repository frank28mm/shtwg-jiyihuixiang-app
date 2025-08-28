import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value)

  // 初始化认证状态
  const initAuth = async () => {
    try {
      loading.value = true
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
      }

      // 监听认证状态变化
      supabase.auth.onAuthStateChange((event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null
        
        if (event === 'SIGNED_OUT') {
          // 清理用户数据
          clearUserData()
        }
      })
    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = '认证初始化失败'
    } finally {
      loading.value = false
    }
  }

  // 登录
  const signIn = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        throw signInError
      }

      if (data.session) {
        session.value = data.session
        user.value = data.user
      }

      return { success: true }
    } catch (err: any) {
      console.error('Sign in error:', err)
      error.value = getErrorMessage(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const signOut = async () => {
    try {
      loading.value = true
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        throw signOutError
      }

      clearUserData()
    } catch (err: any) {
      console.error('Sign out error:', err)
      error.value = getErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  // 清理用户数据
  const clearUserData = () => {
    user.value = null
    session.value = null
    error.value = null
  }

  // 获取错误信息
  const getErrorMessage = (err: any): string => {
    if (err.message?.includes('Invalid login credentials')) {
      return '邮箱或密码错误，请检查后重试'
    }
    if (err.message?.includes('Email not confirmed')) {
      return '邮箱未验证，请检查邮箱并点击验证链接'
    }
    if (err.message?.includes('Too many requests')) {
      return '请求过于频繁，请稍后再试'
    }
    return err.message || '登录失败，请稍后重试'
  }

  // 清除错误信息
  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    error: readonly(error),
    
    // 计算属性
    isAuthenticated,
    
    // 方法
    initAuth,
    signIn,
    signOut,
    clearError
  }
})