import request from '@/utils/request'
import type { ReviewDTO, PageResponse } from '@/types'

// ¹^¹Ä
export const likeReview = (reviewId: string) => {
  return request.post<any, void>(`/review/like/${reviewId}`)
}

// Öˆ¹^¹Ä
export const unlikeReview = (reviewId: string) => {
  return request.delete<any, void>(`/review/unlike/${reviewId}`)
}

// 6Ï¹Ä
export const favoriteReview = (reviewId: string) => {
  return request.post<any, void>(`/review/favorite/${reviewId}`)
}

// Öˆ6Ï¹Ä
export const unfavoriteReview = (reviewId: string) => {
  return request.delete<any, void>(`/review/unfavorite/${reviewId}`)
}

// °¹Ä:	(
export const markReviewUseful = (reviewId: string) => {
  return request.post<any, void>(`/review/useful/${reviewId}`)
}

// Öˆ°	(
export const unmarkReviewUseful = (reviewId: string) => {
  return request.delete<any, void>(`/review/useful/${reviewId}`)
}

// ·Ö„6Ïh
export const getMyFavorites = (pageNum: number = 1, pageSize: number = 10) => {
  return request.get<any, PageResponse<ReviewDTO>>('/review/my-favorites', {
    params: { pageNum, pageSize }
  })
}

// ·Ö„¹^h
export const getMyLikes = (pageNum: number = 1, pageSize: number = 10) => {
  return request.get<any, PageResponse<ReviewDTO>>('/review/my-likes', {
    params: { pageNum, pageSize }
  })
}
