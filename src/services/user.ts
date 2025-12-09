import request from '@/utils/request'
import type {
  QRCodeResponse,
  LoginResponse,
  AuthUserDTO,
  UserUpdateDTO,
  UserListParams,
  PageResponse,
} from '@/types'

// Get QR code for login
export const getQRCode = (sessionId: string) => {
  return request.post<any, QRCodeResponse>('/user/getQR', undefined, {
    params: { sid: sessionId },
  })
}

// Do login with session ID and openId
export const doLogin = (openId: string, sessionId: string) => {
  return request.post<any, LoginResponse>('/user/doLogin', undefined, {
    params: { openId, sid: sessionId },
  })
}

// Get current user info
export const getUserInfo = (openId?: string) => {
  // 如果提供了 openId，在请求体中传递
  const body = openId ? { openid: openId } : {}
  return request.post<any, AuthUserDTO>('/user/getUserInfo', body)
}

// Update user profile
export const updateUser = (data: UserUpdateDTO) => {
  return request.post<any, boolean>('/user/update', data)
}

// Upload avatar
export const uploadAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('avatar', file)  // API 参数名是 avatar

  return request.post<any, string>('/uploadAvatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// Get user list (admin only)
export const getUserList = (params: UserListParams) => {
  return request.get<any, PageResponse<AuthUserDTO>>('/user/list', { params })
}

// Change user status (admin only)
export const changeUserStatus = (openid: string, status: number) => {
  return request.post<any, boolean>('/user/changeStatus', { openid, status })
}

// Delete user (admin only)
export const deleteUser = (openid: string) => {
  return request.post<any, boolean>('/user/delete', { openid })
}

// Download avatar
export const downLoadAvatar = (url: string) => {
  return request.post<any, Blob>(
    '/downLoadAvatar',
    null, // Body is null
    {
      params: { url }, // Send 'url' as a query parameter
      responseType: 'blob',
    }
  )
}
