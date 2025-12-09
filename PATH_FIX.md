# 路径修复说明

## 🔧 问题

之前的实现错误地将所有新接口路径加上了 `/auth` 前缀，导致请求路径不正确。

**错误示例**：
```
请求: /auth/review/post/add  ❌ 错误
应该: /review/post/add       ✅ 正确
```

## ✅ 解决方案

创建了专用的 request 实例：

### 1. reviewRequest (src/utils/reviewRequest.ts)
- **baseURL**: `/review`
- **用途**: 处理所有评论系统相关的接口
- **包含**: 贴文、贴文分区、评分、评论等接口

### 2. postRequest (src/utils/postRequest.ts)
- **baseURL**: `/post`
- **用途**: 处理图片上传下载
- **包含**: uploadPicture、downloadPicture

### 3. request (src/utils/request.ts)
- **baseURL**: `/auth`
- **用途**: 处理用户认证相关接口
- **包含**: 登录、用户管理、角色权限等

## 📝 更新的文件

### 新增文件
- ✅ `src/utils/reviewRequest.ts` - Review API 专用请求实例
- ✅ `src/utils/postRequest.ts` - 图片上传专用请求实例

### 修改的服务文件
- ✅ `src/services/postCategory.ts` - 使用 reviewRequest
- ✅ `src/services/post.ts` - 使用 reviewRequest 和 postRequest
- ✅ `src/services/mark.ts` - 使用 reviewRequest
- ✅ `src/services/comment.ts` - 使用 reviewRequest

## 🎯 正确的请求路径

### 贴文分区 API
```
POST /review/postCategory/list
POST /review/postCategory/add
POST /review/postCategory/update
POST /review/postCategory/delete
```

### 贴文 API
```
POST /review/post/add
POST /review/post/update
POST /review/post/delete
POST /review/post/queryById
POST /review/post/pageQueryByOpenId
POST /review/post/pageQueryByCategoryId
POST /review/post/like
POST /review/post/queryLikes
```

### 评分 API
```
POST /review/mark/add
POST /review/mark/update
POST /review/mark/delete
POST /review/mark/queryById
POST /review/mark/queryByPostId
POST /review/mark/pageQueryByOpenId
POST /review/mark/like
POST /review/mark/queryLikes
```

### 评论 API
```
POST /review/comment/add
POST /review/comment/update
POST /review/comment/delete
POST /review/comment/pageQueryByOpenId
POST /review/comment/pageQueryByPid
POST /review/comment/like
POST /review/comment/queryLikes
```

### 图片上传 API
```
POST /post/uploadPicture
POST /post/downloadPicture
```

## 🔍 代理配置 (vite.config.ts)

```typescript
proxy: {
  '/auth': {
    target: 'http://49.235.97.26',
    changeOrigin: true,
  },
  '/review': {
    target: 'http://49.235.97.26',
    changeOrigin: true,
  },
  '/post': {
    target: 'http://49.235.97.26',
    changeOrigin: true,
  },
}
```

## 🚀 使用示例

### 之前（错误）
```typescript
import request from '@/utils/request'

// 这会请求 /auth/review/post/add ❌
export const addPost = (data) => {
  return request.post('/review/post/add', data)
}
```

### 现在（正确）
```typescript
import reviewRequest from '@/utils/reviewRequest'

// 这会请求 /review/post/add ✅
export const addPost = (data) => {
  return reviewRequest.post('/post/add', data)
}
```

## ⚠️ 注意事项

1. **不要混用 request 实例**
   - 认证相关 → 使用 `request`
   - 评论系统 → 使用 `reviewRequest`
   - 图片上传 → 使用 `postRequest`

2. **路径不要重复前缀**
   ```typescript
   // ❌ 错误 - 会变成 /review/review/post/add
   reviewRequest.post('/review/post/add', data)

   // ✅ 正确 - 最终是 /review/post/add
   reviewRequest.post('/post/add', data)
   ```

3. **所有请求自动添加认证 header**
   - 三个 request 实例都配置了相同的拦截器
   - 自动添加 `satoken` header
   - 自动处理 401 错误

## ✨ 现在可以正常使用了！

所有接口路径已经修正，可以直接进行联调测试了。

访问测试页面：`http://localhost:3000/api-test`
