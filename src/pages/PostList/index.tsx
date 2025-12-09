import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  TrendingUp,
  Star,
  MessageCircle,
  ThumbsUp,
  Eye,
  Filter,
  X,
  Grid,
  List as ListIcon,
  Settings,
  Plus,
} from 'lucide-react'
import {
  listPostCategories,
  pageQueryPostByCategoryId,
  likePost,
} from '@/services'
import { useAuthStore } from '@/store/auth'
import type { PostDTO, PostCategoryDTO } from '@/types'
import { Loading, Avatar } from '@/components'
import styles from './PostList.module.css'

const sortOptions = [
  { value: 'latest', label: '最新发布', icon: TrendingUp },
  { value: 'popular', label: '最多点赞', icon: ThumbsUp },
  { value: 'rating', label: '最多评分', icon: Star },
] as const

export default function PostList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [posts, setPosts] = useState<PostDTO[]>([])
  const [categories, setCategories] = useState<PostCategoryDTO[]>([])
  const [hotPosts, setHotPosts] = useState<PostDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 12

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await listPostCategories()
      setCategories(data)
      if (data.length > 0 && activeCategory === 0) {
        setActiveCategory(data[0].id || 0)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  // Fetch posts
  const fetchPosts = async () => {
    if (activeCategory === 0) return

    setLoading(true)
    try {
      const data = await pageQueryPostByCategoryId({
        categoryId: activeCategory,
      })

      // 处理分页响应
      let postsArray: PostDTO[] = []
      if (data && typeof data === 'object' && 'result' in data) {
        postsArray = Array.isArray((data as any).result) ? (data as any).result : []
        setTotal((data as any).total || postsArray.length)
      } else if (Array.isArray(data)) {
        postsArray = data
        setTotal(data.length)
      }

      // 根据排序方式排序
      let sortedPosts = [...postsArray]
      if (sortBy === 'popular') {
        sortedPosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      } else if (sortBy === 'rating') {
        sortedPosts.sort((a, b) => {
          const aMarkCount = parseInt(a.markCount || '0')
          const bMarkCount = parseInt(b.markCount || '0')
          return bMarkCount - aMarkCount
        })
      }
      // latest 是默认顺序，不需要额外排序

      setPosts(sortedPosts)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setPosts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // Fetch hot posts
  const fetchHotPosts = async () => {
    if (categories.length === 0) return
    try {
      const allPosts: PostDTO[] = []
      for (const category of categories.slice(0, 3)) {
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
      const sorted = allPosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      setHotPosts(sorted.slice(0, 6))
    } catch (error) {
      console.error('Failed to fetch hot posts:', error)
      setHotPosts([])
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (categories.length > 0) {
      fetchHotPosts()
    }
  }, [categories])

  useEffect(() => {
    if (activeCategory) {
      fetchPosts()
    }
  }, [activeCategory, sortBy, currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchPosts()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCategoryChange = (categoryId: number) => {
    setActiveCategory(categoryId)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: 'latest' | 'popular' | 'rating') => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const handlePostClick = (id: number) => {
    navigate(`/post/${id}`)
  }

  const handleLike = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      alert('请先登录')
      return
    }

    try {
      await likePost(postId)
      fetchPosts()
      fetchHotPosts()
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const renderStars = (markCount: string | number) => {
    const count = typeof markCount === 'string' ? parseInt(markCount) : markCount
    const rating = Math.min(5, Math.ceil(count / 2)) // 简单映射
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

  const getCategoryColor = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.color || '#A8DADC'
  }

  const getActiveCategoryName = () => {
    const category = categories.find((c) => c.id === activeCategory)
    return category?.categoryName || '全部贴文'
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.logoSection}>
            <h1 className={styles.title}>💬 校园贴文</h1>
            <p className={styles.subtitle}>分享你的校园生活</p>
          </div>
          <div className={styles.userSection}>
            <button className={styles.createBtn} onClick={() => navigate('/post/create')}>
              <Plus size={18} />
              <span>发布贴文</span>
            </button>
            {user?.isAdmin && (
              <button className={styles.adminBtn} onClick={() => navigate('/admin/users')}>
                <Settings size={18} />
                <span>管理后台</span>
              </button>
            )}
            {user && (
              <div className={styles.userInfo} onClick={() => navigate('/profile')}>
                <Avatar
                  src={user.avatar}
                  fallbackSeed={user.openid}
                  alt={user.nickname}
                  className={styles.userAvatar}
                />
                <span className={styles.userName}>{user.nickname}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="搜索贴文内容..."
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
        <div className={styles.categorySection}>
          <div className={styles.categoryTabs}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryTab} ${
                  activeCategory === category.id ? styles.active : ''
                }`}
                onClick={() => handleCategoryChange(category.id || 0)}
              >
                {category.categoryName}
              </button>
            ))}
          </div>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={18} />
            </button>
          </div>
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
                      className={`${styles.sortOption} ${
                        sortBy === option.value ? styles.active : ''
                      }`}
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

      {/* Hot Posts Banner */}
      {hotPosts.length > 0 && (
        <div className={styles.hotPlacesSection}>
          <div className={styles.hotPlacesContainer}>
            <div className={styles.hotPlacesHeader}>
              <h2 className={styles.hotPlacesTitle}>
                <TrendingUp size={28} />
                热门贴文
              </h2>
              <p className={styles.hotPlacesSubtitle}>校园里最受欢迎的话题</p>
            </div>
            <div className={styles.hotPlacesList}>
              {hotPosts.map((post) => (
                <div
                  key={post.id}
                  className={styles.hotPlaceCard}
                  onClick={() => handlePostClick(post.id!)}
                >
                  <div className={styles.hotPlaceImage}>
                    {post.image ? (
                      <img src={post.image} alt={post.context} />
                    ) : (
                      <div className={styles.noImagePlaceholder}>
                        <MessageCircle size={48} />
                      </div>
                    )}
                    <div className={styles.hotPlaceBadge}>HOT</div>
                  </div>
                  <div className={styles.hotPlaceInfo}>
                    <h3 className={styles.hotPlaceName}>{post.context}</h3>
                    <div className={styles.hotPlaceRating}>
                      {renderStars(post.markCount || 0)}
                      <span className={styles.ratingText}>{post.markCount || 0} 评分</span>
                    </div>
                    <p className={styles.hotPlaceReviews}>{post.likeCount || 0} 个赞</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.contentTitle}>{getActiveCategoryName()}</h2>
          <p className={styles.contentSubtitle}>共 {total} 条贴文</p>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <Loading size="lg" />
            <p className={styles.loadingText}>加载中...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💭</div>
            <h3 className={styles.emptyTitle}>暂无贴文</h3>
            <p className={styles.emptyText}>该分区还没有贴文，快来发布第一条吧！</p>
            <button className={styles.createButton} onClick={() => navigate('/post/create')}>
              <Plus size={18} />
              发布贴文
            </button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? styles.placeGrid : styles.placeList}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={viewMode === 'grid' ? styles.placeCard : styles.placeListItem}
                  onClick={() => handlePostClick(post.id!)}
                >
                  <div className={styles.placeImageContainer}>
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.context}
                        className={styles.placeImage}
                      />
                    ) : (
                      <div className={styles.noImagePlaceholder}>
                        <MessageCircle size={48} />
                        <p>{post.context.substring(0, 50)}...</p>
                      </div>
                    )}
                    <div
                      className={styles.placeCategory}
                      style={{ background: getCategoryColor(post.categoryId || 0) }}
                    >
                      {categories.find((c) => c.id === post.categoryId)?.categoryName}
                    </div>
                  </div>
                  <div className={styles.placeContent}>
                    <h3 className={styles.placeName}>{post.context}</h3>
                    <div className={styles.placeAddress}>
                      <Avatar src={post.ownerOpenid} alt="用户" size={20} />
                      <span>{post.ownerOpenid}</span>
                    </div>
                    <div className={styles.placeRating}>
                      {renderStars(post.markCount || 0)}
                      <span className={styles.ratingText}>
                        {post.markCount || 0} 评分
                      </span>
                    </div>
                    <div className={styles.placeStats}>
                      <div className={styles.placeStat}>
                        <Eye size={16} />
                        <span>{post.uv || 0}</span>
                      </div>
                      <div className={styles.placeStat}>
                        <ThumbsUp size={16} />
                        <span>{post.likeCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                      className={`${styles.pageNumber} ${
                        currentPage === page ? styles.active : ''
                      }`}
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
  )
}
