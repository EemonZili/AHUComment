import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  ThumbsUp,
  MessageCircle,
  Bookmark,
} from 'lucide-react'
import { getReviewDetail } from '@/services/review'
import {
  likeReview,
  unlikeReview,
  favoriteReview,
  unfavoriteReview,
  markReviewUseful,
  unmarkReviewUseful,
} from '@/services/interaction'
import { createComment, likeComment, unlikeComment } from '@/services/comment'
import type { ReviewDTO } from '@/types'
import { Loading, Avatar } from '@/components'
import styles from './ReviewDetail.module.css'

// Mock data - 实际使用时应从API获取
const mockReview = {
  id: '1',
  place: {
    name: '一食堂',
    category: '食堂',
    address: '合肥市蜀山区安徽大学磬苑校区',
    rating: 4.8,
    reviewCount: 128,
  },
  images: [
    'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  ],
  detailedRatings: {
    environment: 4.7,
    service: 4.5,
    price: 4.9,
    taste: 4.8,
  },
  reviewer: {
    name: '张小明',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  },
  time: '2小时前',
  content: `菜品丰富，价格实惠。二楼的麻辣烫真的很不错，10块钱就能吃得很饱。一楼的快餐窗口也很方便，适合赶时间的同学。

环境也比较干净整洁，饭点人多但座位够用。服务态度也不错，阿姨都很热情。

唯一的缺点就是有些窗口的队伍有点长，建议避开12点和6点的高峰期。总体来说性价比很高，强烈推荐！`,
  tags: ['#环境好', '#价格实惠', '#菜品丰富'],
  usefulCount: 256,
  comments: [
    {
      id: '1',
      author: '李华',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      time: '1天前',
      text: '确实不错！我也经常去二楼吃麻辣烫，老板娘人很好！',
      reply: {
        author: '张小明',
        text: '是吧！那家的麻辣烫真的很赞，价格也实惠',
      },
    },
    {
      id: '2',
      author: '王芳',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      time: '3天前',
      text: '一楼的盖饭也很好吃，推荐红烧肉盖饭，分量足味道好！',
    },
    {
      id: '3',
      author: '陈明',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      time: '5天前',
      text: '同意！食堂整体性价比确实很高，就是人太多了😂',
    },
  ],
  relatedReviews: [
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      rating: 4.5,
      text: '早餐品种多，豆浆油条、包子馒头应有尽有，价格也很便宜...',
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      rating: 4.9,
      text: '三楼的特色窗口很不错，煲仔饭和炒饭都很好吃，强烈推荐...',
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      rating: 4.7,
      text: '水果沙拉窗口很受欢迎，新鲜健康，女生们的最爱...',
    },
  ],
}

