# 快速使用指南 🚀

## 立即开始

### 1️⃣ 启动项目

```bash
npm run dev
```

浏览器会自动打开 `http://localhost:3000`

### 2️⃣ 登录系统

1. 访问登录页面
2. 使用微信扫描二维码
3. 等待自动跳转

### 3️⃣ 测试新接口

访问测试页面：`http://localhost:3000/api-test`

点击按钮测试各个接口，查看浏览器控制台输出。

## 📚 核心 API 使用

### 导入服务

```typescript
import {
  // 贴文分区
  listPostCategories,
  addPostCategory,

  // 贴文
  addPost,
  queryPostById,
  pageQueryPostByOpenId,
  likePost,
  uploadPostPicture,

  // 评分
  addMark,
  queryMarkByPostId,
  likeMark,

  // 评论
  addComment,
  pageQueryCommentByPid,
  likeComment,
} from '@/services'

import { useAuthStore } from '@/store/auth'
```

### 基础操作

#### 📝 发布贴文

```typescript
const { user } = useAuthStore()

// 1. 上传图片（可选）
const imageUrl = await uploadPostPicture(file)

// 2. 发布贴文
await addPost(user.openid, categoryId, content, {
  ownerOpenid: user.openid,
  categoryId: 1,
  context: '贴文内容',
  image: imageUrl,
})
```

#### ⭐ 评分

```typescript
await addMark(user.openid, postId, 0, {
  ownerOpenid: user.openid,
  postId: 1,
  score: 5,  // 1-5分
  context: '评分说明',
})
```

#### 💬 评论

```typescript
await addComment(user.openid, markId, {
  ownerOpenid: user.openid,
  pid: markId,  // 评分ID
  context: '评论内容',
})
```

#### 👍 点赞

```typescript
await likePost(postId)      // 点赞贴文
await likeMark(markId)      // 点赞评分
await likeComment(commentId) // 点赞评论
```

### 查询操作

#### 查询贴文列表

```typescript
// 按分区查询
const posts = await pageQueryPostByCategoryId(categoryId, {
  ownerOpenid: '',
  categoryId,
  context: '',
})

// 查询我的贴文
const myPosts = await pageQueryPostByOpenId(user.openid, {
  ...user,
  pageNo: 1,
  pageSize: 10,
})
```

#### 查询评分列表

```typescript
const marks = await queryMarkByPostId(postId, {
  ownerOpenid: '',
  postId,
  score: 0,
})
```

#### 查询评论列表

```typescript
const comments = await pageQueryCommentByPid(markId, {
  ownerOpenid: '',
  pid: markId,
  context: '',
})
```

## 🎯 实战场景

### 场景1: 贴文列表页

```typescript
function PostList() {
  const [posts, setPosts] = useState([])
  const [categoryId, setCategoryId] = useState(1)

  useEffect(() => {
    const loadPosts = async () => {
      const data = await pageQueryPostByCategoryId(categoryId, {
        ownerOpenid: '',
        categoryId,
        context: '',
      })
      setPosts(data)
    }
    loadPosts()
  }, [categoryId])

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <p>{post.context}</p>
          <button onClick={() => likePost(post.id)}>
            点赞 {post.likeCount}
          </button>
        </div>
      ))}
    </div>
  )
}
```

### 场景2: 贴文详情页

```typescript
function PostDetail({ postId }) {
  const [post, setPost] = useState(null)
  const [marks, setMarks] = useState([])

  useEffect(() => {
    // 加载贴文
    queryPostById(postId, {
      ownerOpenid: '',
      categoryId: 0,
      context: '',
    }).then(setPost)

    // 加载评分
    queryMarkByPostId(postId, {
      ownerOpenid: '',
      postId,
      score: 0,
    }).then(setMarks)
  }, [postId])

  return (
    <div>
      <h1>{post?.context}</h1>
      <img src={post?.image} />

      {marks.map(mark => (
        <div key={mark.id}>
          <p>评分: {mark.score}⭐</p>
          <p>{mark.context}</p>
        </div>
      ))}
    </div>
  )
}
```

### 场景3: 评论区

```typescript
function CommentSection({ markId }) {
  const { user } = useAuthStore()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
    pageQueryCommentByPid(markId, {
      ownerOpenid: '',
      pid: markId,
      context: '',
    }).then(setComments)
  }, [markId])

  const handleSubmit = async () => {
    await addComment(user.openid, markId, {
      ownerOpenid: user.openid,
      pid: markId,
      context: text,
    })
    setText('')
    // 刷新列表
  }

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleSubmit}>发表</button>

      {comments.map(c => (
        <div key={c.id}>{c.context}</div>
      ))}
    </div>
  )
}
```

## 🔍 调试技巧

### 查看请求详情

```typescript
// 打开浏览器开发者工具 (F12)
// 切换到 Network 标签
// 点击任意请求查看：
// - Headers: 请求头（确认有 satoken）
// - Payload: 请求参数
// - Response: 服务器响应
```

### 添加日志

```typescript
const handleAction = async () => {
  console.log('📤 开始请求...')
  try {
    const result = await someApi()
    console.log('✅ 请求成功:', result)
  } catch (error) {
    console.error('❌ 请求失败:', error)
  }
}
```

### 检查认证状态

```typescript
// 在浏览器控制台运行
console.log(localStorage.getItem('auth-storage'))
```

## ⚠️ 常见问题

### 401 未授权
**原因**: 未登录或 token 失效
**解决**: 重新登录

### 参数错误
**原因**: 传递的参数不正确
**解决**:
1. 查看 Network 的 Payload
2. 对比 API 文档
3. 检查 TypeScript 类型

### 网络错误
**原因**: 后端不可达
**解决**:
1. 检查网络连接
2. 确认后端服务运行中
3. 重启开发服务器

## 📖 更多资料

- **完整总结**: 查看 `IMPLEMENTATION_SUMMARY.md`
- **调试指南**: 查看 `API_DEBUG_GUIDE.md`
- **项目文档**: 查看 `CLAUDE.md`

## 🎉 开始开发吧！

现在你已经掌握了所有新 API 的使用方法，可以开始开发你的业务功能了！

遇到问题？
1. 先查看浏览器控制台
2. 使用 /api-test 页面测试
3. 查看文档

祝开发顺利！💪
