import { create } from 'zustand'
import type { AuthPermissionDTO, PermissionAddDTO } from '@/types'
import * as permissionService from '@/services/permission'
import * as rolePermissionService from '@/services/rolePermission'

interface PermissionState {
  permissions: AuthPermissionDTO[]
  total: number
  loading: boolean
  currentPage: number
  pageSize: number

  fetchPermissions: (params?: { pageNum?: number; pageSize?: number; permission?: string }) => Promise<void>
  addPermission: (data: PermissionAddDTO) => Promise<void>
  deletePermission: (id: number) => Promise<void>
  getPermissionsByRoleId: (roleId: number) => Promise<AuthPermissionDTO[]>
  addRolePermissions: (roleId: number, permissionIds: number[]) => Promise<void>
  deleteRolePermissions: (roleId: number, permissionIds: number[]) => Promise<void>
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  total: 0,
  loading: false,
  currentPage: 1,
  pageSize: 10,

  fetchPermissions: async (params) => {
    set({ loading: true })
    try {
      const response = await permissionService.getPermissionList({
        pageNum: params?.pageNum || get().currentPage,
        pageSize: params?.pageSize || get().pageSize,
        ...params,
      })

      set({
        permissions: response.list,
        total: response.total,
        currentPage: response.pageNum,
        pageSize: response.pageSize,
        loading: false,
      })
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      set({ loading: false })
      throw error
    }
  },

  addPermission: async (data) => {
    try {
      await permissionService.addPermission(data)
      // Refresh permission list
      await get().fetchPermissions()
    } catch (error) {
      console.error('Failed to add permission:', error)
      throw error
    }
  },

  deletePermission: async (id) => {
    try {
      await permissionService.deletePermission(id)
      // Refresh permission list
      await get().fetchPermissions()
    } catch (error) {
      console.error('Failed to delete permission:', error)
      throw error
    }
  },

  getPermissionsByRoleId: async (roleId) => {
    try {
      return await rolePermissionService.getPermissionsByRoleId(roleId)
    } catch (error) {
      console.error('Failed to get permissions by role ID:', error)
      throw error
    }
  },

  addRolePermissions: async (roleId, permissionIds) => {
    try {
      await rolePermissionService.addRolePermissions({ roleId, permissionIds })
    } catch (error) {
      console.error('Failed to add role permissions:', error)
      throw error
    }
  },

  deleteRolePermissions: async (roleId, permissionIds) => {
    try {
      await rolePermissionService.deleteRolePermissions({ roleId, permissionIds })
    } catch (error) {
      console.error('Failed to delete role permissions:', error)
      throw error
    }
  },
}))
