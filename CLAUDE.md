# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 React 18 + TypeScript + Vite 的校园点评系统前端应用,后端使用 Java Spring Boot。

**技术栈:**
- React 18.2 + TypeScript 5.2
- Vite 5.1 (构建工具)
- Zustand 4.5 (状态管理)
- React Router 6.22 (路由)
- Axios 1.6 (HTTP 客户端)
- Lucide React (图标库)
- CSS Modules (样式方案)

**后端服务器:** http://49.235.97.26

## 开发命令

### 常用命令
```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:3000)
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 项目架构

### 核心架构模式

本项目采用经典的分层架构:

```
UI层 (Pages/Components)
    ↓
业务逻辑层 (Custom Hooks/Services)
    ↓
数据访问层 (API Services/Request)
    ↓
后端 API (Java Spring Boot)
```

### 目录结构说明

```
src/
├── components/          # 通用UI组件(Button, Input, Loading, Modal, AdminLayout)
├── pages/              # 页面组件
│   ├── Login/          # 登录页面(微信扫码)
│   ├── Profile/        # 个人中心
│   ├── ReviewList/     # 点评列表
│   ├── ReviewDetail/   # 点评详情
│   ├── PlaceList/      # 地点列表
│   ├── PlaceDetail/    # 地点详情
│   ├── ReviewCreate/   # 发布点评
│   └── admin/          # 管理后台(Users/Roles/Permissions)
├── services/           # API服务层(封装HTTP请求)
│   ├── user.ts         # 用户API
│   ├── role.ts         # 角色API
│   ├── permission.ts   # 权限API
│   ├── rolePermission.ts # 角色权限API
│   ├── review.ts       # 点评API
│   ├── place.ts        # 地点API
│   ├── comment.ts      # 评论API
│   └── interaction.ts  # 互动API
├── store/              # Zustand状态管理
│   ├── auth.ts         # 认证状态(token, user)
│   ├── user.ts         # 用户状态
│   ├── role.ts         # 角色状态
│   └── permission.ts   # 权限状态
├── utils/              # 工具函数
│   ├── request.ts      # Axios实例配置(拦截器)
│   └── websocket.ts    # WebSocket客户端(登录二维码)
├── types/              # TypeScript类型定义
│   └── index.ts        # 所有DTO类型
├── router/             # 路由配置
│   └── index.tsx       # 路由定义和路由守卫
└── styles/             # 全局样式(CSS变量)
```

### 关键架构概念

#### 1. 认证流程

本项目使用微信扫码登录 + SaToken认证:

```typescript
// 登录流程
1. 前端调用 getQR(sid) 获取二维码
2. WebSocket连接 ws://49.235.97.26/ws/login/{sid}
3. 用户扫码后,WebSocket推送openId
4. 前端调用 doLogin(openId, sid) 获取token
5. Token存储在Zustand store并持久化到localStorage
6. 后续所有请求自动在header中添加 'satoken: {token}'
```

#### 2. 状态管理策略

使用Zustand进行全局状态管理,关键store:

- **auth.ts**: 认证状态(token, user, isAuthenticated)
  - `setToken(token)` - 设置token
  - `setUser(user)` - 设置用户信息
  - `logout()` - 退出登录(清除token和user)

#### 3. API调用规范

所有API调用必须通过 `src/services/` 中的服务函数:

```typescript
// services/user.ts
import request from '@/utils/request'
import type { AuthUserDTO } from '@/types'

export const getUserInfo = (openid: string) => {
  return request.post<any, AuthUserDTO>('/user/getUserInfo', { openid })
}
```

**重要**:
- 所有API路径自动添加 `/auth` 前缀(由Vite代理配置)
- 响应拦截器自动处理错误和提取data字段
- 401错误会自动退出登录并跳转到登录页

#### 4. 路由守卫

项目实现了两级路由保护:

- **ProtectedRoute**: 需要登录(检查 isAuthenticated)
- **AdminRoute**: 需要管理员权限(检查 user?.isAdmin)

## API文档规范

后端API遵循OpenAPI 3.0规范,基础路径为 `/auth`。

**关键接口:**

**用户管理:**
- `POST /user/getQR?sid={sid}` - 获取登录二维码
- `POST /user/doLogin?openId={openId}&sid={sid}` - 用户登录
- `POST /user/getUserInfo` - 获取用户信息
- `POST /user/update` - 更新用户信息
- `POST /user/changeStatus` - 启用/禁用用户

**角色权限:**
- `POST /role/list` - 查询所有角色
- `POST /role/add` - 新增角色
- `POST /permission/list` - 查询所有权限
- `POST /rolePermission/add` - 分配角色权限

**统一响应格式:**
```typescript
interface ApiResponse<T> {
  success: boolean    // 请求成功标识
  code: number        // 状态码(200成功)
  message: string     // 响应消息
  data: T            // 响应数据
}
```

## UI设计规范

### 设计系统

**颜色:**
- 主色: `#2E4A85` (安徽大学深蓝色)
- 辅助色: `#D4AF37` (学术金)

