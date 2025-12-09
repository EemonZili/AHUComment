import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Phone,
  Share2,
  Bookmark,
  Edit,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  ThumbsUp,
  Eye,
} from 'lucide-react'
import { getPlaceDetail, getPlaceStats } from '@/services/place'
import { getReviewList } from '@/services/review'
import { favoriteReview, unfavoriteReview } from '@/services/interaction'
import { useAuthStore } from '@/store/auth'
import type { PlaceDTO, ReviewDTO } from '@/types'
import { Loading } from '@/components'
import styles from './PlaceDetail.module.css'

export default function PlaceDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const reviewsRef = useRef<HTMLDivElement>(null)

  const [place, setPlace] = useState<PlaceDTO | null>(null)
  const [reviews, setReviews] = useState<ReviewDTO[]>([])
  const [stats, setStats] = useState<{
    totalReviews: number
    avgRating: number
    ratingDistribution: Record<number, number>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const pageSize = 5

  // Fetch place details
  useEffect(() => {
    const fetchPlaceData = async () => {
      if (!id) return

      setLoading(true)
      try {
        const [placeData, statsData] = await Promise.all([
          getPlaceDetail(id),
          getPlaceStats(id),
        ])
        setPlace(placeData)
        setStats(statsData)
      } catch (error) {
        console.error('Failed to fetch place:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaceData()
  }, [id])

  // Fetch reviews for this place
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return

      setReviewsLoading(true)
      try {
        const response = await getReviewList({
          placeId: id,
          pageNum: currentPage,
          pageSize,
        })
        setReviews(response.list)
        setReviewsTotal(response.total)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [id, currentPage])

  const handlePrevSlide = () => {
    if (!place) return
    setCurrentSlide((prev) => (prev === 0 ? place.images.length - 1 : prev - 1))
  }

  const handleNextSlide = () => {
    if (!place) return
    setCurrentSlide((prev) => (prev === place.images.length - 1 ? 0 : prev + 1))
  }

  const handleFavorite = async () => {
    if (!place) return
    try {
      if (isFavorited) {
        // await unfavoritePlace(place.id)
      } else {
        // await favoritePlace(place.id)
      }
      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleShare = () => {
    if (!place) return
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: place.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const renderStars = (rating: number) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={star <= rating ? styles.starFilled : styles.starEmpty}
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    )
  }

  const renderRatingBar = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0
    return (
      <div className={styles.ratingBar}>
        <span className={styles.ratingLabel}>{rating}星</span>
        <div className={styles.barContainer}>
          <div className={styles.barFill} style={{ width: `${percentage}%` }} />
        </div>
        <span className={styles.ratingCount}>{count}</span>
      </div>
    )
  }

  if (loading || !place) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" />
        <p className={styles.loadingText}>加载中...</p>
      </div>
    )
  }

  const totalReviewPages = Math.ceil(reviewsTotal / pageSize)

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <div className={styles.headerActions}>
          <button className={styles.iconButton} onClick={handleShare}>
            <Share2 size={20} />
          </button>
          <button
            className={`${styles.iconButton} ${isFavorited ? styles.favorited : ''}`}
            onClick={handleFavorite}
          >
            <Bookmark size={20} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Image Carousel */}
      <div className={styles.carousel}>
        <div className={styles.carouselContainer}>
          {place.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${place.name} ${index + 1}`}
              className={styles.carouselImage}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            />
          ))}
        </div>
        {place.images.length > 1 && (
          <>
            <button className={styles.carouselButton} onClick={handlePrevSlide}>
              <ChevronLeft size={24} />
            </button>
            <button
              className={`${styles.carouselButton} ${styles.carouselButtonNext}`}
              onClick={handleNextSlide}
            >
              <ChevronRight size={24} />
            </button>
            <div className={styles.carouselIndicators}>
              {place.images.map((_, index) => (
                <div
                  key={index}
                  className={`${styles.indicator} ${currentSlide === index ? styles.active : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Place Info */}
      <div className={styles.placeInfo}>
        <div className={styles.placeHeader}>
          <div>
            <h1 className={styles.placeName}>{place.name}</h1>
            <div className={styles.placeCategory}>{place.category}</div>
          </div>
          <button className={styles.writeReviewButton} onClick={() => navigate(`/review/create?placeId=${place.id}`)}>
            <Edit size={18} />
            <span>写点评</span>
          </button>
        </div>

        {/* Rating */}
        <div className={styles.ratingSection}>
          <div className={styles.overallRating}>
            <div className={styles.ratingNumber}>{place.rating.toFixed(1)}</div>
            {renderStars(Math.round(place.rating))}
            <span className={styles.reviewCount}>{place.reviewCount} 条点评</span>
          </div>
        </div>

        {/* Details */}
        <div className={styles.detailsSection}>
          {place.address && (
            <div className={styles.detailItem}>
              <MapPin size={18} className={styles.detailIcon} />
              <div>
                <div className={styles.detailLabel}>地址</div>
                <div className={styles.detailValue}>{place.address}</div>
              </div>
            </div>
          )}
          {place.openingHours && (
            <div className={styles.detailItem}>
              <Clock size={18} className={styles.detailIcon} />
              <div>
                <div className={styles.detailLabel}>营业时间</div>
                <div className={styles.detailValue}>{place.openingHours}</div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {place.description && (
          <div className={styles.descriptionSection}>
            <h3 className={styles.sectionTitle}>关于这里</h3>
            <p className={styles.description}>{place.description}</p>
          </div>
        )}

        {/* Facilities */}
        {place.facilities && place.facilities.length > 0 && (
          <div className={styles.facilitiesSection}>
            <h3 className={styles.sectionTitle}>设施服务</h3>
            <div className={styles.facilitiesList}>
              {place.facilities.map((facility, index) => (
                <span key={index} className={styles.facilityTag}>
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {place.tags && place.tags.length > 0 && (
          <div className={styles.tagsSection}>
            <h3 className={styles.sectionTitle}>特色标签</h3>
            <div className={styles.tagsList}>
              {place.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      {stats && (
        <div className={styles.ratingDistribution}>
          <h3 className={styles.sectionTitle}>评分分布</h3>
          <div className={styles.ratingsContainer}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0
              return renderRatingBar(rating, count, stats.totalReviews)
            })}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className={styles.reviewsSection} ref={reviewsRef}>
        <div className={styles.reviewsHeader}>
          <h2 className={styles.sectionTitle}>用户点评 ({reviewsTotal})</h2>
        </div>

        {reviewsLoading ? (
          <div className={styles.loadingContainer}>
            <Loading />
          </div>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <p className={styles.emptyText}>还没有点评，快来抢沙发！</p>
            <button
              className={styles.writeFirstReviewButton}
              onClick={() => navigate(`/review/create?placeId=${place.id}`)}
            >
              写第一条点评
            </button>
          </div>
        ) : (
          <>
            <div className={styles.reviewsList}>
              {reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard} onClick={() => navigate(`/review/${review.id}`)}>
                  {/* Review Header */}
                  <div className={styles.reviewHeader}>
                    <img src={review.userAvatar} alt={review.userName} className={styles.reviewUserAvatar} />
                    <div className={styles.reviewUserInfo}>
                      <h4 className={styles.reviewUserName}>{review.userName}</h4>
                      <p className={styles.reviewTime}>{review.createTime}</p>
                    </div>
                  </div>

                  {/* Review Rating */}
                  <div className={styles.reviewRating}>{renderStars(review.rating)}</div>

                  {/* Review Content */}
                  <p className={styles.reviewContent}>{review.content}</p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className={styles.reviewImages}>
                      {review.images.slice(0, 3).map((image, index) => (
                        <img key={index} src={image} alt="" className={styles.reviewImage} />
                      ))}
                      {review.images.length > 3 && (
                        <div className={styles.moreImages}>+{review.images.length - 3}</div>
                      )}
                    </div>
                  )}

                  {/* Review Stats */}
                  <div className={styles.reviewStats}>
                    <div className={styles.reviewStat}>
                      <ThumbsUp size={14} />
                      <span>{review.likeCount}</span>
                    </div>
                    <div className={styles.reviewStat}>
                      <MessageCircle size={14} />
                      <span>{review.commentCount}</span>
                    </div>
                    <div className={styles.reviewStat}>
                      <Eye size={14} />
                      <span>{review.viewCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalReviewPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  上一页
                </button>
                <div className={styles.pageNumbers}>
                  {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map((page) => (
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
                  disabled={currentPage === totalReviewPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <button className={styles.fab} onClick={() => navigate(`/review/create?placeId=${place.id}`)}>
        <Edit size={24} />
      </button>
    </div>
  )
}
