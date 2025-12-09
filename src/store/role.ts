import { create } from 'zustand'
import type { AuthRoleDTO, RoleAddDTO, RoleUpdateDTO } from '@/types'
import * as roleService from '@/services/role'

interface RoleState {
  roles: AuthRoleDTO[]
  total: number
  loading: boolean
  currentPage: number
  pageSize: number

  fetchRoles: (params?: { pageNum?: number; pageSize?: number; roleName?: string }) => Promise<void>
  addRole: (data: RoleAddDTO) => Promise<void>
  updateRole: (data: RoleUpdateDTO) => Promise<void>
  deleteRole: (id: number) => Promise<void>
}

export const useRoleStore = create<RoleState>((set, get) => ({
  roles: [],
  total: 0,
  loading: false,
  currentPage: 1,
  pageSize: 10,

  fetchRoles: async (params) => {
    set({ loading: true })
    try {
      const response = await roleService.getRoleList({
        pageNum: params?.pageNum || get().currentPage,
        pageSize: params?.pageSize || get().pageSize,
        ...params,
      })

      set({
        roles: response.list,
        total: response.total,
        currentPage: response.pageNum,
        pageSize: response.pageSize,
        loading: false,
      })
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      set({ loading: false })
      throw error
    }
  },

  addRole: async (data) => {
    try {
      await roleService.addRole(data)
      // Refresh role list
      await get().fetchRoles()
    } catch (error) {
      console.error('Failed to add role:', error)
      throw error
    }
  },

  updateRole: async (data) => {
    try {
      await roleService.updateRole(data)
      // Refresh role list
      await get().fetchRoles()
    } catch (error) {
      console.error('Failed to update role:', error)
      throw error
    }
  },

  deleteRole: async (id) => {
    try {
      await roleService.deleteRole(id)
      // Refresh role list
      await get().fetchRoles()
    } catch (error) {
      console.error('Failed to delete role:', error)
      throw error
    }
  },
}))
