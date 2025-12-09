import request from '@/utils/request'
import type {
  AuthPermissionDTO,
  RolePermissionAddDTO,
  RolePermissionDeleteDTO,
} from '@/types'

// Add permissions to role
export const addRolePermissions = (data: RolePermissionAddDTO) => {
  return request.post<any, void>('/rolePermission/add', data)
}

// Delete permissions from role
export const deleteRolePermissions = (data: RolePermissionDeleteDTO) => {
  return request.post<any, void>('/rolePermission/delete', data)
}

// Query permissions by role ID
export const getPermissionsByRoleId = (roleId: number) => {
  return request.get<any, AuthPermissionDTO[]>('/rolePermission/queryPermissionsByRoleId', {
    params: { roleId },
  })
}
