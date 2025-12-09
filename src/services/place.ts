import request from '@/utils/request'
import type { PlaceDTO, PlaceListParams, PageResponse } from '@/types'

// ·Ö0¹h
export const getPlaceList = (params: PlaceListParams) => {
  return request.get<any, PageResponse<PlaceDTO>>('/place/list', { params })
}

// ·Ö0¹æÅ
export const getPlaceDetail = (id: string) => {
  return request.get<any, PlaceDTO>(`/place/${id}`)
}

// "0¹
export const searchPlaces = (keyword: string) => {
  return request.get<any, PlaceDTO[]>('/place/search', { params: { keyword } })
}

// ·Öíè0¹
export const getHotPlaces = (limit: number = 10) => {
  return request.get<any, PlaceDTO[]>('/place/hot', { params: { limit } })
}

// ·Ö0¹ß¡áo¡X	
export const getPlaceStats = (placeId: string) => {
  return request.get<any, {
    totalReviews: number
    avgRating: number
    ratingDistribution: Record<number, number>
  }>(`/place/${placeId}/stats`)
}
