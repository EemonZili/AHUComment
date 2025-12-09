import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  TrendingUp,
  Clock,
  Star,
  ThumbsUp,
  MessageCircle,
  Eye,
  Bookmark,
  MapPin,
  Filter,
  X,
  Settings,
} from 'lucide-react'
import { listPostCategories, pageQueryPostByCategoryId } from '@/services'
import { useAuthStore } from '@/store/auth'
import type { ReviewDTO, PlaceDTO, PostDTO, PostCategoryDTO } from '@/types'
import { Loading, Button, Avatar, PostImage } from '@/components'
import styles from './ReviewList.module.css'

const sortOptions = [
  { value: 'latest', label: '最新', icon: Clock },
  { value: 'rating', label: '评分', icon: Star },
  { value: 'popular', label: '热门', icon: TrendingUp },
] as const

export default function ReviewList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [reviews, setReviews] = useState<ReviewDTO[]>([])
  const [hotReviews, setHotReviews] = useState<ReviewDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [activeCategoryId, setActiveCategoryId] = useState<number>(0)
  const [postCategories, setPostCategories] = useState<PostCategoryDTO[]>([])
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'popular'>('latest')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // Fetch reviews - 使用 post APIs
  const fetchReviews = async () => {
    if (postCategories.length === 0) return

    setLoading(true)
    try {
      let allPosts: PostDTO[] = []

      if (activeCategory === '全部') {
        // 获取所有分类的帖子
        for (const category of postCategories) {
          const data = await pageQueryPostByCategoryId({
            categoryId: category.id || 0,
          })

          if (data && typeof data === 'object' && 'result' in data) {
            const postsArray = Array.isArray((data as any).result) ? (data as any).result : []
            allPosts.push(...postsArray)
          } else if (Array.isArray(data)) {
            allPosts.push(...data)
          }
        }
      } else {
        // 获取特定分类的帖子
        const data = await pageQueryPostByCategoryId({
          categoryId: activeCategoryId,
        })

        if (data && typeof data === 'object' && 'result' in data) {
          allPosts = Array.isArray((data as any).result) ? (data as any).result : []
        } else if (Array.isArray(data)) {
          allPosts = data
        }
      }

      // 根据排序方式排序
      let sortedPosts = [...allPosts]
      if (sortBy === 'popular') {
        sortedPosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      } else if (sortBy === 'rating') {
        sortedPosts.sort((a, b) => {
          const aMarkCount = parseInt(a.markCount || '0')
          const bMarkCount = parseInt(b.markCount || '0')
          return bMarkCount - aMarkCount
        })
      }

      // 转换 PostDTO 为 ReviewDTO 格式
      const reviewsData: ReviewDTO[] = sortedPosts.map((post) => ({
        id: String(post.id || ''),
        userId: post.ownerOpenid || '',
        userName: post.ownerOpenid || '匿名用户',
        userAvatar: post.image || '',
        rating: Math.min(5, Math.ceil(parseInt(post.markCount || '0') / 2)),
        title: post.context?.substring(0, 50) || '无标题',
        content: post.context || '',
        images: post.image ? [post.image] : [],
        tags: [],
        likeCount: post.likeCount || 0,
        commentCount: 0,
        viewCount: post.uv || 0,
        isFavorited: false,
        placeName: postCategories.find(c => c.id === post.categoryId)?.categoryName || '未知分类',
        createTime: post.createTime || '刚刚',
      }))

      setReviews(reviewsData)
      setTotal(reviewsData.length)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setReviews([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await listPostCategories()
      setPostCategories(data)

      // 更新 categories 数组以匹配 API 数据
      const categoryNames = ['全部', ...data.map(c => c.categoryName || '')]
      // 不修改 const categories，只是在内部使用
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  // Fetch hot reviews - 使用热门帖子
  const fetchHotReviews = async () => {
    if (postCategories.length === 0) return

    try {
      const allPosts: PostDTO[] = []
      for (const category of postCategories.slice(0, 3)) {
        const data = await pageQueryPostByCategoryId({
          categoryId: category.id || 0,
        })

        if (data && typeof data === 'object' && 'result' in data) {
          const postsArray = Array.isArray((data as any).result) ? (data as any).result : []
          allPosts.push(...postsArray)
        } else if (Array.isArray(data)) {
          allPosts.push(...data)
        }
      }

      // 按点赞数排序
      const sorted = allPosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))

      // 转换为 ReviewDTO 格式
      const hotReviewsData: ReviewDTO[] = sorted.slice(0, 5).map((post) => ({
        id: String(post.id || ''),
        userId: post.ownerOpenid || '',
        userName: post.ownerOpenid || '匿名用户',
        userAvatar: post.image || '',
        rating: Math.min(5, Math.ceil(parseInt(post.markCount || '0') / 2)),
        title: post.context?.substring(0, 30) || '热门点评',
        content: post.context || '',
        images: post.image ? [post.image] : [],
        tags: [],
        likeCount: post.likeCount || 0,
        commentCount: 0,
        viewCount: post.uv || 0,
        isFavorited: false,
        placeName: postCategories.find(c => c.id === post.categoryId)?.categoryName || '未知',
        createTime: post.createTime || '刚刚',
      }))

      setHotReviews(hotReviewsData)
    } catch (error) {
      console.error('Failed to fetch hot reviews:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (postCategories.length > 0) {
      fetchReviews()
      fetchHotReviews()
    }
  }, [postCategories, activeCategory, sortBy, currentPage])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setCurrentPage(1)

    // 找到对应的分类ID
    if (category === '全部') {
      setActiveCategoryId(0)
    } else {
      const foundCategory = postCategories.find(c => c.categoryName === category)
      setActiveCategoryId(foundCategory?.id || 0)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchReviews()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSortChange = (sort: 'latest' | 'rating' | 'popular') => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const handleReviewClick = (id: string) => {
    navigate(`/review/${id}`)
  }

  const handlePlaceClick = (id: string) => {
    navigate(`/review/${id}`)
  }

  const renderStars = (rating: number) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? styles.starFilled : styles.starEmpty}
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.logoSection}>
            <h1 className={styles.title}>校园点评</h1>
            <p className={styles.subtitle}>发现你的校园生活</p>
          </div>
          <div className={styles.userSection}>
            <button className={styles.adminBtn} onClick={() => navigate('/review/create')}>
              <MessageCircle size={18} />
              <span>发布点评</span>
            </button>
            {user?.isAdmin && (
              <button className={styles.adminBtn} onClick={() => navigate('/admin/users')}>
                <Settings size={18} />
                <span>管理后台</span>
              </button>
            )}
            <div className={styles.userInfo} onClick={() => navigate('/profile')}>
              <Avatar
                src={user?.avatar}
                fallbackSeed={user?.openid || 'default'}
                alt={user?.nickname}
                className={styles.userAvatar}
              />
              <span className={styles.userName}>{user?.nickname}</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="搜索点评、场所..."
              className={styles.searchInput}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {searchKeyword && (
              <X className={styles.clearIcon} size={20} onClick={() => setSearchKeyword('')} />
            )}
            <button className={styles.searchButton} onClick={handleSearch}>
              搜索
            </button>
          </div>
          <button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={20} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          <button
            className={`${styles.categoryTab} ${activeCategory === '全部' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('全部')}
          >
            全部
          </button>
          {postCategories.map((category) => (
            <button
              key={category.id}
              className={`${styles.categoryTab} ${activeCategory === category.categoryName ? styles.active : ''}`}
              onClick={() => handleCategoryChange(category.categoryName || '')}
            >
              {category.categoryName}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>排序方式</label>
              <div className={styles.sortOptions}>
                {sortOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <button
                      key={option.value}
                      className={`${styles.sortOption} ${sortBy === option.value ? styles.active : ''}`}
                      onClick={() => handleSortChange(option.value)}
                    >
                      <IconComponent size={16} />
                      <span>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Popular Reviews Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>热门点评</h3>
            <div className={styles.placeList}>
              {hotReviews.slice(0, 5).map((review) => (
                <div key={review.id} className={styles.placeItem} onClick={() => handlePlaceClick(review.id)}>
                  <PostImage src={review.images[0]} alt={review.title} className={styles.placeImage} />
                  <div className={styles.placeInfo}>
                    <h4 className={styles.placeName}>{review.title}</h4>
                    <div className={styles.placeStats}>
                      {renderStars(review.rating)}
                      <span className={styles.placeReviewCount}>{review.likeCount} 点赞</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>快捷入口</h3>
            <div className={styles.quickLinks}>
              <button className={styles.quickLink} onClick={() => navigate('/review/create')}>
                ✍️ 发布点评
              </button>
              <button className={styles.quickLink} onClick={() => navigate('/profile')}>
                📝 我的点评
              </button>
              <button className={styles.quickLink} onClick={() => navigate('/profile')}>
                ⭐ 我的收藏
              </button>
            </div>
          </div>
        </div>

        {/* Review List */}
        <div className={styles.reviewList}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Loading size="lg" />
              <p className={styles.loadingText}>加载中...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <h3 className={styles.emptyTitle}>暂无点评</h3>
              <p className={styles.emptyText}>还没有人发布点评，快来成为第一个吧！</p>
              <Button variant="primary" onClick={() => navigate('/review/create')}>
                发布点评
              </Button>
            </div>
          ) : (
            <>
              {reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard} onClick={() => handleReviewClick(review.id)}>
                  {/* Review Header */}
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUser}>
                      <Avatar
                        src={review.userAvatar}
                        fallbackSeed={review.userId || review.userName}
                        alt={review.userName}
                        className={styles.reviewUserAvatar}
                      />
                      <div className={styles.reviewUserInfo}>
                        <h4 className={styles.reviewUserName}>{review.userName}</h4>
                        <p className={styles.reviewTime}>{review.createTime}</p>
                      </div>
                    </div>
                    <div className={styles.reviewPlace}>
                      <MapPin size={14} />
                      <span>{review.placeName}</span>
                    </div>
                  </div>

                  {/* Review Rating */}
                  <div className={styles.reviewRating}>{renderStars(review.rating)}</div>

                  {/* Review Content */}
                  <h3 className={styles.reviewTitle}>{review.title}</h3>
                  <p className={styles.reviewContent}>{review.content}</p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className={styles.reviewImages}>
                      {review.images.slice(0, 3).map((image, index) => (
                        <PostImage key={index} src={image} alt={`${review.title} ${index + 1}`} className={styles.reviewImage} />
                      ))}
                      {review.images.length > 3 && (
                        <div className={styles.moreImages}>+{review.images.length - 3}</div>
                      )}
                    </div>
                  )}

                  {/* Review Tags */}
                  {review.tags && review.tags.length > 0 && (
                    <div className={styles.reviewTags}>
                      {review.tags.map((tag, index) => (
                        <span key={index} className={styles.reviewTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Review Stats */}
                  <div className={styles.reviewStats}>
                    <div className={styles.reviewStat}>
                      <Eye size={16} />
                      <span>{review.viewCount}</span>
                    </div>
                    <div className={styles.reviewStat}>
                      <ThumbsUp size={16} />
                      <span>{review.likeCount}</span>
                    </div>
                    <div className={styles.reviewStat}>
                      <MessageCircle size={16} />
                      <span>{review.commentCount}</span>
                    </div>
                    <div className={styles.reviewStat}>
                      <Bookmark size={16} className={review.isFavorited ? styles.favorited : ''} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageButton}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    上一页
                  </button>
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    className={styles.pageButton}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
