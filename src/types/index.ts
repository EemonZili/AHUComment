// User Types
export interface AuthUserDTO {
  pageNo?: number  // 分页查询参数
  pageSize?: number  // 分页查询参数
  id: number
  openid: string  // API 使用小写 openid
  nickname: string
  sex: string  // API 使用 sex 不是 gender
  avatar: string
  bio?: string
  createTime?: string
  status?: number  // 0: 封禁, 1: 正常
  roleId?: number
}

export interface UserUpdateDTO {
  id: number
  openid: string  // 必须包含 openid
  nickname?: string
  sex?: string
  avatar?: string
  bio?: string
}

// Role Types
export interface AuthRoleDTO {
  id: number
  roleName: string
  description?: string
  createTime?: string
  status: number
}

export interface RoleAddDTO {
  roleName: string
  description?: string
}

export interface RoleUpdateDTO {
  id: number
  roleName?: string
  description?: string
}

// Permission Types
export interface AuthPermissionDTO {
  id: number
  permission: string
  description?: string
  createTime?: string
}

export interface PermissionAddDTO {
  permission: string
  description?: string
}

export interface PermissionUpdateDTO {
  id: number
  permission?: string
  description?: string
}

// Role-Permission Types
export interface RolePermissionAddDTO {
  roleId: number
  permissionIds: number[]
}

export interface RolePermissionDeleteDTO {
  roleId: number
  permissionIds: number[]
}

// API Response Types
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResponse<T> {
  data: T[]
  list?: T[]  // 某些API返回list字段
  total?: number
  pageNum?: number
  pageSize?: number
}

// Login Types
export type QRCodeResponse = string // 二维码 URL

export interface SaTokenInfo {
  tokenName: string
  tokenValue: string
  isLogin: boolean
  loginId: any
  loginType: string
  tokenTimeout: number
  sessionTimeout: number
  tokenSessionTimeout: number
  tokenActiveTimeout: number
  loginDeviceType?: string
  tag?: string
}

export type LoginResponse = SaTokenInfo

// Pagination Types
export interface PaginationParams {
  pageNum?: number
  pageSize?: number
}

export interface UserListParams extends PaginationParams {
  nickname?: string
  status?: number  // 0: 封禁, 1: 正常
}

export interface RoleListParams extends PaginationParams {
  roleName?: string
}

export interface PermissionListParams extends PaginationParams {
  permission?: string
}

// Place Types
export interface PlaceDTO {
  id: string
  name: string
  category: PlaceCategory
  subcategory?: string
  address: string
  description?: string
  images: string[]
  rating: number
  reviewCount: number
  tags?: string[]
  openingHours?: string
  facilities?: string[]
  location?: {
    lat: number
    lng: number
  }
  createTime?: string
}

export interface PlaceListParams extends PaginationParams {
  category?: PlaceCategory
  keyword?: string
  sortBy?: 'rating' | 'reviewCount' | 'createTime'
  sortOrder?: 'asc' | 'desc'
}

export type PlaceCategory = '食堂' | '图书馆' | '宿舍' | '教学楼' | '运动场所' | '休闲场所' | '其他'

export interface DetailedRatings {
  environment: number  // 环境
  service: number      // 服务
  price: number        // 价格
  taste: number        // 味道（针对食堂）
}

// Review Types
export interface ReviewDTO {
  id: string
  openid: string  // 发布者openid
  userName: string
  userAvatar: string
  placeId: string
  placeName: string
  placeCategory: string
  rating: number // 1-5 总体评分
  detailedRatings?: DetailedRatings  // 详细评分
  content: string
  images?: string[]
  tags?: string[]
  likeCount: number
  commentCount: number
  viewCount: number
  isLiked?: boolean
  isFavorited?: boolean
  isUseful?: boolean
  usefulCount: number
  createTime: string
  updateTime?: string
}

export interface ReviewCreateDTO {
  placeId: string
  rating: number
  detailedRatings?: DetailedRatings
  content: string
  images?: string[]
  tags?: string[]
}

export interface ReviewListParams extends PaginationParams {
  placeId?: string
  openid?: string  // 查询某个用户的点评
  category?: string
  sortBy?: 'createTime' | 'likeCount' | 'rating'
}

// Comment Types
export interface CommentDTO {
  id: string
  reviewId: string
  openid: string
  userName: string
  userAvatar: string
  content: string
  parentId?: string  // 父评论ID
  replyToUser?: string  // 回复给谁
  replyToUserName?: string
  likeCount: number
  isLiked?: boolean
  createTime: string
}

export interface CommentCreateDTO {
  reviewId: string
  content: string
  parentId?: string
  replyToUser?: string
}

// Interaction Types
export interface LikeDTO {
  targetId: string  // 点评ID或评论ID
  targetType: 'review' | 'comment'
}

export interface FavoriteDTO {
  reviewId: string
}

// Post Category Types (贴文分区)
export interface PostCategoryDTO {
  id?: number
  categoryName: string
  color?: string  // 颜色示例: #ff0000
  status?: number  // 0: 禁用, 1: 启用
  isDeleted?: number  // 0: 未删除, 1: 已删除
}

// Post Types (贴文)
export interface PostDTO {
  id?: number
  openid?: string
  context?: string  // 点评内容
  image?: string  // 图片 url
  likeCount?: number
  markCount?: string  // 评分数
  scoreDistribution?: Record<string, number>  // 分数统计
  ownerOpenid?: string  // 所属用户openId
  categoryId: number  // 所属分区 id
  status?: number  // 0: 禁用, 1: 启用
  isDeleted?: number  // 0: 未删除, 1: 已删除
  uv?: number
  createTime?: string  // 创建时间
}

export interface PostPageQueryParams extends PaginationParams {
  categoryId?: number
  openid?: string
}

// Mark Types (评分)
export interface MarkDTO {
  id?: number
  ownerOpenid: string  // 所属用户openId
  postId: number  // 所属贴文Id
  context?: string  // 用户评论分内容
  score: number  // 用户评分 1-5
  likeCount?: number
  commentCount?: number
  status?: number  // 0: 禁用, 1: 启用
  isDeleted?: number  // 0: 未删除, 1: 已删除
  createTime?: string  // 创建时间
}

export interface MarkPageQueryParams extends PaginationParams {
  openid?: string
  postId?: number
}

// New Comment Types (评论) - 更新以对齐后端API
export interface NewCommentDTO {
  id?: number
  ownerOpenid: string  // 所属用户openId
  pid: number  // 回复评分Id (markId)
  replyId?: number  // 回复评论Id
  context: string  // 用户评论内容
  likeCount?: number
  status?: number  // 0: 禁用, 1: 启用
  isDeleted?: number  // 0: 未删除, 1: 已删除
  createTime?: string  // 创建时间
}

export interface NewCommentPageQueryParams extends PaginationParams {
  openid?: string
  pid?: number
}
