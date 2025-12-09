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
import {
  queryPostById,
  queryMarkByPostId,
  pageQueryCommentByPid,
  likePost,
  addComment,
} from '@/services'
import type { PostDTO, MarkDTO, NewCommentDTO } from '@/types'
import { Loading, Avatar, PostImage } from '@/components'
import styles from './ReviewDetail.module.css'

export default function ReviewDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const commentsRef = useRef<HTMLDivElement>(null)

  // 数据状态
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<PostDTO | null>(null)
  const [marks, setMarks] = useState<MarkDTO[]>([])
  const [comments, setComments] = useState<NewCommentDTO[]>([])
  const [images, setImages] = useState<string[]>([])

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isUseful, setIsUseful] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showActionBar, setShowActionBar] = useState(true)
  const [commentText, setCommentText] = useState('')

  // 获取帖子详情
  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!id) return

      setLoading(true)
      try {
        const postData = await queryPostById({ id: Number(id) } as any)
        setPost(postData)

        // 设置图片
        if (postData.image) {
          setImages([postData.image])
        }

        // 获取评分
        const marksData = await queryMarkByPostId({ postId: Number(id) } as any)
        let marksArray: MarkDTO[] = []
        if (marksData && typeof marksData === 'object' && 'result' in marksData) {
          marksArray = Array.isArray((marksData as any).result) ? (marksData as any).result : []
        } else if (Array.isArray(marksData)) {
          marksArray = marksData
        }
        setMarks(marksArray)

        // 获取评论
        const commentsData = await pageQueryCommentByPid(Number(id), {} as any)
        let commentsArray: NewCommentDTO[] = []
        if (commentsData && typeof commentsData === 'object' && 'result' in commentsData) {
          commentsArray = Array.isArray((commentsData as any).result)
            ? (commentsData as any).result
            : []
        } else if (Array.isArray(commentsData)) {
          commentsArray = commentsData
        }
        setComments(commentsArray)
      } catch (error) {
        console.error('Failed to fetch post detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPostDetail()
  }, [id])

  useEffect(() => {
    const handleScroll = () => {
      setShowActionBar(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const toggleUseful = () => {
    setIsUseful(!isUseful)
  }

  const toggleLike = async () => {
    if (!id) return
    try {
      await likePost(Number(id))
      setIsLiked(!isLiked)
      // 重新获取帖子数据以更新点赞数
      const postData = await queryPostById({ id: Number(id) } as any)
      setPost(postData)
    } catch (error) {
      console.error('Failed to like post:', error)
    }
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

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !id || !post?.ownerOpenid) return

    try {
      await addComment(post.ownerOpenid, Number(id), {
        context: commentText,
      } as any)

      // 重新获取评论列表
      const commentsData = await pageQueryCommentByPid(Number(id), {} as any)
      let commentsArray: NewCommentDTO[] = []
      if (commentsData && typeof commentsData === 'object' && 'result' in commentsData) {
        commentsArray = Array.isArray((commentsData as any).result)
          ? (commentsData as any).result
          : []
      } else if (Array.isArray(commentsData)) {
        commentsArray = commentsData
      }
      setComments(commentsArray)
      setCommentText('')
      alert('评论已发表')
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('评论发表失败')
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

  // 显示加载状态
  if (loading) {
    return (
      <div className={styles.reviewDetail}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <Loading size="lg" />
        </div>
      </div>
    )
  }

  // 如果没有数据
  if (!post) {
    return (
      <div className={styles.reviewDetail}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <p>帖子不存在</p>
          <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1rem' }}>
            返回
          </button>
        </div>
      </div>
    )
  }

  // 计算平均评分
  const averageRating = marks.length > 0
    ? Math.min(5, Math.ceil(marks.reduce((sum, mark) => sum + (mark.score || 0), 0) / marks.length))
    : 0

  // 计算详细评分（根据 marks 的 score 分布）
  const detailedRatings = {
    environment: averageRating,
    service: averageRating,
    price: averageRating,
    taste: averageRating,
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
        {images.length > 0 && (
          <div className={styles.imageGallery}>
            <div className={styles.carousel}>
              <div
                className={styles.carouselInner}
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {images.map((image, index) => (
                  <div key={index} className={styles.carouselItem}>
                    <PostImage src={image} alt={`${post.context} ${index + 1}`} className={styles.carouselImage} />
                  </div>
                ))}
              </div>
              {images.length > 1 && (
                <>
                  <div className={styles.carouselControls}>
                    <button className={styles.carouselBtn} onClick={prevSlide}>
                      <ChevronLeft size={20} />
                    </button>
                    <button className={styles.carouselBtn} onClick={nextSlide}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className={styles.carouselIndicators}>
                    {images.map((_, index) => (
                      <span
                        key={index}
                        className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                        onClick={() => goToSlide(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Place Info */}
        <div className={styles.placeInfo}>
          <div className={styles.placeHeader}>
            <div>
              <h1 className={styles.placeTitle}>{post.context?.substring(0, 30) || '帖子标题'}</h1>
              <span className={styles.placeCategory}>贴文</span>
            </div>
          </div>

          <div className={styles.ratingDisplay}>
            <div className={styles.ratingNumber}>{averageRating}</div>
            <div className={styles.ratingDetails}>
              {renderStars(averageRating, 'lg')}
              <div className={styles.reviewCountText}>基于 {marks.length} 条评分</div>
            </div>
          </div>

          <div className={styles.placeAddress}>
            <MapPin size={16} />
            <span>发布者: {post.ownerOpenid || '匿名用户'}</span>
          </div>
        </div>

        {/* Detailed Ratings */}
        <div className={styles.detailedRatings}>
          <h3 className={styles.sectionTitle}>详细评分</h3>
          {Object.entries(detailedRatings).map(([key, value]) => {
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
              src={post.ownerOpenid}
              fallbackSeed={post.ownerOpenid || 'user'}
              alt={post.ownerOpenid || '用户'}
              className={styles.reviewerAvatar}
            />
            <div className={styles.reviewerInfo}>
              <div className={styles.reviewerName}>{post.ownerOpenid || '匿名用户'}</div>
              <div className={styles.reviewTime}>{post.createTime || '刚刚'}</div>
            </div>
          </div>

          <div className={styles.reviewText}>{post.context}</div>

          <div className={styles.usefulSection}>
            <button className={`${styles.usefulBtn} ${isUseful ? styles.active : ''}`} onClick={toggleUseful}>
              <ThumbsUp size={14} />
              <span>{isUseful ? (post.likeCount || 0) + 1 : post.likeCount || 0}</span>
            </button>
            <span>人觉得有用</span>
          </div>
        </div>

        {/* Comments */}
        <div className={styles.commentsSection} ref={commentsRef}>
          <h3 className={styles.sectionTitle}>全部评论 ({comments.length})</h3>

          {comments.map((comment, index) => (
            <div key={comment.id} className={styles.commentItem} style={{ animationDelay: `${index * 80}ms` }}>
              <div className={styles.commentHeader}>
                <Avatar
                  src={comment.ownerOpenid}
                  fallbackSeed={comment.ownerOpenid || 'user'}
                  alt={comment.ownerOpenid || '用户'}
                  className={styles.commentAvatar}
                />
                <span className={styles.commentAuthor}>{comment.ownerOpenid || '匿名用户'}</span>
                <span className={styles.commentTime}>· {comment.createTime || '刚刚'}</span>
              </div>
              <div className={styles.commentText}>{comment.context}</div>
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
