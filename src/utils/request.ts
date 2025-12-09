import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/store/auth'
import type { ApiResponse } from '@/types'

// Create axios instance
// 生产环境直接访问后端地址，开发环境使用代理
const request = axios.create({
  baseURL: import.meta.env.PROD ? 'http://49.235.97.26/auth' : '/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add token to headers
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = useAuthStore.getState().token

    if (token && config.headers) {
      // SaToken 使用 'satoken' 作为 header 名称
      config.headers['satoken'] = token
    }

    return config as any
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse | Blob>) => {
    // Bypass standardized processing for binary responses
    if (response.config && response.config.responseType === 'blob') {
      return response.data as Blob
    }

    const { code, message, data } = response.data as ApiResponse

    // Success
    if (code === 200 || code === 0) {
      return data
    }

    // Business error
    console.error('Business error:', message)
    return Promise.reject(new Error(message || 'Request failed'))
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - Clear auth and redirect to login
          useAuthStore.getState().logout()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(new Error('未授权，请重新登录'))

        case 403:
          // Forbidden
          return Promise.reject(new Error('权限不足'))

        case 404:
          return Promise.reject(new Error('请求的资源不存在'))

        case 500:
          return Promise.reject(new Error('服务器错误'))

        default:
          return Promise.reject(new Error(data?.message || '请求失败'))
      }
    }

    // Network error
    if (error.message.includes('timeout')) {
      return Promise.reject(new Error('请求超时'))
    }

    if (error.message.includes('Network Error')) {
      return Promise.reject(new Error('网络错误，请检查您的网络连接'))
    }

    return Promise.reject(error)
  }
)

export default request
