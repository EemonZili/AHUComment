import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  TrendingUp,
  Star,
  MessageCircle,
  MapPin,
  Filter,
  X,
  ChevronDown,
  Grid,
  List as ListIcon,
  ArrowLeft,
  Settings,
} from 'lucide-react'
import { getPlaceList, searchPlaces, getHotPlaces } from '@/services/place'
import { useAuthStore } from '@/store/auth'
import type { PlaceDTO, PlaceCategory } from '@/types'
import { Loading, Avatar } from '@/components'
import styles from './PlaceList.module.css'

const categories: PlaceCategory[] = ['食堂', '图书馆', '宿舍', '教学楼', '运动场所', '休闲场所', '其他']
const sortOptions = [
  { value: 'rating', label: '评分最高', icon: Star },
  { value: 'reviewCount', label: '最多点评', icon: MessageCircle },
  { value: 'latest', label: '最新添加', icon: TrendingUp },
] as const

export default function PlaceList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [places, setPlaces] = useState<PlaceDTO[]>([])
  const [hotPlaces, setHotPlaces] = useState<PlaceDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | '全部'>('全部')
  const [sortBy, setSortBy] = useState<'rating' | 'reviewCount' | 'latest'>('rating')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 12

  // Fetch places
  const fetchPlaces = async () => {
    setLoading(true)
    try {
      const response = await getPlaceList({
        category: activeCategory === '全部' ? undefined : activeCategory,
        keyword: searchKeyword || undefined,
        sortBy,
        pageNum: currentPage,
        pageSize,
      })
      setPlaces(response.list)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to fetch places:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch hot places
  const fetchHotPlaces = async () => {
    try {
      const data = await getHotPlaces(6)
      setHotPlaces(data)
    } catch (error) {
      console.error('Failed to fetch hot places:', error)
    }
  }

  useEffect(() => {
    fetchPlaces()
  }, [activeCategory, sortBy, currentPage])

  useEffect(() => {
    fetchHotPlaces()
  }, [])

  const handleSearch = async () => {
    if (searchKeyword.trim()) {
      try {
        const data = await searchPlaces(searchKeyword)
        setPlaces(data)
        setTotal(data.length)
      } catch (error) {
        console.error('Search failed:', error)
      }
    } else {
      fetchPlaces()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCategoryChange = (category: PlaceCategory | '全部') => {
    setActiveCategory(category)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: 'rating' | 'reviewCount' | 'latest') => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const handlePlaceClick = (id: string) => {
    navigate(`/place/${id}`)
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

  const getCategoryColor = (category: PlaceCategory) => {
    const colors: Record<PlaceCategory, string> = {
      '食堂': '#FF6B6B',
      '图书馆': '#4ECDC4',
      '宿舍': '#95E1D3',
      '教学楼': '#F38181',
      '运动场所': '#AA96DA',
      '休闲场所': '#FCBAD3',
      '其他': '#A8DADC',
    }
    return colors[category]
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.logoSection}>
            <h1 className={styles.title}>📍 校园地点</h1>
            <p className={styles.subtitle}>发现校园里的精彩场所</p>
          </div>
          <div className={styles.userSection}>
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
              placeholder="搜索地点名称、地址..."
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
            <button
              className={`${styles.categoryTab} ${activeCategory === '全部' ? styles.active : ''}`}
              onClick={() => handleCategoryChange('全部')}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryTab} ${activeCategory === category ? styles.active : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
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

      {/* Hot Places Banner */}
      {hotPlaces.length > 0 && (
        <div className={styles.hotPlacesSection}>
          <div className={styles.hotPlacesContainer}>
            <div className={styles.hotPlacesHeader}>
              <h2 className={styles.hotPlacesTitle}>
                <TrendingUp size={28} />
                热门地点
              </h2>
              <p className={styles.hotPlacesSubtitle}>校园里最受欢迎的场所</p>
            </div>
            <div className={styles.hotPlacesList}>
              {hotPlaces.map((place) => (
                <div
                  key={place.id}
                  className={styles.hotPlaceCard}
                  onClick={() => handlePlaceClick(place.id)}
                >
                  <div className={styles.hotPlaceImage}>
                    <img src={place.images[0]} alt={place.name} />
                    <div className={styles.hotPlaceBadge}>HOT</div>
                  </div>
                  <div className={styles.hotPlaceInfo}>
                    <h3 className={styles.hotPlaceName}>{place.name}</h3>
                    <div className={styles.hotPlaceRating}>
                      {renderStars(place.rating)}
                      <span className={styles.ratingText}>{place.rating.toFixed(1)}</span>
                    </div>
                    <p className={styles.hotPlaceReviews}>{place.reviewCount} 条点评</p>
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
          <h2 className={styles.contentTitle}>
            {activeCategory === '全部' ? '所有地点' : activeCategory}
          </h2>
          <p className={styles.contentSubtitle}>共 {total} 个地点</p>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <Loading size="lg" />
            <p className={styles.loadingText}>加载中...</p>
          </div>
        ) : places.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏫</div>
            <h3 className={styles.emptyTitle}>暂无地点</h3>
            <p className={styles.emptyText}>该分类下还没有地点</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? styles.placeGrid : styles.placeList}>
              {places.map((place) => (
                <div
                  key={place.id}
                  className={viewMode === 'grid' ? styles.placeCard : styles.placeListItem}
                  onClick={() => handlePlaceClick(place.id)}
                >
                  <div className={styles.placeImageContainer}>
                    <img
                      src={place.images[0] || 'https://placehold.co/400x300?text=No+Image'}
                      alt={place.name}
                      className={styles.placeImage}
                    />
                    <div
                      className={styles.placeCategory}
                      style={{ background: getCategoryColor(place.category) }}
                    >
                      {place.category}
                    </div>
                  </div>
                  <div className={styles.placeContent}>
                    <h3 className={styles.placeName}>{place.name}</h3>
                    {place.address && (
                      <div className={styles.placeAddress}>
                        <MapPin size={14} />
                        <span>{place.address}</span>
                      </div>
                    )}
                    {place.description && (
                      <p className={styles.placeDescription}>{place.description}</p>
                    )}
                    <div className={styles.placeRating}>
                      {renderStars(place.rating)}
                      <span className={styles.ratingText}>{place.rating.toFixed(1)}</span>
                    </div>
                    <div className={styles.placeStats}>
                      <div className={styles.placeStat}>
                        <MessageCircle size={16} />
                        <span>{place.reviewCount} 条点评</span>
                      </div>
                    </div>
                    {place.tags && place.tags.length > 0 && (
                      <div className={styles.placeTags}>
                        {place.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className={styles.placeTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
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
  )
}
