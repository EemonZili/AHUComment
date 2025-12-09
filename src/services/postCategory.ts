import reviewRequest from '@/utils/reviewRequest'
import type { PostCategoryDTO } from '@/types'

// 查询所有分区
export const listPostCategories = () => {
  return reviewRequest.post<any, PostCategoryDTO[]>('/postCategory/list')
}

// 新增贴文分区
export const addPostCategory = (categoryName: string, data: PostCategoryDTO) => {
  return reviewRequest.post<any, PostCategoryDTO>('/postCategory/add', data, {
    params: { categoryName },
  })
}

// 更新贴文分区
export const updatePostCategory = (id: number, data: PostCategoryDTO) => {
  return reviewRequest.post<any, PostCategoryDTO>('/postCategory/update', data, {
    params: { id },
  })
}

// 删除贴文分区
export const deletePostCategory = (id: number, data: PostCategoryDTO) => {
  return reviewRequest.post<any, void>('/postCategory/delete', data, {
    params: { id },
  })
}
