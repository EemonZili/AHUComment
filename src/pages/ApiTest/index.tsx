import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import {
  // 贴文分区
  listPostCategories,
  addPostCategory,
  updatePostCategory,
  deletePostCategory,
  // 贴文
  addPost,
  updatePost,
  deletePost,
  queryPostById,
  pageQueryPostByOpenId,
  pageQueryPostByCategoryId,
  likePost,
  queryPostLikes,
  uploadPostPicture,
  downloadPostPicture,
  // 评分
  addMark,
  updateMark,
  deleteMark,
  queryMarkById,
  queryMarkByPostId,
  pageQueryMarkByOpenId,
  likeMark,
  queryMarkLikes,
  // 评论
  addComment,
  updateComment,
  deleteComment,
  pageQueryCommentByOpenId,
  pageQueryCommentByPid,
  likeComment,
  queryCommentLikes,
} from '@/services'
import { Button } from '@/components'
import styles from './ApiTest.module.css'

export default function ApiTest() {
  const { user } = useAuthStore()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true)
    try {
      console.log(`🧪 测试开始: ${testName}`)
      const data = await testFn()
      console.log(`✅ 测试成功: ${testName}`, data)
      setResult({ success: true, testName, data })
      alert(`✅ ${testName} 成功！查看控制台获取详细信息`)
    } catch (error: any) {
      console.error(`❌ 测试失败: ${testName}`, error)
      setResult({ success: false, testName, error: error.message })
      alert(`❌ ${testName} 失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1>API 接口测试 - 全部29个接口</h1>

      {user && (
        <div className={styles.userInfo}>
          <p>当前用户: {user.nickname} ({user.openid})</p>
        </div>
      )}

      {/* 1. 贴文分区 API - 4个接口 */}
      <div className={styles.section}>
        <h2>1. 贴文分区 API (4/4)</h2>

        <Button
          onClick={() => handleTest('1.1 查询所有分区', () => listPostCategories())}
          disabled={loading}
        >
          1.1 查询所有分区
        </Button>

        <Button
          onClick={() =>
            handleTest('1.2 新增贴文分区', () =>
              addPostCategory('测试分区', {
                categoryName: '测试分区',
                color: '#FF6B6B',
                status: 1,
              })
            )
          }
          disabled={loading}
        >
          1.2 新增贴文分区
        </Button>

        <Button
          onClick={() =>
            handleTest('1.3 更新贴文分区', () =>
              updatePostCategory(1, {
                categoryName: '更新后的分区名',
                color: '#4ECDC4',
                status: 1,
              })
            )
          }
          disabled={loading}
        >
          1.3 更新贴文分区 ID=1
        </Button>

        <Button
          onClick={() =>
            handleTest('1.4 删除贴文分区', () =>
              deletePostCategory(999, {
                categoryName: '',
              })
            )
          }
          disabled={loading}
        >
          1.4 删除贴文分区 ID=999
        </Button>
      </div>

      {/* 2. 贴文 API - 10个接口 */}
      <div className={styles.section}>
        <h2>2. 贴文 API (10/10)</h2>

        <Button
          onClick={() =>
            handleTest('2.1 发布贴文', () =>
              addPost(user?.openid || '', 1, '测试贴文内容', {
                ownerOpenid: user?.openid || '',
                categoryId: 1,
                context: '这是一条测试贴文',
              })
            )
          }
          disabled={loading || !user}
        >
          2.1 发布测试贴文
        </Button>

        <Button
          onClick={() =>
            handleTest('2.2 更新贴文', () =>
              updatePost(1, {
                ownerOpenid: user?.openid || '',
                categoryId: 1,
                context: '更新后的贴文内容',
              })
            )
          }
          disabled={loading || !user}
        >
          2.2 更新贴文 ID=1
        </Button>

        <Button
          onClick={() =>
            handleTest('2.3 删除贴文', () =>
              deletePost(999, {
                ownerOpenid: '',
                categoryId: 1,
                context: '',
              })
            )
          }
          disabled={loading}
        >
          2.3 删除贴文 ID=999
        </Button>

        <Button
          onClick={() =>
            handleTest('2.4 根据ID查询贴文', () =>
              queryPostById({
                id: 1,
                ownerOpenid: '',
                categoryId: 1,
                context: '',
              })
            )
          }
          disabled={loading}
        >
          2.4 查询贴文 ID=1
        </Button>

        <Button
          onClick={() =>
            handleTest('2.5 根据OpenID查询贴文', () =>
              pageQueryPostByOpenId({
                id: user?.id || 0,
                openid: user?.openid || '',
                nickname: user?.nickname || '',
                sex: user?.sex || '',
                avatar: user?.avatar || '',
                pageNo: 1,
                pageSize: 10,
              })
            )
          }
          disabled={loading || !user}
        >
          2.5 查询我的贴文
        </Button>

        <Button
          onClick={() =>
            handleTest('2.6 根据分区查询贴文', () =>
              pageQueryPostByCategoryId(1, {
                ownerOpenid: '',
                categoryId: 1,
                context: '',
              })
            )
          }
          disabled={loading}
        >
          2.6 查询分区1的贴文
        </Button>

        <Button
          onClick={() => handleTest('2.7 点赞贴文', () => likePost(1))}
          disabled={loading}
        >
          2.7 点赞贴文 ID=1
        </Button>

        <Button
          onClick={() => handleTest('2.8 查询贴文点赞数', () => queryPostLikes(1))}
          disabled={loading}
        >
          2.8 查询贴文点赞数 ID=1
        </Button>

        <div style={{ marginTop: '10px' }}>
          <label style={{ marginRight: '10px' }}>2.9 上传贴文图片:</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                await handleTest('2.9 上传贴文图片', () => uploadPostPicture(file))
              }
            }}
            disabled={loading}
          />
        </div>

        <Button
          onClick={() =>
            handleTest('2.10 下载贴文图片', () =>
              downloadPostPicture('https://example.com/image.jpg')
            )
          }
          disabled={loading}
        >
          2.10 下载贴文图片
        </Button>
      </div>

      {/* 3. 评分 API - 8个接口 */}
      <div className={styles.section}>
        <h2>3. 评分 API (8/8)</h2>

        <Button
          onClick={() =>
            handleTest('3.1 添加评分', () =>
              addMark(user?.openid || '', 1, 0, {
                ownerOpenid: user?.openid || '',
                postId: 1,
                score: 5,
                context: '非常好！',
              })
            )
          }
          disabled={loading || !user}
        >
          3.1 添加评分（贴文ID=1）
        </Button>

        <Button
          onClick={() =>
            handleTest('3.2 修改评分', () =>
              updateMark(1, {
                ownerOpenid: user?.openid || '',
                postId: 1,
                score: 4,
                context: '修改后的评分内容',
              })
            )
          }
          disabled={loading || !user}
        >
          3.2 修改评分 ID=1
        </Button>

        <Button
          onClick={() =>
            handleTest('3.3 删除评分', () =>
              deleteMark(999, {
                ownerOpenid: '',
                postId: 1,
                score: 0,
              })
            )
          }
          disabled={loading}
        >
          3.3 删除评分 ID=999
        </Button>

        <Button
          onClick={() =>
            handleTest('3.4 根据ID查询评分', () =>
              queryMarkById(1, {
                ownerOpenid: '',
                postId: 1,
                score: 0,
              })
            )
          }
          disabled={loading}
        >
          3.4 查询评分 ID=1
        </Button>

        <Button
          onClick={() =>
            handleTest('3.5 根据贴文查询评分', () =>
              queryMarkByPostId(1, {
                ownerOpenid: '',
                postId: 1,
                score: 0,
              })
            )
          }
          disabled={loading}
        >
          3.5 查询贴文的评分 postId=1
        </Button>

        <Button
          onClick={() =>
            handleTest('3.6 根据OpenID查询评分', () =>
              pageQueryMarkByOpenId(user?.openid || '', {
                id: user?.id || 0,
                openid: user?.openid || '',
                nickname: user?.nickname || '',
                sex: user?.sex || '',
                avatar: user?.avatar || '',
                pageNo: 1,
                pageSize: 10,
              })
            )
          }
          disabled={loading || !user}
        >
          3.6 查询我的评分
        </Button>

        <Button
          onClick={() => handleTest('3.7 点赞评分', () => likeMark(1))}
          disabled={loading}
        >
          3.7 点赞评分 ID=1
        </Button>

        <Button
          onClick={() => handleTest('3.8 查询评分点赞数', () => queryMarkLikes(1))}
          disabled={loading}
        >
          3.8 查询评分点赞数 ID=1
        </Button>
      </div>

      {/* 4. 评论 API - 7个接口 */}
      <div className={styles.section}>
        <h2>4. 评论 API (7/7)</h2>

        <Button
          onClick={() =>
            handleTest('4.1 添加评论', () =>
              addComment(user?.openid || '', 1, {
                ownerOpenid: user?.openid || '',
                pid: 1,
                context: '这是一条测试评论',
              })
            )
          }
          disabled={loading || !user}
        >
          4.1 添加评论（评分ID=1）
        </Button>

        <Button
          onClick={() =>
            handleTest('4.2 修改评论', () =>
              updateComment(1, {
                ownerOpenid: user?.openid || '',
                pid: 1,
                context: '修改后的评论内容',
              })
            )
          }
          disabled={loading || !user}
        >
          4.2 修改评论 ID=1
        </Button>

        <Button
          onClick={() =>
            handleTest('4.3 删除评论', () =>
              deleteComment(999, {
                ownerOpenid: '',
                pid: 1,
                context: '',
              })
            )
          }
          disabled={loading}
        >
          4.3 删除评论 ID=999
        </Button>

        <Button
          onClick={() =>
            handleTest('4.4 根据OpenID查询评论', () =>
              pageQueryCommentByOpenId({
                id: user?.id || 0,
                openid: user?.openid || '',
                nickname: user?.nickname || '',
                sex: user?.sex || '',
                avatar: user?.avatar || '',
                pageNo: 1,
                pageSize: 10,
              })
            )
          }
          disabled={loading || !user}
        >
          4.4 查询我的评论
        </Button>

        <Button
          onClick={() =>
            handleTest('4.5 根据PID查询评论', () =>
              pageQueryCommentByPid(1, {
                ownerOpenid: '',
                pid: 1,
                context: '',
              })
            )
          }
          disabled={loading}
        >
          4.5 查询评分的评论 pid=1
        </Button>

        <Button
          onClick={() => handleTest('4.6 点赞评论', () => likeComment(1))}
          disabled={loading}
        >
          4.6 点赞评论 ID=1
        </Button>

        <Button
          onClick={() => handleTest('4.7 查询评论点赞数', () => queryCommentLikes(1))}
          disabled={loading}
        >
          4.7 查询评论点赞数 ID=1
        </Button>
      </div>

      {/* 测试结果显示 */}
      {result && (
        <div className={styles.result}>
          <h3>最后测试结果:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {/* 统计信息 */}
      <div className={styles.section} style={{ marginTop: '2rem', background: '#f0f9ff' }}>
        <h3>📊 接口统计</h3>
        <p>✅ 贴文分区: 4个接口</p>
        <p>✅ 贴文: 10个接口</p>
        <p>✅ 评分: 8个接口</p>
        <p>✅ 评论: 7个接口</p>
        <p><strong>总计: 29个接口</strong></p>
      </div>
    </div>
  )
}
