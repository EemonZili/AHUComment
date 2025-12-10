import { create } from 'zustand'
import type { AuthUserDTO } from '@/types'
import { getUserInfo } from '@/services'

interface UserCacheState {
  users: Record<string, AuthUserDTO> // openid -> user info
  loading: Record<string, boolean> // openid -> loading state
  fetchUser: (openid: string) => Promise<AuthUserDTO | null>
  fetchUsers: (openids: string[]) => Promise<void> // 批量获取
  getUser: (openid: string) => AuthUserDTO | null
}

export const useUserCache = create<UserCacheState>((set, get) => ({
  users: {},
  loading: {},

  // 获取用户信息（带缓存）
  fetchUser: async (openid: string) => {
    if (!openid) return null

    const state = get()

    // 如果已经在缓存中，直接返回
    if (state.users[openid]) {
      return state.users[openid]
    }

    // 如果正在加载，等待加载完成
    if (state.loading[openid]) {
      // 等待加载完成后再次尝试获取
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const currentState = get()
          if (!currentState.loading[openid]) {
            clearInterval(checkInterval)
            resolve(currentState.users[openid] || null)
          }
        }, 100)
      })
    }

    // 开始加载
    set((state) => ({
      loading: { ...state.loading, [openid]: true },
    }))

    try {
      const userInfo = await getUserInfo(openid)

      // 保存到缓存
      set((state) => ({
        users: { ...state.users, [openid]: userInfo },
        loading: { ...state.loading, [openid]: false },
      }))

      return userInfo
    } catch (error) {
      console.error(`Failed to fetch user info for ${openid}:`, error)

      // 清除加载状态
      set((state) => ({
        loading: { ...state.loading, [openid]: false },
      }))

      return null
    }
  },

  // 同步获取用户信息（仅从缓存）
  getUser: (openid: string) => {
    const state = get()
    return state.users[openid] || null
  },

  // 批量获取用户信息（优化性能）
  fetchUsers: async (openids: string[]) => {
    const state = get()

    // 过滤出需要获取的用户（未缓存且未加载中）
    const uniqueOpenids = Array.from(new Set(openids.filter(id => id)))
    const toFetch = uniqueOpenids.filter(
      (openid) => !state.users[openid] && !state.loading[openid]
    )

    if (toFetch.length === 0) return

    // 标记所有需要获取的用户为加载中
    set((state) => ({
      loading: {
        ...state.loading,
        ...Object.fromEntries(toFetch.map((id) => [id, true])),
      },
    }))

    // 并发获取所有用户信息
    const results = await Promise.allSettled(
      toFetch.map((openid) => getUserInfo(openid))
    )

    // 处理结果
    const newUsers: Record<string, AuthUserDTO> = {}
    const newLoading: Record<string, boolean> = {}

    results.forEach((result, index) => {
      const openid = toFetch[index]
      newLoading[openid] = false

      if (result.status === 'fulfilled' && result.value) {
        newUsers[openid] = result.value
      } else {
        console.error(`Failed to fetch user info for ${openid}:`, result)
      }
    })

    // 批量更新状态
    set((state) => ({
      users: { ...state.users, ...newUsers },
      loading: { ...state.loading, ...newLoading },
    }))
  },
}))
