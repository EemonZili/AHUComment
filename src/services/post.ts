import reviewRequest from '@/utils/reviewRequest'
import postRequest from '@/utils/postRequest'
import type { PostDTO, PostPageQueryParams, AuthUserDTO } from '@/types'

// 新增贴文
export const addPost = (ownerId: string, categoryId: number, context: string, data: PostDTO) => {
  return reviewRequest.post<any, PostDTO>('/post/add', data, {
    params: { ownerId, categoryId, context },
  })
}

// 更新贴文
export const updatePost = (id: number, data: PostDTO) => {
  return reviewRequest.post<any, PostDTO>('/post/update', data, {
    params: { id },
  })
}

// 删除贴文
export const deletePost = (id: number, data: PostDTO) => {
  return reviewRequest.post<any, void>('/post/delete', data, {
    params: { id },
  })
}

// 根据 id 查询贴文
export const queryPostById = (data: PostDTO) => {
  return reviewRequest.post<any, PostDTO>('/post/queryById', data)
}

// 根据 openId 分页查询贴文
export const pageQueryPostByOpenId = (data: AuthUserDTO) => {
  return reviewRequest.post<any, PostDTO[]>('/post/pageQueryByOpenId', data)
}

// 根据 categoryId 分页查询贴文
export const pageQueryPostByCategoryId = (categoryId: number, data: PostDTO) => {
  return reviewRequest.post<any, PostDTO[]>('/post/pageQueryByCategoryId', data, {
    params: { categoryId },
  })
}

// 点赞贴文
export const likePost = (id: number) => {
  return reviewRequest.post<any, void>('/post/like', null, {
    params: { id },
  })
}

// 查看贴文点赞数
export const queryPostLikes = (id: number) => {
  return reviewRequest.post<any, number>('/post/queryLikes', null, {
    params: { id },
  })
}

// 上传贴文图片 - 使用 /post 路径
export const uploadPostPicture = (file: File) => {
  const formData = new FormData()
  formData.append('picture', file)

  return postRequest.post<any, string>('/uploadPicture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 下载贴文图片 - 使用 /post 路径
export const downloadPostPicture = (url: string) => {
  return postRequest.post<any, Blob>(
    '/downloadPicture',
    null,
    {
      params: { url },
      responseType: 'blob',
    }
  )
}
