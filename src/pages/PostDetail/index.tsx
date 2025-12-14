import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Star,
  ThumbsUp,
  MessageCircle,
  Eye,
  Send,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import {
  queryPostById,
  likePost,
  queryMarkByPostId,
  addMark,
  likeMark,
  pageQueryCommentByPid,
  addComment,
  likeComment,
} from '@/services'
import { useAuthStore } from '@/store/auth'
import type { PostDTO, MarkDTO, NewCommentDTO } from '@/types'
import { Loading, Avatar } from '@/components'
import styles from './PostDetail.module.css'

export default function PostDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const marksRef = useRef<HTMLDivElement>(null)

  const [post, setPost] = useState<PostDTO | null>(null)
  const [marks, setMarks] = useState<MarkDTO[]>([])
  const [comments, setComments] = useState<Record<number, NewCommentDTO[]>>({})
  const [loading, setLoading] = useState(true)
  const [marksLoading, setMarksLoading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [marksTotal, setMarksTotal] = useState(0)
  const pageSize = 5

  // 评分表单
  const [myScore, setMyScore] = useState(5)
  const [myContext, setMyContext] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 评论表单
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({})
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())

  // Fetch post details
  useEffect(() => {
    const fetchPostData = async () => {
      if (!id) return

      setLoading(true)
      try {
        const postData = await queryPostById({
          id: Number(id),
          ownerOpenid: '',
          categoryId: 0,
          context: '',
        })
        setPost(postData)
      } catch (error) {
        console.error('Failed to fetch post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPostData()
  }, [id])

  // Fetch marks for this post
  useEffect(() => {
    const fetchMarks = async () => {
      if (!id) return

      setMarksLoading(true)
      try {
        const data = await queryMarkByPostId({
          ownerOpenid: '',
          postId: Number(id),
          score: 0,
        })

        // 处理可能的分页响应
        let marksArray: MarkDTO[] = []
        if (data && typeof data === 'object' && 'result' in data) {
          marksArray = Array.isArray((data as any).result) ? (data as any).result : []
        } else if (Array.isArray(data)) {
          marksArray = data
        }

        setMarks(marksArray)
        setMarksTotal(marksArray.length)
      } catch (error) {
        console.error('Failed to fetch marks:', error)
        setMarks([])
        setMarksTotal(0)
      } finally {
        setMarksLoading(false)
      }
    }

    fetchMarks()
  }, [id, currentPage])

  // Fetch comments for a mark
  const fetchComments = async (markId: number) => {
    try {
      const data = await pageQueryCommentByPid({
        ownerOpenid: '',
        pid: markId,
        context: '',
      })

      // 处理可能的分页响应
      let commentsArray: NewCommentDTO[] = []
      if (data && typeof data === 'object' && 'result' in data) {
        commentsArray = Array.isArray((data as any).result) ? (data as any).result : []
      } else if (Array.isArray(data)) {
        commentsArray = data
      }

      setComments((prev) => ({ ...prev, [markId]: commentsArray }))
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handlePrevSlide = () => {
    setCurrentSlide(0) // 只有一张图片
  }

  const handleNextSlide = () => {
    setCurrentSlide(0) // 只有一张图片
  }

  const handleFavorite = async () => {
    setIsFavorited(!isFavorited)
  }

  const handleShare = () => {
    if (!post) return
    if (navigator.share) {
      navigator.share({
        title: '校园贴文',
        text: post.context,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  const handleAvatarClick = (openid: string) => {
    console.log('Avatar clicked in PostDetail, navigating to:', `/user/${openid}`)
    navigate(`/user/${openid}`)
  }

  const handleLikePost = async () => {
    if (!user) {
      alert('请先登录')
      return
    }

    try {
      await likePost(Number(id))
      // 重新获取贴文数据
      const postData = await queryPostById({
        id: Number(id),
        ownerOpenid: '',
        categoryId: 0,
        context: '',
      })
      setPost(postData)
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const handleSubmitMark = async () => {
    if (!user) {
      alert('请先登录')
      return
    }

    if (!myContext.trim()) {
      alert('请输入评分说明')
      return
    }

    setSubmitting(true)
    try {
      await addMark(user.openid, Number(id), 0, {
        ownerOpenid: user.openid,
        postId: Number(id),
        score: myScore,
        context: myContext,
      })
      alert('评分成功！')
      setMyContext('')
      setMyScore(5)

      // 重新获取评分列表
      const data = await queryMarkByPostId({
        ownerOpenid: '',
        postId: Number(id),
        score: 0,
      })

      let marksArray: MarkDTO[] = []
      if (data && typeof data === 'object' && 'result' in data) {
        marksArray = Array.isArray((data as any).result) ? (data as any).result : []
      } else if (Array.isArray(data)) {
        marksArray = data
      }

      setMarks(marksArray)
      setMarksTotal(marksArray.length)
    } catch (error) {
      console.error('Failed to submit mark:', error)
      alert('评分失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeMark = async (markId: number) => {
    if (!user) {
      alert('请先登录')
      return
    }

    try {
      await likeMark(markId)
      // 重新获取评分列表
      const data = await queryMarkByPostId({
        ownerOpenid: '',
        postId: Number(id),
        score: 0,
      })

      let marksArray: MarkDTO[] = []
      if (data && typeof data === 'object' && 'result' in data) {
        marksArray = Array.isArray((data as any).result) ? (data as any).result : []
      } else if (Array.isArray(data)) {
        marksArray = data
      }

      setMarks(marksArray)
    } catch (error) {
      console.error('Failed to like mark:', error)
    }
  }

  const handleSubmitComment = async (markId: number) => {
    if (!user) {
      alert('请先登录')
      return
    }

    const text = commentTexts[markId]
    if (!text || !text.trim()) {
      alert('请输入评论内容')
      return
    }

    try {
      await addComment(user.openid, markId, {
        ownerOpenid: user.openid,
        pid: markId,
        context: text,
      })
      setCommentTexts((prev) => ({ ...prev, [markId]: '' }))
      fetchComments(markId)
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('评论失败，请重试')
    }
  }

  const handleLikeComment = async (commentId: number, markId: number) => {
    if (!user) {
      alert('请先登录')
      return
    }

    try {
      await likeComment(commentId)
      fetchComments(markId)
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }

  const handleShowComments = (markId: number) => {
    const expanded = new Set(expandedComments)
    if (expanded.has(markId)) {
      expanded.delete(markId)
    } else {
      expanded.add(markId)
      if (!comments[markId]) {
        fetchComments(markId)
      }
    }
    setExpandedComments(expanded)
  }

  const scrollToMarks = () => {
    marksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  if (loading || !post) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" />
        <p className={styles.loadingText}>加载中...</p>
      </div>
    )
  }

  // Calculate score distribution
  const scoreDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  marks.forEach((mark) => {
    if (mark.score >= 1 && mark.score <= 5) {
      scoreDistribution[mark.score]++
    }
  })

  const avgRating = marks.length > 0
    ? marks.reduce((sum, mark) => sum + mark.score, 0) / marks.length
    : 0

  const totalMarkPages = Math.ceil(marksTotal / pageSize)

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

      {/* Image Carousel (if post has image) */}
      {post.image && (
        <div className={styles.carousel}>
          <div className={styles.carouselContainer}>
            <img
              src={post.image}
              alt={post.context}
              className={styles.carouselImage}
            />
          </div>
        </div>
      )}

      {/* Post Info */}
      <div className={styles.placeInfo}>
        <div className={styles.placeHeader}>
          <div>
            <h1 className={styles.placeName}>{post.context}</h1>
          </div>
          <button className={styles.writeReviewButton} onClick={scrollToMarks}>
            <Star size={18} />
            <span>去评分</span>
          </button>
        </div>

        {/* Rating */}
        <div className={styles.ratingSection}>
          <div className={styles.overallRating}>
            <div className={styles.ratingNumber}>{avgRating.toFixed(1)}</div>
            {renderStars(Math.round(avgRating))}
            <span className={styles.reviewCount}>{marks.length} 个评分</span>
          </div>
        </div>

        {/* Details */}
        <div className={styles.detailsSection}>
          <div className={styles.detailItem}>
            <div
              onClick={() => handleAvatarClick(post.ownerOpenid || '')}
              style={{ cursor: 'pointer', display: 'inline-block' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleAvatarClick(post.ownerOpenid || '')
                }
              }}
            >
              <Avatar
                src={post.ownerOpenid}
                alt="发布者"
                size={40}
              />
            </div>
            <div>
              <div className={styles.detailLabel}>发布者</div>
              <div className={styles.detailValue}>{post.ownerOpenid}</div>
            </div>
          </div>
          <div className={styles.detailItem}>
            <Eye size={18} className={styles.detailIcon} />
            <div>
              <div className={styles.detailLabel}>浏览量</div>
              <div className={styles.detailValue}>{post.uv || 0} 次</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.actionButton} onClick={handleLikePost}>
            <ThumbsUp size={20} />
            <span>点赞 ({post.likeCount || 0})</span>
          </button>
          <button className={styles.actionButton} onClick={scrollToMarks}>
            <MessageCircle size={20} />
            <span>评分 ({post.markCount || 0})</span>
          </button>
        </div>
      </div>

      {/* Rating Distribution */}
      {marks.length > 0 && (
        <div className={styles.ratingDistribution}>
          <h3 className={styles.sectionTitle}>
            <TrendingUp size={24} />
            评分分布
          </h3>
          <div className={styles.ratingsContainer}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = scoreDistribution[rating] || 0
              return renderRatingBar(rating, count, marks.length)
            })}
          </div>
        </div>
      )}

      {/* Add Mark Form */}
      <div className={styles.addMarkForm} ref={marksRef}>
        <h3 className={styles.sectionTitle}>
          <Star size={24} />
          给个评分吧
        </h3>
        <div className={styles.scoreSelector}>
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              className={`${styles.scoreBtn} ${myScore === score ? styles.active : ''}`}
              onClick={() => setMyScore(score)}
            >
              {score} ⭐
            </button>
          ))}
        </div>
        <textarea
          placeholder="说说你的看法..."
          value={myContext}
          onChange={(e) => setMyContext(e.target.value)}
          className={styles.textarea}
          maxLength={200}
        />
        <button
          className={styles.submitButton}
          onClick={handleSubmitMark}
          disabled={submitting}
        >
          {submitting ? '提交中...' : '提交评分'}
        </button>
      </div>

      {/* Marks List */}
      <div className={styles.reviewsSection}>
        <div className={styles.reviewsHeader}>
          <h2 className={styles.sectionTitle}>
            <MessageCircle size={24} />
            大家的评分 ({marks.length})
          </h2>
        </div>

        {marksLoading ? (
          <div className={styles.loadingContainer}>
            <Loading size="md" />
          </div>
        ) : marks.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⭐</div>
            <p className={styles.emptyText}>还没有评分，快来第一个评分吧！</p>
          </div>
        ) : (
          <>
            <div className={styles.reviewsList}>
              {marks.map((mark) => (
                <div key={mark.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div
                      onClick={() => handleAvatarClick(mark.ownerOpenid || '')}
                      style={{ cursor: 'pointer', display: 'inline-block' }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleAvatarClick(mark.ownerOpenid || '')
                        }
                      }}
                    >
                      <Avatar
                        src={mark.ownerOpenid}
                        alt="用户"
                        size={40}
                      />
                    </div>
                    <div className={styles.reviewUserInfo}>
                      <div className={styles.reviewUserName}>{mark.ownerOpenid}</div>
                      <div className={styles.reviewRating}>
                        {renderStars(mark.score)}
                      </div>
                    </div>
                    <button
                      className={styles.reviewLikeButton}
                      onClick={() => handleLikeMark(mark.id!)}
                    >
                      <ThumbsUp size={16} />
                      <span>{mark.likeCount || 0}</span>
                    </button>
                  </div>
                  <p className={styles.reviewText}>{mark.context}</p>

                  {/* Comments Section */}
                  <div className={styles.commentsSection}>
                    <button
                      className={styles.showCommentsBtn}
                      onClick={() => handleShowComments(mark.id!)}
                    >
                      <MessageCircle size={16} />
                      <span>{mark.commentCount || 0} 条评论</span>
                    </button>

                    {expandedComments.has(mark.id!) && (
                      <div className={styles.commentsList}>
                        {comments[mark.id!] && comments[mark.id!].length > 0 ? (
                          <>
                            {comments[mark.id!].map((comment) => (
                              <div key={comment.id} className={styles.commentCard}>
                                <div className={styles.commentHeader}>
                                  <Avatar
                                    src={comment.ownerOpenid}
                                    alt="用户"
                                    size={24}
                                    onClick={() => handleAvatarClick(comment.ownerOpenid || '')}
                                  />
                                  <span className={styles.commentUser}>
                                    {comment.ownerOpenid}
                                  </span>
                                  <button
                                    className={styles.commentLikeBtn}
                                    onClick={() =>
                                      handleLikeComment(comment.id!, mark.id!)
                                    }
                                  >
                                    <ThumbsUp size={14} />
                                    <span>{comment.likeCount || 0}</span>
                                  </button>
                                </div>
                                <p className={styles.commentText}>{comment.context}</p>
                              </div>
                            ))}
                          </>
                        ) : (
                          <p className={styles.emptyComments}>暂无评论</p>
                        )}

                        {/* Add Comment Input */}
                        <div className={styles.addCommentInput}>
                          <input
                            type="text"
                            placeholder="写下你的评论..."
                            value={commentTexts[mark.id!] || ''}
                            onChange={(e) =>
                              setCommentTexts((prev) => ({
                                ...prev,
                                [mark.id!]: e.target.value,
                              }))
                            }
                          />
                          <button onClick={() => handleSubmitComment(mark.id!)}>
                            <Send size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalMarkPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  上一页
                </button>
                <div className={styles.pageNumbers}>
                  {Array.from({ length: totalMarkPages }, (_, i) => i + 1).map((page) => (
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
                  disabled={currentPage === totalMarkPages}
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