**字体:**
- 标题: Plus Jakarta Sans
- 正文: Inter
- 等宽: JetBrains Mono

**间距:** 基于4px网格,使用CSS变量系统

### 设计原型图

所有设计原型图位于 `.superdesign/design_iterations/` 目录:

- `login_ahu_1.html` - 登录页面设计
- `admin_users_1.html` - 用户管理页面
- `review_list_1.html` - 评论列表页面
- `review_detail_1.html` - 评论详情页面
- `profile_1.html` - 用户个人中心
- `theme_ahu.css` - 主题色彩系统

**重要原则:**
1. 严格按照设计原型实现已设计的页面
2. 新页面需遵循现有设计风格和视觉规范
3. 确保响应式设计(使用clamp()等CSS函数)

## 开发工作流

### 添加新页面

1. **创建页面组件**
```bash
src/pages/NewPage/
  ├── index.tsx
  └── NewPage.module.css
```

2. **定义类型** (在 `src/types/index.ts`)
```typescript
export interface NewDataDTO {
  id: string
  name: string
}
```

3. **创建API服务** (在 `src/services/`)
```typescript
export const getNewData = (id: string) => {
  return request.post<any, NewDataDTO>('/new/getData', { id })
}
```

4. **添加路由** (在 `src/router/index.tsx`)
```typescript
<Route path="/new" element={
  <ProtectedRoute>
    <NewPage />
  </ProtectedRoute>
} />
```

### 表单处理规范

```typescript
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
})

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }))
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await submitData(formData)
    // 处理成功
  } catch (error) {
    // 处理错误
  }
}
```

## 重要约定

### React最佳实践

1. **State不可变性**: 永远使用 `setState()` 而非直接修改
```typescript
// ❌ 错误
user.name = 'new name'

// ✅ 正确
setUser({ ...user, name: 'new name' })
```

2. **useEffect依赖**: 正确声明依赖数组
```typescript
// ✅ 只在组件挂载时执行一次
useEffect(() => {
  fetchData()
}, [])

// ✅ userId变化时重新执行
useEffect(() => {
  fetchUser(userId)
}, [userId])
```

3. **事件处理**: 使用箭头函数或函数引用
```typescript
// ✅ 正确
<button onClick={() => handleClick(id)}>Click</button>
<button onClick={handleClick}>Click</button>
```

### TypeScript规范

- 为所有Props定义接口
- 为所有API返回值定义类型
- 尽量避免使用 `any`
- 使用严格模式(`strict: true`)

### 样式规范

- 使用CSS Modules避免样式冲突
- 使用CSS变量(`src/styles/index.css`)
- 遵循响应式设计原则
- 命名采用camelCase(如 `className={styles.userCard}`)

## 常见问题

### 路径别名

项目配置了路径别名(见 `vite.config.ts`):

```typescript
import Button from '@/components/Button'
import { getUserInfo } from '@/services/user'
import { useAuthStore } from '@/store/auth'
import type { AuthUserDTO } from '@/types'
```

### WebSocket连接

登录时需要使用WebSocket监听扫码状态:

```typescript
const ws = new WebSocket(`ws://49.235.97.26/ws/login/${sid}`)
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // 处理消息(openId, status等)
}
```

### Token管理

Token通过Zustand自动持久化:

```typescript
// 获取token
const token = useAuthStore(state => state.token)

// 设置token
useAuthStore.getState().setToken(newToken)

// 请求拦截器自动添加header: 'satoken: {token}'
```

## 调试技巧

1. **React DevTools**: Chrome插件,查看组件树和state
2. **Network面板**: 检查API请求和响应
3. **Console日志**: useEffect中打印state变化
4. **断点调试**: 代码中添加 `debugger` 语句

## 参考资源

- [React官方文档(中文)](https://zh-hans.react.dev/)
- [TypeScript官方文档](https://www.typescriptlang.org/zh/)
- [Vite官方文档](https://cn.vitejs.dev/)
- [Zustand文档](https://github.com/pmndrs/zustand)
- 项目详细开发指南: `PROJECT_GUIDE.md`
