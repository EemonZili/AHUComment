# 前后端联调指南

## 快速开始

### 1. 启动开发服务器

```bash
npm run dev
```

访问：`http://localhost:3000`

### 2. 使用API测试页面

登录后访问：`http://localhost:3000/api-test`

这个页面包含所有新接口的测试按钮，可以快速验证接口是否正常工作。

## 调试方法

### 方法1: 使用 API 测试页面（推荐新手）

1. 登录系统
2. 访问 `/api-test` 路由
3. 点击各个按钮测试不同的API
4. 查看浏览器控制台的输出（F12 → Console）
5. 查看页面显示的结果

**优点**：
- 界面友好，一键测试
- 自动处理认证和参数
- 实时查看结果

### 方法2: 使用浏览器开发者工具（推荐）

1. 打开浏览器控制台（F12）
2. 切换到 **Network** 标签页
3. 在页面中触发API调用（或在测试页面点击按钮）
4. 查看请求详情：
   - **Request URL**: 确认请求地址是否正确
   - **Request Method**: 确认是POST/GET
   - **Request Headers**: 查看是否有 `satoken` header
   - **Request Payload**: 查看发送的参数
   - **Response**: 查看服务器返回的数据

**示例查看步骤**：
```
Network → 选择请求 →
  - Headers: 查看请求头（确认有satoken）
  - Payload: 查看请求参数
  - Preview: 查看响应数据（格式化）
  - Response: 查看原始响应
```

### 方法3: 在控制台直接调用 API

打开浏览器控制台，直接运行代码：

```javascript
// 1. 导入需要的服务（在实际代码中使用）
// 这里在控制台中无法直接import，需要在页面代码中测试

// 2. 在 React 组件中测试
import { listPostCategories } from '@/services'

const testApi = async () => {
  try {
    const data = await listPostCategories()
    console.log('查询结果:', data)
  } catch (error) {
    console.error('错误:', error)
  }
}

testApi()
```

### 方法4: 使用 Postman/Apifox 测试（独立测试）

如果要绕过前端直接测试后端API：

1. 设置请求地址：`http://49.235.97.26/review/post/list`
2. 设置请求方法：`POST`
3. 添加 Header：
   ```
   satoken: your_token_here
   Content-Type: application/json
   ```
4. 设置 Body（如果需要）
5. 发送请求

**获取 token 的方法**：
- 在浏览器控制台运行：
  ```javascript
  localStorage.getItem('auth-storage')
  ```
- 从返回的JSON中找到 `state.token` 字段

## 常见问题排查

### 1. 401 未授权错误

**原因**：Token失效或未登录

**解决**：
- 检查是否已登录
- 查看 localStorage 中是否有 token
- 重新登录获取新 token

```javascript
// 控制台查看认证状态
console.log(localStorage.getItem('auth-storage'))
```

### 2. 404 接口不存在

**原因**：API路径错误或代理配置问题

**解决**：
- 检查 `vite.config.ts` 中的代理配置
- 确认API路径是否正确（/auth, /review, /post）
- 重启开发服务器

```bash
# 停止服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 3. 网络错误/超时

**原因**：后端服务器不可达

**解决**：
- 检查网络连接
- 确认后端服务器是否在运行
- 检查防火墙设置

```bash
# 测试后端是否可访问
curl http://49.235.97.26/auth/user/getUserInfo
```

### 4. CORS 跨域错误

**原因**：开发环境跨域配置问题

**解决**：
- 确认 Vite 代理配置正确
- 检查 `vite.config.ts` 中 `changeOrigin: true`
- 重启开发服务器

### 5. 参数错误

**原因**：传递的参数不符合后端要求

**解决**：
- 查看 Network 标签页的 Request Payload
- 对比 API 文档确认参数格式
- 检查类型定义（TypeScript）

## 调试技巧

### 1. 添加日志

在关键位置添加 console.log：

```typescript
export const addPost = async (ownerId: string, categoryId: number, context: string, data: PostDTO) => {
  console.log('📤 发送请求: addPost', { ownerId, categoryId, context, data })

  const result = await request.post<any, PostDTO>('/review/post/add', data, {
    params: { ownerId, categoryId, context },
  })

  console.log('📥 收到响应: addPost', result)
  return result
}
```

### 2. 使用 React DevTools

安装 React DevTools 浏览器插件，可以：
- 查看组件树
- 查看 State 和 Props
- 查看 Zustand Store 状态

### 3. 检查请求拦截器

在 `src/utils/request.ts` 中添加日志：

```typescript
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    console.log('🚀 发送请求:', config.url, config)
    // ... 其他代码
  }
)

