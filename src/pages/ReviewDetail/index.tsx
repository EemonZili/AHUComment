import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  ThumbsUp,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react'
import {
  queryPostById,
  queryMarkByPostId,
  pageQueryCommentByPid,
  likePost,
  likeMark,
  likeComment,
  addMark,
  addComment,
} from '@/services'
import { useAuthStore } from '@/store/auth'
import { useUserCache } from '@/store/userCache'
import type { PostDTO, MarkDTO, NewCommentDTO } from '@/types'
import { Loading, Avatar, PostImage, UserAvatar, UserName } from '@/components'
import styles from './ReviewDetail.module.css'

// Mark 和其对应的 Comments
interface MarkWithComments extends MarkDTO {
  comments?: NewCommentDTO[]
  commentsExpanded?: boolean
  showReplyBox?: boolean
}

export default function ReviewDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuthStore()
  const { fetchUsers } = useUserCache()

  // 数据状态
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<PostDTO | null>(null)
  const [marks, setMarks] = useState<MarkWithComments[]>([])
  const [isFavorited, setIsFavorited] = useState(false)

  // 发表 Mark 的状态
  const [showMarkForm, setShowMarkForm] = useState(false)
  const [newMarkScore, setNewMarkScore] = useState(5)
  const [newMarkContent, setNewMarkContent] = useState('')
  const [submittingMark, setSubmittingMark] = useState(false)

  // 回复状态
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({})

  // 获取帖子详情和评分列表
  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!id) return

      setLoading(true)
      try {
        // 获取帖子详情
        const postData = await queryPostById({ id: Number(id) } as any)
        setPost(postData)

        // 获取所有评分
        const marksData = await queryMarkByPostId({ postId: Number(id) } as any)
        let marksArray: MarkDTO[] = []
        if (marksData && typeof marksData === 'object' && 'result' in marksData) {
          marksArray = Array.isArray((marksData as any).result) ? (marksData as any).result : []
        } else if (Array.isArray(marksData)) {
          marksArray = marksData
        }

        // 为每个 mark 获取对应的评论
        const marksWithComments = await Promise.all(
          marksArray.map(async (mark) => {
            try {
              // 根据 markId 查询评论
              const commentsData = await pageQueryCommentByPid(mark.id || 0, {} as any)
              let commentsArray: NewCommentDTO[] = []
              if (commentsData && typeof commentsData === 'object' && 'result' in commentsData) {
                commentsArray = Array.isArray((commentsData as any).result)
                  ? (commentsData as any).result
                  : []
              } else if (Array.isArray(commentsData)) {
                commentsArray = commentsData
              }

              return {
                ...mark,
                comments: commentsArray,
                commentsExpanded: false,
                showReplyBox: false,
              }
            } catch (error) {
              console.error(`Failed to fetch comments for mark ${mark.id}:`, error)
              return {
                ...mark,
                comments: [],
                commentsExpanded: false,
                showReplyBox: false,
              }
            }
          })
        )

        setMarks(marksWithComments)

        // 批量预加载所有用户信息（性能优化）
        const userOpenids: string[] = []

        // 添加帖子作者
        if (postData.ownerOpenid) {
          userOpenids.push(postData.ownerOpenid)
        }

        // 添加所有 mark 作者
        marksWithComments.forEach((mark) => {
          if (mark.ownerOpenid) {
            userOpenids.push(mark.ownerOpenid)
          }

          // 添加该 mark 下的所有 comment 作者
          mark.comments?.forEach((comment) => {
            if (comment.ownerOpenid) {
              userOpenids.push(comment.ownerOpenid)
            }
          })
        })

        // 批量获取所有用户信息
        if (userOpenids.length > 0) {
          fetchUsers(userOpenids)
        }
      } catch (error) {
        console.error('Failed to fetch post detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPostDetail()
  }, [id])

  // 点赞帖子
  const handleLikePost = async () => {
    if (!id) return
    try {
      await likePost(Number(id))
      const postData = await queryPostById({ id: Number(id) } as any)
      setPost(postData)
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  // 点赞 Mark
  const handleLikeMark = async (markId: number) => {
    try {
      await likeMark(markId)
      // 重新获取 marks 列表
      const marksData = await queryMarkByPostId({ postId: Number(id) } as any)
      let marksArray: MarkDTO[] = []
      if (marksData && typeof marksData === 'object' && 'result' in marksData) {
        marksArray = Array.isArray((marksData as any).result) ? (marksData as any).result : []
      } else if (Array.isArray(marksData)) {
        marksArray = marksData
      }

      // 保持展开状态
      setMarks((prev) =>
        marksArray.map((mark) => {
          const prevMark = prev.find((m) => m.id === mark.id)
          return {
            ...mark,
            comments: prevMark?.comments || [],
            commentsExpanded: prevMark?.commentsExpanded || false,
            showReplyBox: prevMark?.showReplyBox || false,
          }
        })
      )
    } catch (error) {
      console.error('Failed to like mark:', error)
    }
  }

  // 点赞 Comment
  const handleLikeComment = async (commentId: number, markId: number) => {
    try {
      await likeComment(commentId)
      // 重新获取该 mark 的评论
      const commentsData = await pageQueryCommentByPid(markId, {} as any)
      let commentsArray: NewCommentDTO[] = []
      if (commentsData && typeof commentsData === 'object' && 'result' in commentsData) {
        commentsArray = Array.isArray((commentsData as any).result)
          ? (commentsData as any).result
          : []
      } else if (Array.isArray(commentsData)) {
        commentsArray = commentsData
      }

      // 更新该 mark 的评论列表
      setMarks((prev) =>
        prev.map((mark) =>
          mark.id === markId ? { ...mark, comments: commentsArray } : mark
        )
      )
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }

  // 展开/折叠评论
  const toggleComments = (markId: number) => {
    setMarks((prev) =>
      prev.map((mark) =>
        mark.id === markId ? { ...mark, commentsExpanded: !mark.commentsExpanded } : mark
      )
    )
  }

  // 显示/隐藏回复框
  const toggleReplyBox = (markId: number) => {
    setMarks((prev) =>
      prev.map((mark) =>
        mark.id === markId ? { ...mark, showReplyBox: !mark.showReplyBox } : mark
      )
    )
  }

  // 发表 Mark
  const handleSubmitMark = async () => {
    if (!user?.openid || !id || !newMarkContent.trim()) {
      alert('请输入评论内容')
      return
    }

    setSubmittingMark(true)
    try {
      await addMark(user.openid, Number(id), Number(id), {
        ownerOpenid: user.openid,
        postId: Number(id),
        context: newMarkContent.trim(),
        score: newMarkScore,
      })

      // 重新获取评分列表
      const marksData = await queryMarkByPostId({ postId: Number(id) } as any)
      let marksArray: MarkDTO[] = []
      if (marksData && typeof marksData === 'object' && 'result' in marksData) {
        marksArray = Array.isArray((marksData as any).result) ? (marksData as any).result : []
      } else if (Array.isArray(marksData)) {
        marksArray = marksData
      }

      const marksWithComments = await Promise.all(
        marksArray.map(async (mark) => {
          try {
            const commentsData = await pageQueryCommentByPid(mark.id || 0, {} as any)
            let commentsArray: NewCommentDTO[] = []
            if (commentsData && typeof commentsData === 'object' && 'result' in commentsData) {
              commentsArray = Array.isArray((commentsData as any).result)
                ? (commentsData as any).result
                : []
            } else if (Array.isArray(commentsData)) {
              commentsArray = commentsData
            }

            return {
              ...mark,
              comments: commentsArray,
              commentsExpanded: false,
              showReplyBox: false,
            }
          } catch (error) {
            return {
              ...mark,
              comments: [],
              commentsExpanded: false,
              showReplyBox: false,
            }
          }
        })
      )

      setMarks(marksWithComments)
      setNewMarkContent('')
      setNewMarkScore(5)
      setShowMarkForm(false)
      alert('评分已发表！')
    } catch (error) {
      console.error('Failed to submit mark:', error)
      alert('评分发表失败')
    } finally {
      setSubmittingMark(false)
    }
  }

  // 回复 Mark（发表 Comment）
  const handleReplyToMark = async (markId: number) => {
    const content = replyContent[markId]
    if (!user?.openid || !content?.trim()) {
      alert('请输入回复内容')
      return
    }

    try {
      await addComment(user.openid, markId, {
        ownerOpenid: user.openid,
        pid: markId,
        context: content.trim(),
      })

      // 重新获取该 mark 的评论
      const commentsData = await pageQueryCommentByPid(markId, {} as any)
      let commentsArray: NewCommentDTO[] = []
      if (commentsData && typeof commentsData === 'object' && 'result' in commentsData) {
        commentsArray = Array.isArray((commentsData as any).result)
          ? (commentsData as any).result
          : []
      } else if (Array.isArray(commentsData)) {
        commentsArray = commentsData
      }

      // 更新该 mark 的评论列表
      setMarks((prev) =>
        prev.map((mark) =>
          mark.id === markId
            ? { ...mark, comments: commentsArray, showReplyBox: false, commentsExpanded: true }
            : mark
        )
      )

      setReplyContent((prev) => ({ ...prev, [markId]: '' }))
      alert('回复已发表！')
    } catch (error) {
      console.error('Failed to reply to mark:', error)
      alert('回复发表失败')
    }
  }

  // 渲染星级
  const renderStars = (rating: number, size: number = 16, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= rating ? styles.starFilled : styles.starEmpty}
            fill={star <= rating ? 'currentColor' : 'none'}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            style={interactive ? { cursor: 'pointer' } : undefined}
          />
        ))}
      </div>
    )
  }

  // 计算评分分布
  const getScoreDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    marks.forEach((mark) => {
      const score = mark.score || 5
      if (score >= 1 && score <= 5) {
        distribution[score as 1 | 2 | 3 | 4 | 5]++
      }
    })
    return distribution
  }

  // 计算平均分
  const getAverageScore = () => {
    if (marks.length === 0) return 0
    const total = marks.reduce((sum, mark) => sum + (mark.score || 0), 0)
    return (total / marks.length).toFixed(1)
  }

  // 显示加载状态
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loading size="lg" />
        </div>
      </div>
    )
  }

  // 如果没有数据
  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyContainer}>
          <p>帖子不存在</p>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            返回
          </button>
        </div>
      </div>
    )
  }

  const scoreDistribution = getScoreDistribution()
  const averageScore = getAverageScore()

  return (
    <div className={styles.container}>
      {/* Top Nav */}
      <div className={styles.nav}>
        <button className={styles.navBackBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>
        <div className={styles.navActions}>
          <button className={styles.navIconBtn} onClick={() => alert('分享功能')}>
            <Share2 size={20} />
          </button>
          <button
            className={`${styles.navIconBtn} ${isFavorited ? styles.active : ''}`}
            onClick={() => setIsFavorited(!isFavorited)}
          >
            <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* 左侧主内容区 */}
        <div className={styles.mainSection}>
          {/* 主帖区域 - 虎扑风格 */}
          <div className={styles.postCard}>
            {/* 楼主信息 */}
            <div className={styles.postHeader}>
              <UserAvatar
                openid={post.ownerOpenid}
                className={styles.postAvatar}
              />
              <div className={styles.postAuthorInfo}>
                <div className={styles.postAuthorName}>
                  <UserName openid={post.ownerOpenid} fallback="匿名用户" />
                </div>
                <div className={styles.postTime}>{post.createTime || '刚刚'}</div>
              </div>
            </div>

            {/* 帖子内容 */}
            <div className={styles.postContent}>
              <h1 className={styles.postTitle}>{post.context?.substring(0, 50) || '帖子标题'}</h1>
              <p className={styles.postText}>{post.context}</p>

              {/* 图片 */}
              {post.image && (
                <div className={styles.postImages}>
                  <PostImage src={post.image} alt="帖子图片" className={styles.postImage} />
                </div>
              )}
            </div>

            {/* 底部操作 */}
            <div className={styles.postActions}>
              <button className={styles.postActionBtn} onClick={handleLikePost}>
                <ThumbsUp size={18} />
                <span>{post.likeCount || 0}</span>
              </button>
              <button className={styles.postActionBtn} onClick={() => setShowMarkForm(true)}>
                <MessageCircle size={18} />
                <span>{marks.length}</span>
              </button>
              <button className={styles.postActionBtn} onClick={() => alert('分享功能')}>
                <Share2 size={18} />
                <span>分享</span>
              </button>
            </div>
          </div>

          {/* 发表评分区域 */}
          {showMarkForm ? (
            <div className={styles.markForm}>
              <h3 className={styles.markFormTitle}>发表你的评分</h3>
              <div className={styles.markFormRating}>
                <span>评分：</span>
                {renderStars(newMarkScore, 24, true, setNewMarkScore)}
                <span className={styles.markFormRatingText}>{newMarkScore} 分</span>
              </div>
              <textarea
                className={styles.markFormTextarea}
                placeholder="说说你的看法..."
                value={newMarkContent}
                onChange={(e) => setNewMarkContent(e.target.value)}
                rows={4}
              />
              <div className={styles.markFormActions}>
                <button
                  className={styles.markFormBtnCancel}
                  onClick={() => {
                    setShowMarkForm(false)
                    setNewMarkContent('')
                    setNewMarkScore(5)
                  }}
                >
                  取消
                </button>
                <button
                  className={styles.markFormBtnSubmit}
                  onClick={handleSubmitMark}
                  disabled={submittingMark}
                >
                  {submittingMark ? '发表中...' : '发表评分'}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.markFormPrompt}>
              <button className={styles.markFormPromptBtn} onClick={() => setShowMarkForm(true)}>
                <MessageCircle size={20} />
                <span>发表你的评分</span>
              </button>
            </div>
          )}

          {/* Mark 列表（主回复） */}
          <div className={styles.marksSection}>
            <h2 className={styles.marksSectionTitle}>全部评分 ({marks.length})</h2>

            {marks.length === 0 ? (
              <div className={styles.emptyMarks}>
                <p>还没有评分，快来发表第一条吧！</p>
              </div>
            ) : (
              marks.map((mark, index) => (
                <div key={mark.id} className={styles.markCard}>
                  {/* Mark 头部 */}
                  <div className={styles.markHeader}>
                    <div className={styles.markFloor}>#{index + 1}</div>
                    <UserAvatar
                      openid={mark.ownerOpenid}
                      className={styles.markAvatar}
                    />
                    <div className={styles.markAuthorInfo}>
                      <div className={styles.markAuthorName}>
                        <UserName openid={mark.ownerOpenid} fallback="匿名用户" />
                      </div>
                      <div className={styles.markTime}>{mark.createTime || '刚刚'}</div>
                    </div>
                    <div className={styles.markRating}>
                      {renderStars(mark.score || 5, 18)}
                      <span className={styles.markRatingText}>{mark.score || 5} 分</span>
                    </div>
                  </div>

                  {/* Mark 内容 */}
                  <div className={styles.markContent}>
                    <p>{mark.context}</p>
                  </div>

                  {/* Mark 操作 */}
                  <div className={styles.markActions}>
                    <button
                      className={styles.markActionBtn}
                      onClick={() => handleLikeMark(mark.id || 0)}
                    >
                      <ThumbsUp size={16} />
                      <span>{mark.likeCount || 0}</span>
                    </button>
                    <button
                      className={styles.markActionBtn}
                      onClick={() => toggleReplyBox(mark.id || 0)}
                    >
                      <MessageCircle size={16} />
                      <span>回复</span>
                    </button>
                    {(mark.comments?.length || 0) > 0 && (
                      <button
                        className={styles.markActionBtn}
                        onClick={() => toggleComments(mark.id || 0)}
                      >
                        {mark.commentsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        <span>{mark.comments?.length || 0} 条回复</span>
                      </button>
                    )}
                  </div>

                  {/* 回复框 */}
                  {mark.showReplyBox && (
                    <div className={styles.replyBox}>
                      <textarea
                        className={styles.replyTextarea}
                        placeholder="写下你的回复..."
                        value={replyContent[mark.id || 0] || ''}
                        onChange={(e) =>
                          setReplyContent((prev) => ({
                            ...prev,
                            [mark.id || 0]: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                      <div className={styles.replyActions}>
                        <button
                          className={styles.replyBtnCancel}
                          onClick={() => toggleReplyBox(mark.id || 0)}
                        >
                          取消
                        </button>
                        <button
                          className={styles.replyBtnSubmit}
                          onClick={() => handleReplyToMark(mark.id || 0)}
                        >
                          <Send size={16} />
                          <span>发表</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Comment 列表（楼中楼） */}
                  {mark.commentsExpanded && (mark.comments?.length || 0) > 0 && (
                    <div className={styles.commentsSection}>
                      {mark.comments?.map((comment) => (
                        <div key={comment.id} className={styles.commentCard}>
                          <UserAvatar
                            openid={comment.ownerOpenid}
                            className={styles.commentAvatar}
                          />
                          <div className={styles.commentMain}>
                            <div className={styles.commentHeader}>
                              <span className={styles.commentAuthor}>
                                <UserName openid={comment.ownerOpenid} fallback="匿名用户" />
                              </span>
                              <span className={styles.commentTime}>{comment.createTime || '刚刚'}</span>
                            </div>
                            <div className={styles.commentContent}>{comment.context}</div>
                            <div className={styles.commentActions}>
                              <button
                                className={styles.commentActionBtn}
                                onClick={() => handleLikeComment(comment.id || 0, mark.id || 0)}
                              >
                                <ThumbsUp size={14} />
                                <span>{comment.likeCount || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 右侧边栏 - 评分统计 */}
        <div className={styles.sidebar}>
          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>评分统计</h3>
            <div className={styles.averageScore}>
              <div className={styles.averageScoreNumber}>{averageScore}</div>
              <div className={styles.averageScoreStars}>
                {renderStars(Math.round(Number(averageScore)), 20)}
              </div>
              <div className={styles.averageScoreText}>{marks.length} 条评分</div>
            </div>
            <div className={styles.scoreDistribution}>
              {[5, 4, 3, 2, 1].map((score) => {
                const count = scoreDistribution[score as 1 | 2 | 3 | 4 | 5]
                const percentage = marks.length > 0 ? (count / marks.length) * 100 : 0
                return (
                  <div key={score} className={styles.scoreDistributionItem}>
                    <span className={styles.scoreLabel}>{score} 星</span>
                    <div className={styles.scoreBar}>
                      <div
                        className={styles.scoreBarFill}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className={styles.scoreCount}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
