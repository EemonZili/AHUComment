import request from '@/utils/request'
import type {
  AuthRoleDTO,
  RoleAddDTO,
  RoleUpdateDTO,
  PageResponse,
} from '@/types'

// Get role list
export const getRoleList = () => {
  return request.post<any, PageResponse<AuthRoleDTO>>('/role/list')
}

// Add new role
export const addRole = (data: RoleAddDTO) => {
  return request.post<any, AuthRoleDTO>('/role/add', data)
}

// Update role
export const updateRole = (data: RoleUpdateDTO) => {
  return request.post<any, AuthRoleDTO>('/role/update', data)
}

// Delete role
export const deleteRole = (id: String) => {
  return request.post<any, void>(`/role/delete`, {id})
}