request.interceptors.response.use(
  (response) => {
    console.log('✅ 收到响应:', response.config.url, response.data)
    // ... 其他代码
  },
  (error) => {
    console.error('❌ 请求失败:', error.config?.url, error)
    // ... 其他代码
  }
)
```

### 4. 模拟数据测试

如果后端暂时不可用，可以先用模拟数据：

```typescript
// 在服务函数中临时返回模拟数据
export const listPostCategories = async () => {
  // return request.post<any, PostCategoryDTO[]>('/postCategory/list')

  // 临时模拟数据
  return [
    { id: 1, categoryName: '美食', color: '#ff0000', status: 1 },
    { id: 2, categoryName: '学习', color: '#00ff00', status: 1 },
  ]
}
```

## 完整测试流程示例

### 测试发布贴文功能

```typescript
// 1. 在页面组件中
import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { addPost, uploadPostPicture } from '@/services'

function CreatePost() {
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      console.log('📤 开始上传图片...')
      const url = await uploadPostPicture(file)
      console.log('✅ 图片上传成功:', url)
      setImageUrl(url)
      alert('图片上传成功！')
    } catch (error) {
      console.error('❌ 图片上传失败:', error)
      alert('图片上传失败')
    }
  }

  const handleSubmit = async () => {
    try {
      console.log('📤 开始发布贴文...', { content, imageUrl })

      const result = await addPost(
        user?.openid || '',
        1, // 分区ID
        content,
        {
          ownerOpenid: user?.openid || '',
          categoryId: 1,
          context: content,
          image: imageUrl,
        }
      )

      console.log('✅ 贴文发布成功:', result)
      alert('发布成功！')
    } catch (error) {
      console.error('❌ 贴文发布失败:', error)
      alert('发布失败')
    }
  }

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="输入内容..."
      />
      <input type="file" onChange={handleImageUpload} />
      <button onClick={handleSubmit}>发布</button>
    </div>
  )
}
```

## API 文档快速参考

### 贴文分区 (postCategory)
- `POST /review/postCategory/list` - 查询所有分区
- `POST /review/postCategory/add?categoryName=xxx` - 新增分区
- `POST /review/postCategory/update?id=xxx` - 更新分区
- `POST /review/postCategory/delete?id=xxx` - 删除分区

### 贴文 (post)
- `POST /review/post/add?ownerId=xxx&categoryId=xxx&context=xxx` - 新增贴文
- `POST /review/post/update?id=xxx` - 更新贴文
- `POST /review/post/queryById?id=xxx` - 查询贴文
- `POST /review/post/pageQueryByOpenId?openid=xxx` - 查询用户贴文
- `POST /review/post/like?id=xxx` - 点赞贴文
- `POST /post/uploadPicture` - 上传图片（FormData）

### 评分 (mark)
- `POST /review/mark/add?ownerId=xxx&postId=xxx&pid=xxx` - 新增评分
- `POST /review/mark/update?id=xxx` - 更新评分
- `POST /review/mark/queryByPostId?postId=xxx` - 查询贴文评分
- `POST /review/mark/like?id=xxx` - 点赞评分

### 评论 (comment)
- `POST /review/comment/add?ownerId=xxx&pid=xxx` - 新增评论
- `POST /review/comment/update?id=xxx` - 更新评论
- `POST /review/comment/pageQueryByPid?pid=xxx` - 查询评分的评论
- `POST /review/comment/like?id=xxx` - 点赞评论

## 注意事项

1. **所有请求都需要认证**：确保已登录并且 token 有效
2. **ID 参数**：测试时需要使用真实存在的 ID
3. **参数格式**：部分参数在 query string，部分在 request body
4. **图片上传**：使用 FormData，字段名为 `picture`
5. **响应格式**：统一为 `{ success, code, message, data }`

## 下一步

完成接口联调后，你可以：
1. 开始开发实际的业务页面
2. 集成到现有的 ReviewList、ReviewDetail 等页面
3. 添加错误处理和加载状态
4. 优化用户体验（loading、toast提示等）

祝调试顺利！🎉
