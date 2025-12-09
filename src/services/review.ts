import type { ReviewDTO, PlaceDTO, ReviewListParams, CreateReviewDTO, PageResponse } from '@/types'

// Mock data - 待后端实现后替换
const mockPlaces: PlaceDTO[] = [
  {
    id: '1',
    name: '图书馆',
    category: '学习场所',
    address: '校园中心区',
    description: '藏书丰富，学习氛围好',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400',
    rating: 4.5,
    reviewCount: 128,
    tags: ['安静', '空调', 'WiFi'],
  },
  {
    id: '2',
    name: '食堂一楼',
    category: '餐饮',
    address: '东区食堂',
    description: '物美价廉，菜品丰富',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    rating: 4.2,
    reviewCount: 256,
    tags: ['实惠', '味道好', '份量足'],
  },
  {
    id: '3',
    name: '体育馆',
    category: '运动场所',
    address: '西区体育中心',
    description: '设施齐全，环境优良',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    rating: 4.7,
    reviewCount: 89,
    tags: ['设施好', '干净', '教练专业'],
  },
  {
    id: '4',
    name: '星巴克',
    category: '咖啡厅',
    address: '校园商业街',
    description: '学习和社交的好去处',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
    rating: 4.3,
    reviewCount: 167,
    tags: ['环境好', '适合学习', 'WiFi快'],
  },
]

const mockReviews: ReviewDTO[] = [
  {
    id: '1',
    userId: 'user1',
    userName: '张三',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    placeId: '1',
    placeName: '图书馆',
    placeCategory: '学习场所',
    rating: 5,
    title: '学习氛围超级好！',
    content:
      '图书馆真的太棒了，环境安静，空调适宜，WiFi速度也很快。每次来都能找到座位，自习室的设计也很人性化。推荐大家来这里学习！',
    images: [
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
    ],
    tags: ['安静', '空调', 'WiFi'],
    likeCount: 45,
    commentCount: 12,
    viewCount: 230,
    isLiked: false,
    isFavorited: true,
    createTime: '2025-11-28 14:30:00',
  },
  {
    id: '2',
    userId: 'user2',
    userName: '李四',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    placeId: '2',
    placeName: '食堂一楼',
    placeCategory: '餐饮',
    rating: 4,
    title: '性价比很高的食堂',
    content: '菜品丰富，价格实惠，份量也很足。最喜欢他们的红烧肉和酸菜鱼，味道正宗。就是高峰期人比较多，要早点去。',
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'],
    tags: ['实惠', '味道好'],
    likeCount: 32,
    commentCount: 8,
    viewCount: 156,
    isLiked: true,
    isFavorited: false,
    createTime: '2025-11-27 12:15:00',
  },
  {
    id: '3',
    userId: 'user3',
    userName: '王五',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    placeId: '3',
    placeName: '体育馆',
    placeCategory: '运动场所',
    rating: 5,
    title: '健身设施一流',
    content: '体育馆的健身器材都是新的，环境也很干净。教练很专业，会根据你的需求制定训练计划。更衣室和淋浴间也很整洁。',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    ],
    tags: ['设施好', '干净', '教练专业'],
    likeCount: 67,
    commentCount: 15,
    viewCount: 289,
    isLiked: false,
    isFavorited: false,
    createTime: '2025-11-26 18:45:00',
  },
  {
    id: '4',
    userId: 'user4',
    userName: '赵六',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    placeId: '4',
    placeName: '星巴克',
    placeCategory: '咖啡厅',
    rating: 4,
    title: '学习的好地方',
    content: '环境很舒适，适合学习和聚会。咖啡品质稳定，WiFi速度快。唯一的缺点就是价格稍贵，但整体体验还是很不错的。',
    images: ['https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800'],
    tags: ['环境好', '适合学习'],
    likeCount: 28,
    commentCount: 6,
    viewCount: 134,
    isLiked: false,
    isFavorited: false,
    createTime: '2025-11-25 16:20:00',
  },
  {
    id: '5',
    userId: 'user1',
    userName: '张三',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    placeId: '2',
    placeName: '食堂一楼',
    placeCategory: '餐饮',
    rating: 5,
    title: '早餐很棒！',
    content: '早餐品种丰富，包子、豆浆、油条、煎饼果子应有尽有。价格也很便宜，味道正宗。推荐大家试试他们的灌汤包！',
    tags: ['早餐', '实惠'],
    likeCount: 19,
    commentCount: 4,
    viewCount: 98,
    isLiked: false,
    isFavorited: false,
    createTime: '2025-11-24 08:30:00',
  },
]

// Get review list
export const getReviewList = async (params: ReviewListParams): Promise<PageResponse<ReviewDTO>> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredReviews = [...mockReviews]

  // Filter by category
  if (params.category) {
    filteredReviews = filteredReviews.filter((r) => r.placeCategory === params.category)
  }

  // Filter by keyword
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filteredReviews = filteredReviews.filter(
      (r) =>
        r.title.toLowerCase().includes(keyword) ||
        r.content.toLowerCase().includes(keyword) ||
        r.placeName.toLowerCase().includes(keyword)
    )
  }

  // Filter by placeId
  if (params.placeId) {
    filteredReviews = filteredReviews.filter((r) => r.placeId === params.placeId)
  }

  // Filter by userId
  if (params.userId) {
    filteredReviews = filteredReviews.filter((r) => r.userId === params.userId)
  }

  // Sort
  const sortBy = params.sortBy || 'latest'
  if (sortBy === 'latest') {
    filteredReviews.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
  } else if (sortBy === 'rating') {
    filteredReviews.sort((a, b) => b.rating - a.rating)
  } else if (sortBy === 'popular') {
    filteredReviews.sort((a, b) => b.likeCount + b.commentCount - (a.likeCount + a.commentCount))
  }

  // Pagination
  const pageNum = params.pageNum || 1
  const pageSize = params.pageSize || 10
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  const paginatedReviews = filteredReviews.slice(start, end)

  return {
    list: paginatedReviews,
    total: filteredReviews.length,
    pageNum,
    pageSize,
  }
}

// Get review by ID
export const getReviewById = async (id: string): Promise<ReviewDTO | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockReviews.find((r) => r.id === id) || null
}

// Get place list
export const getPlaceList = async (): Promise<PlaceDTO[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockPlaces
}

// Get place by ID
export const getPlaceById = async (id: string): Promise<PlaceDTO | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockPlaces.find((p) => p.id === id) || null
}

// Create review (待后端实现)
export const createReview = async (data: CreateReviewDTO): Promise<ReviewDTO> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock creation
  const newReview: ReviewDTO = {
    id: Date.now().toString(),
    userId: 'current-user',
    userName: '当前用户',
    userAvatar: 'https://i.pravatar.cc/150?img=10',
    placeId: data.placeId,
    placeName: data.placeName,
    placeCategory: '未分类',
    rating: data.rating,
    title: data.title,
    content: data.content,
    images: data.images,
    tags: data.tags,
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
    isLiked: false,
    isFavorited: false,
    createTime: new Date().toLocaleString('zh-CN'),
  }

  return newReview
}

// Like review (待后端实现)
export const likeReview = async (id: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return true
}

// Favorite review (待后端实现)
export const favoriteReview = async (id: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return true
}
