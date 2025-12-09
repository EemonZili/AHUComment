import reviewRequest from '@/utils/reviewRequest'
import type { NewCommentDTO, NewCommentPageQueryParams, AuthUserDTO } from '@/types'

// ====== 新的评论API (对齐后端) ======

// 新增评论
export const addComment = (ownerId: string, pid: number, data: NewCommentDTO) => {
  return reviewRequest.post<any, NewCommentDTO>('/comment/add', data, {
    params: { ownerId, pid },
  })
}

// 修改评论
export const updateComment = (id: number, data: NewCommentDTO) => {
  return reviewRequest.post<any, NewCommentDTO>('/comment/update', data, {
    params: { id },
  })
}

// 删除评论
export const deleteComment = (id: number, data: NewCommentDTO) => {
  return reviewRequest.post<any, void>('/comment/delete', data, {
    params: { id },
  })
}

// 根据 openId 分页查询评论
export const pageQueryCommentByOpenId = (data: AuthUserDTO) => {
  return reviewRequest.post<any, NewCommentDTO[]>('/comment/pageQueryByOpenId', data)
}

// 根据 pid 分页查询评论
export const pageQueryCommentByPid = (pid: number, data: NewCommentDTO) => {
  return reviewRequest.post<any, NewCommentDTO[]>('/comment/pageQueryByPid', data, {
    params: { pid },
  })
}

// 点赞回复
export const likeComment = (id: number) => {
  return reviewRequest.post<any, void>('/comment/like', null, {
    params: { id },
  })
}

// 查看评论点赞数
export const queryCommentLikes = (id: number) => {
  return reviewRequest.post<any, number>('/comment/queryLikes', null, {
    params: { id },
  })
}
