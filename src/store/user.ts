import { create } from 'zustand'
import type { AuthUserDTO } from '@/types'
import * as userService from '@/services/user'

interface UserState {
  users: AuthUserDTO[]
  total: number
  loading: boolean
  currentPage: number
  pageSize: number

  fetchUsers: (params?: { pageNum?: number; pageSize?: number; nickname?: string; status?: 'ACTIVE' | 'BANNED' }) => Promise<void>
  changeStatus: (openId: string, status: 'ACTIVE' | 'BANNED') => Promise<void>
  deleteUser: (openId: string) => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  total: 0,
  loading: false,
  currentPage: 1,
  pageSize: 10,

  fetchUsers: async (params) => {
    set({ loading: true })
    try {
      const response = await userService.getUserList({
        pageNum: params?.pageNum || get().currentPage,
        pageSize: params?.pageSize || get().pageSize,
        ...params,
      })

      set({
        users: response.list,
        total: response.total,
        currentPage: response.pageNum,
        pageSize: response.pageSize,
        loading: false,
      })
    } catch (error) {
      console.error('Failed to fetch users:', error)
      set({ loading: false })
      throw error
    }
  },

  changeStatus: async (openId, status) => {
    try {
      await userService.changeUserStatus(openId, status)
      // Refresh user list
      await get().fetchUsers()
    } catch (error) {
      console.error('Failed to change user status:', error)
      throw error
    }
  },

  deleteUser: async (openId) => {
    try {
      await userService.deleteUser(openId)
      // Refresh user list
      await get().fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  },
}))
