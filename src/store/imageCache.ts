import { create } from 'zustand'
import { downLoadAvatar } from '@/services/user'
import { downloadPostPicture } from '@/services/post'

interface ImageCacheState {
  avatarCache: Record<string, string> // url -> blob URL
  imageCache: Record<string, string> // url -> blob URL
  loading: Record<string, boolean> // url -> loading state

  fetchAvatar: (url: string) => Promise<string | null>
  fetchImage: (url: string) => Promise<string | null>
  getAvatar: (url: string) => string | null
  getImage: (url: string) => string | null
}

export const useImageCache = create<ImageCacheState>((set, get) => ({
  avatarCache: {},
  imageCache: {},
  loading: {},

  // 获取头像（带缓存）
  fetchAvatar: async (url: string) => {
    if (!url) return null

    const state = get()

    // 如果已经在缓存中，直接返回
    if (state.avatarCache[url]) {
      return state.avatarCache[url]
    }

    // 如果正在加载，等待加载完成
    if (state.loading[url]) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const currentState = get()
          if (!currentState.loading[url]) {
            clearInterval(checkInterval)
            resolve(currentState.avatarCache[url] || null)
          }
        }, 100)
      })
    }

    // 开始加载
    set((state) => ({
      loading: { ...state.loading, [url]: true },
    }))

    try {
      const blob = await downLoadAvatar(url)
      const blobUrl = URL.createObjectURL(blob)

      // 保存到缓存
      set((state) => ({
        avatarCache: { ...state.avatarCache, [url]: blobUrl },
        loading: { ...state.loading, [url]: false },
      }))

      return blobUrl
    } catch (error) {
      console.error(`Failed to fetch avatar ${url}:`, error)

      // 清除加载状态
      set((state) => ({
        loading: { ...state.loading, [url]: false },
      }))

      return null
    }
  },

  // 获取图片（带缓存）
  fetchImage: async (url: string) => {
    if (!url) return null

    const state = get()

    // 如果已经在缓存中，直接返回
    if (state.imageCache[url]) {
      return state.imageCache[url]
    }

    // 如果正在加载，等待加载完成
    if (state.loading[url]) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const currentState = get()
          if (!currentState.loading[url]) {
            clearInterval(checkInterval)
            resolve(currentState.imageCache[url] || null)
          }
        }, 100)
      })
    }

    // 开始加载
    set((state) => ({
      loading: { ...state.loading, [url]: true },
    }))

    try {
      const blob = await downloadPostPicture(url)
      const blobUrl = URL.createObjectURL(blob)

      // 保存到缓存
      set((state) => ({
        imageCache: { ...state.imageCache, [url]: blobUrl },
        loading: { ...state.loading, [url]: false },
      }))

      return blobUrl
    } catch (error) {
      console.error(`Failed to fetch image ${url}:`, error)

      // 清除加载状态
      set((state) => ({
        loading: { ...state.loading, [url]: false },
      }))

      return null
    }
  },

  // 同步获取头像（仅从缓存）
  getAvatar: (url: string) => {
    const state = get()
    return state.avatarCache[url] || null
  },

  // 同步获取图片（仅从缓存）
  getImage: (url: string) => {
    const state = get()
    return state.imageCache[url] || null
  },
}))
