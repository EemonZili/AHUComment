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
export const updatePost = (data: PostDTO) => {
  return reviewRequest.post<any, PostDTO>('/post/update', data)
}

// 删除贴文
export const deletePost = (data: PostDTO) => {
  return reviewRequest.post<any, void>('/post/delete', data)
}

// 根据 id 查询贴文
export const queryPostById = (data: PostDTO) => {
  return reviewRequest.post<any, PostDTO>('/post/queryById', data)
}

// 根据 openId 分页查询贴文
export const pageQueryPostByOpenId = (data: AuthUserDTO) => {
  return reviewRequest.post<any, PostDTO[]>('/post/pageQueryByOpenId', data)
}

// 根据 ownerOpenid 分页查询贴文（别名，为了兼容）
export const pageQueryPostByOwnerOpenid = (data: PostDTO) => {
  return reviewRequest.post<any, PostDTO[]>('/post/pageQueryByOwnerOpenid', data)
}

// 根据 categoryId 分页查询贴文
export const pageQueryPostByCategoryId = (data: PostDTO) => {
  return reviewRequest.post<any, PostDTO[]>('/post/pageQueryByCategoryId', data)
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

// 上传贴文图片 - baseURL已经是/review，所以只需/uploadPicture
export const uploadPostPicture = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return reviewRequest.post<any, string>('/uploadPicture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 下载贴文图片 - baseURL已经是/review，所以只需/downLoadPicture
export const downloadPostPicture = (url: string) => {
  return reviewRequest.post<any, Blob>(
    '/downLoadPicture',
    null,
    {
      params: { url },
      responseType: 'blob',
    }
  )
}
