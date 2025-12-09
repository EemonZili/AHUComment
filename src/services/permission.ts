import request from '@/utils/request'
import type {
  AuthPermissionDTO,
  PermissionAddDTO,
  PermissionUpdateDTO,
  PageResponse,
} from '@/types'

// Get permission list
export const getPermissionList = () => {
  return request.post<any, PageResponse<AuthPermissionDTO>>('/permission/list')
}

// Add new permission
export const addPermission = (data: PermissionAddDTO) => {
  return request.post<any, AuthPermissionDTO>('/permission/add', data)
}

// Update permission
export const updatePermission = (data: PermissionUpdateDTO) => {
  return request.post<any, AuthPermissionDTO>('/permission/update', data)
}

// Delete permission
export const deletePermission = (id: String) => {
  return request.post<any, void>(`/permission/delete`, {id})
}