export default function ReviewDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const commentsRef = useRef<HTMLDivElement>(null)

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isUseful, setIsUseful] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showActionBar, setShowActionBar] = useState(true)
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setShowActionBar(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mockReview.images.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mockReview.images.length) % mockReview.images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const toggleUseful = () => {
    setIsUseful(!isUseful)
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
  }

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const handleShare = () => {
    alert('分享功能（演示）\n可以分享到微信、QQ、微博等平台')
  }

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      alert('评论已发表（演示）')
      setCommentText('')
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    return (
      <div className={size === 'lg' ? styles.starsLarge : styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size === 'lg' ? 24 : 14}
            className={star <= rating ? styles.starFilled : styles.starEmpty}
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.reviewDetail}>
      {/* Top Nav */}
      <div className={styles.detailNav}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>返回</span>
        </button>
        <div className={styles.navActions}>
          <button className={styles.navIconBtn} onClick={handleShare}>
            <Share2 size={20} />
          </button>
          <button
            className={`${styles.navIconBtn} ${isFavorited ? styles.active : ''}`}
            onClick={toggleFavorite}
          >
            <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.detailContent}>
        {/* Image Gallery */}
        <div className={styles.imageGallery}>
          <div className={styles.carousel}>
            <div
              className={styles.carouselInner}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {mockReview.images.map((image, index) => (
                <div key={index} className={styles.carouselItem}>
                  <img src={image} alt={`${mockReview.place.name} ${index + 1}`} className={styles.carouselImage} />
                </div>
              ))}
            </div>
            <div className={styles.carouselControls}>
              <button className={styles.carouselBtn} onClick={prevSlide}>
                <ChevronLeft size={20} />
              </button>
              <button className={styles.carouselBtn} onClick={nextSlide}>
                <ChevronRight size={20} />
              </button>
            </div>
            <div className={styles.carouselIndicators}>
              {mockReview.images.map((_, index) => (
                <span
                  key={index}
                  className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Place Info */}
        <div className={styles.placeInfo}>
          <div className={styles.placeHeader}>
            <div>
              <h1 className={styles.placeTitle}>{mockReview.place.name}</h1>
              <span className={styles.placeCategory}>{mockReview.place.category}</span>
            </div>
          </div>

          <div className={styles.ratingDisplay}>
            <div className={styles.ratingNumber}>{mockReview.place.rating}</div>
            <div className={styles.ratingDetails}>
              {renderStars(mockReview.place.rating, 'lg')}
              <div className={styles.reviewCountText}>基于 {mockReview.place.reviewCount} 条点评</div>
            </div>
          </div>

          <div className={styles.placeAddress}>
            <MapPin size={16} />
            <span>{mockReview.place.address}</span>
          </div>
        </div>

        {/* Detailed Ratings */}
        <div className={styles.detailedRatings}>
          <h3 className={styles.sectionTitle}>详细评分</h3>
          {Object.entries(mockReview.detailedRatings).map(([key, value]) => {
            const labels: Record<string, string> = {
              environment: '环境',
              service: '服务',
              price: '价格',
              taste: '味道',
            }
            return (
              <div key={key} className={styles.ratingItem}>
                <div className={styles.ratingLabel}>{labels[key]}</div>
                <div className={styles.ratingBarWrapper}>
                  <div className={styles.ratingBar} style={{ width: `${(value / 5) * 100}%` }} />
                </div>
                <div className={styles.ratingValue}>{value}</div>
              </div>
            )
          })}
        </div>

        {/* Review Content */}
        <div className={styles.reviewContent}>
          <div className={styles.reviewerHeader}>
            <Avatar
              src={mockReview.reviewer.avatar}
              fallbackSeed={mockReview.reviewer.name}
              alt={mockReview.reviewer.name}
              className={styles.reviewerAvatar}
            />
            <div className={styles.reviewerInfo}>
              <div className={styles.reviewerName}>{mockReview.reviewer.name}</div>
              <div className={styles.reviewTime}>{mockReview.time}</div>
            </div>
          </div>

          <div className={styles.reviewText}>{mockReview.content}</div>

          <div className={styles.reviewTags}>
            {mockReview.tags.map((tag, index) => (
              <span key={index} className={styles.reviewTag}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.usefulSection}>
            <button className={`${styles.usefulBtn} ${isUseful ? styles.active : ''}`} onClick={toggleUseful}>
              <ThumbsUp size={14} />
              <span>{isUseful ? mockReview.usefulCount + 1 : mockReview.usefulCount}</span>
            </button>
            <span>人觉得有用</span>
          </div>
        </div>

        {/* Comments */}
        <div className={styles.commentsSection} ref={commentsRef}>
          <h3 className={styles.sectionTitle}>全部评论 ({mockReview.comments.length})</h3>

          {mockReview.comments.map((comment, index) => (
            <div key={comment.id} className={styles.commentItem} style={{ animationDelay: `${index * 80}ms` }}>
              <div className={styles.commentHeader}>
                <Avatar
                  src={comment.avatar}
                  fallbackSeed={comment.author}
                  alt={comment.author}
                  className={styles.commentAvatar}
                />
                <span className={styles.commentAuthor}>{comment.author}</span>
                <span className={styles.commentTime}>· {comment.time}</span>
              </div>
              <div className={styles.commentText}>{comment.text}</div>
              {comment.reply && (
                <div className={styles.commentReply}>
                  <strong>{comment.reply.author}:</strong> {comment.reply.text}
                </div>
              )}
            </div>
          ))}

          <div className={styles.commentInputWrapper}>
            <textarea
              className={styles.commentInput}
              placeholder="写下你的评论..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className={styles.commentActions}>
              <button className={styles.commentBtnCancel} onClick={() => setCommentText('')}>
                取消
              </button>
              <button className={styles.commentBtnSubmit} onClick={handleSubmitComment}>
                发表评论
              </button>
            </div>
          </div>
        </div>

        {/* Related Reviews */}
        <div className={styles.relatedReviews}>
          <h3 className={styles.sectionTitle}>更多点评</h3>
          <div className={styles.reviewsScroll}>
            {mockReview.relatedReviews.map((review) => (
              <div
                key={review.id}
                className={styles.miniReviewCard}
                onClick={() => navigate(`/review/${review.id}`)}
              >
                <img src={review.image} alt="点评" className={styles.miniCardImage} />
                <div className={styles.miniCardContent}>
                  <div className={styles.miniCardRating}>
                    <Star size={14} fill="currentColor" />
                    <span>{review.rating}</span>
                  </div>
                  <p className={styles.miniCardText}>{review.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className={`${styles.actionBar} ${showActionBar ? styles.show : ''}`}>
        <div className={styles.actionBarContent}>
          <button className={`${styles.actionBtn} ${isLiked ? styles.active : ''}`} onClick={toggleLike}>
            <ThumbsUp size={20} />
            <span>点赞</span>
          </button>
          <button className={styles.actionBtn} onClick={scrollToComments}>
            <MessageCircle size={20} />
            <span>评论</span>
          </button>
          <button className={`${styles.actionBtn} ${isFavorited ? styles.active : ''}`} onClick={toggleFavorite}>
            <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
            <span>收藏</span>
          </button>
          <button className={styles.actionBtn} onClick={handleShare}>
            <Share2 size={20} />
            <span>分享</span>
          </button>
        </div>
      </div>
    </div>
  )
}
