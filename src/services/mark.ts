import reviewRequest from '@/utils/reviewRequest'
import type { MarkDTO, MarkPageQueryParams, AuthUserDTO } from '@/types'

// 新增评分
export const addMark = (ownerId: string, postId: number, pid: number, data: MarkDTO) => {
  return reviewRequest.post<any, MarkDTO>('/mark/add', data, {
    params: { ownerId, postId, pid },
  })
}

// 修改评分
export const updateMark = (id: number, data: MarkDTO) => {
  return reviewRequest.post<any, MarkDTO>('/mark/update', data, {
    params: { id },
  })
}

// 删除评分
export const deleteMark = (id: number, data: MarkDTO) => {
  return reviewRequest.post<any, void>('/mark/delete', data, {
    params: { id },
  })
}

// 根据 id 查询评分
export const queryMarkById = (id: number, data: MarkDTO) => {
  return reviewRequest.post<any, MarkDTO>('/mark/queryById', data, {
    params: { id },
  })
}

// 根据 postId 查询评分列表
export const queryMarkByPostId = (postId: number, data: MarkDTO) => {
  return reviewRequest.post<any, MarkDTO[]>('/mark/queryByPostId', data, {
    params: { postId },
  })
}

// 根据 openId 分页查询评分
export const pageQueryMarkByOpenId = (openid: string, data: AuthUserDTO) => {
  return reviewRequest.post<any, MarkDTO[]>('/mark/pageQueryByOpenId', data, {
    params: { openid },
  })
}

// 点赞评分
export const likeMark = (id: number) => {
  return reviewRequest.post<any, void>('/mark/like', null, {
    params: { id },
  })
}

// 查看评分点赞数
export const queryMarkLikes = (id: number) => {
  return reviewRequest.post<any, number>('/mark/queryLikes', null, {
    params: { id },
  })
}
