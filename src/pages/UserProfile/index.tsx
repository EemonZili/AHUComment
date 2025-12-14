import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  ThumbsUp,
  Eye,
  MessageCircle,
  Calendar,
  UserCheck,
} from 'lucide-react'
import { getUserInfo } from '@/services/user'
import { pageQueryPostByOpenId } from '@/services'
import type { AuthUserDTO, PostDTO } from '@/types'
import { Loading, Avatar, PostImage } from '@/components'
import styles from './UserProfile.module.css'

export default function UserProfile() {
  const navigate = useNavigate()
  const { openid } = useParams<{ openid: string }>()

  const [user, setUser] = useState<AuthUserDTO | null>(null)
  const [posts, setPosts] = useState<PostDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      if (!openid) return

      setLoading(true)
      try {
        // 尝试获取用户信息，如果失败则使用基本信息
        const userData = await getUserInfo(openid)
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        // 如果 API 不支持查询其他用户，使用基本信息
        setUser({
          id: 0,
          openid: openid,
          nickname: openid,
          sex: '未知',
          avatar: '',
          bio: '',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [openid])

  // Fetch user's posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!openid || !user) return

      setPostsLoading(true)
      try {
        const data = await pageQueryPostByOpenId({
          id: user.id || 0,
          openid: openid,
          nickname: user.nickname || '',
          sex: user.sex || '',
          avatar: user.avatar || '',
          pageNo: 1,
          pageSize: 100,
        })

        // 处理可能的分页响应
        let postsArray: PostDTO[] = []
        if (data && typeof data === 'object' && 'result' in data) {
          postsArray = Array.isArray((data as any).result) ? (data as any).result : []
        } else if (Array.isArray(data)) {
          postsArray = data
        }

        setPosts(postsArray)
      } catch (error) {
        console.error('Failed to fetch user posts:', error)
        setPosts([])
      } finally {
        setPostsLoading(false)
      }
    }

    fetchPosts()
  }, [openid, user])

  const handlePostClick = (postId: number) => {
    navigate(`/post/${postId}`)
  }

  if (loading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" />
        <p className={styles.loadingText}>加载中...</p>
      </div>
    )
  }

  // Calculate total stats
  const totalLikes = posts.reduce((sum, post) => sum + (post.likeCount || 0), 0)
  const totalViews = posts.reduce((sum, post) => sum + (post.uv || 0), 0)

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.headerTitle}>用户主页</h1>
      </div>

      {/* User Info Section */}
      <div className={styles.userInfoSection}>
        <div className={styles.avatarWrapper}>
          <Avatar
            src={user.avatar}
            fallbackSeed={user.openid}
            alt={user.nickname}
            className={styles.avatar}
          />
        </div>
        <h2 className={styles.nickname}>{user.nickname}</h2>
        {user.bio && <p className={styles.bio}>{user.bio}</p>}

        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <UserCheck size={16} />
            <span>{user.sex || '未知'}</span>
          </div>
          <div className={styles.metaItem}>
            <Calendar size={16} />
            <span>加入于 {user.createTime ? new Date(user.createTime).toLocaleDateString() : '未知'}</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <FileText className={styles.statIcon} size={24} />
          <div className={styles.statNumber}>{posts.length}</div>
          <div className={styles.statLabel}>篇贴文</div>
        </div>
        <div className={styles.statCard}>
          <ThumbsUp className={styles.statIcon} size={24} />
          <div className={styles.statNumber}>{totalLikes}</div>
          <div className={styles.statLabel}>获赞数</div>
        </div>
        <div className={styles.statCard}>
          <Eye className={styles.statIcon} size={24} />
          <div className={styles.statNumber}>{totalViews}</div>
          <div className={styles.statLabel}>浏览量</div>
        </div>
      </div>

      {/* Posts Section */}
      <div className={styles.postsSection}>
        <h3 className={styles.sectionTitle}>
          <FileText size={20} />
          TA的贴文
        </h3>

        {postsLoading ? (
          <div className={styles.loadingContainer}>
            <Loading size="md" />
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <p className={styles.emptyText}>该用户还没有发布任何贴文</p>
          </div>
        ) : (
          <div className={styles.postsList}>
            {posts.map((post) => (
              <div
                key={post.id}
                className={styles.postCard}
                onClick={() => handlePostClick(post.id!)}
              >
                {post.image && (
                  <PostImage
                    src={post.image}
                    alt={post.context || '帖子图片'}
                    className={styles.postImage}
                  />
                )}
                <div className={styles.postContent}>
                  <p className={styles.postText}>
                    {post.context && post.context.length > 100
                      ? post.context.substring(0, 100) + '...'
                      : post.context || ''}
                  </p>
                  <div className={styles.postStats}>
                    <div className={styles.postStat}>
                      <ThumbsUp size={14} />
                      <span>{post.likeCount || 0}</span>
                    </div>
                    <div className={styles.postStat}>
                      <MessageCircle size={14} />
                      <span>{post.markCount || 0}</span>
                    </div>
                    <div className={styles.postStat}>
                      <Eye size={14} />
                      <span>{post.uv || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
