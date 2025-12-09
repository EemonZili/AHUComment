这是一份为您定制的中文版指南，专门为熟悉 Java/Spring 后端的开发者编写，旨在帮助您利用已有的后端知识体系，快速掌握 AHU 校园点评项目的 React + TypeScript 前端开发。

-----

# AHU 校园点评项目开发指南

> **目标受众**: 具备 HTML/CSS/JS 基础且有丰富后端经验的开发者
> **技术栈**: React + TypeScript
> **预计学习时间**: 2-3 天

-----

## 目录

  - [第一章：前后端概念对照](https://www.google.com/search?q=%23%E7%AC%AC%E4%B8%80%E7%AB%A0%E5%89%8D%E5%90%8E%E7%AB%AF%E6%A6%82%E5%BF%B5%E5%AF%B9%E7%85%A7)
  - [第二章：项目架构](https://www.google.com/search?q=%23%E7%AC%AC%E4%BA%8C%E7%AB%A0%E9%A1%B9%E7%9B%AE%E6%9E%B6%E6%9E%84)
  - [第三章：核心技术](https://www.google.com/search?q=%23%E7%AC%AC%E4%B8%89%E7%AB%A0%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF)
  - [第四章：代码实战解析](https://www.google.com/search?q=%23%E7%AC%AC%E5%9B%9B%E7%AB%A0%E4%BB%A3%E7%A0%81%E5%AE%9E%E6%88%98%E8%A7%A3%E6%9E%90)
  - [第五章：开发流程](https://www.google.com/search?q=%23%E7%AC%AC%E4%BA%94%E7%AB%A0%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B)
  - [第六章：最佳实践](https://www.google.com/search?q=%23%E7%AC%AC%E5%85%AD%E7%AB%A0%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5)

-----

## 第一章：前后端概念对照

### 1.1 核心概念

**后端 (Java/Spring):**

```java
@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/user/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getById(id);
    }
}
```

**前端 (React + TypeScript):**

```typescript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])

  return <div>{user?.name}</div>
}
```

**主要区别:**

  - **后端**: 请求驱动 (Request-driven)，无状态 (Stateless)，处理业务逻辑
  - **前端**: 事件驱动 (Event-driven)，有状态 (Stateful)，处理 UI 渲染

[Image of frontend vs backend architecture diagram]

### 1.2 概念映射表

| 后端概念 (Spring) | 前端对应概念 (React) | 用途 |
|----------------|---------------------|---------|
| Controller (控制器) | Component (组件) | 处理请求/事件，返回视图 |
| Service Layer (服务层) | Custom Hooks (自定义 Hook) | 封装业务逻辑 |
| DAO Layer (持久层) | API Services (API 服务) | 数据访问/HTTP 请求 |
| Entity Class (实体类) | Interface/Type (接口/类型) | 数据结构定义 |
| Spring Container (容器) | React Context (上下文) | 全局状态/依赖注入 |
| AOP (切面) | Higher-Order Component (高阶组件) | 横切关注点 (如权限校验) |
| Filter (过滤器) | Axios Interceptor (拦截器) | 请求/响应拦截 |
| Session (会话) | LocalStorage + State | 会话数据存储 |
| Async Task (异步任务) | Promise (async/await) | 异步操作 |
| Lifecycle Methods (@PostConstruct) | useEffect Hook | 生命周期/副作用 |

### 1.3 数据流向

**后端流程:**

```
客户端 -> Controller -> Service -> DAO -> 数据库
               |
             DTO/VO
               |
              响应
```

**前端流程 (React):**

```
用户交互 -> 事件处理 -> 状态更新 (State) -> 重新渲染 (Re-render)
                           |
                        API 调用
                           |
                          后端
```

-----

## 第二章：项目架构

[Image of React project directory structure]

### 2.1 目录结构

```
src/
├── components/          # 通用组件 (类似 Common Utils/Components)
│   ├── Button/         # 按钮组件
│   ├── Input/          # 输入框组件
│   ├── Loading/        # 加载中组件
│   ├── Modal/          # 弹窗组件
│   └── AdminLayout/    # 管理后台布局组件
│
├── pages/              # 页面组件 (类似 Controller 层，处理页面级逻辑)
│   ├── Login/          # 登录页
│   ├── Profile/        # 个人中心
│   ├── ReviewList/     # 点评列表页
│   ├── ReviewDetail/   # 点评详情页
│   ├── PlaceList/      # 地点列表页
│   ├── PlaceDetail/    # 地点详情页
│   ├── ReviewCreate/   # 发布点评页
│   └── admin/          # 后台管理页面
│       ├── Users/      # 用户管理
│       ├── Roles/      # 角色管理
│       └── Permissions/# 权限管理
│
├── services/           # API 服务 (类似 Service 层)
│   ├── user.ts         # 用户相关 API
│   ├── review.ts       # 点评相关 API
│   ├── place.ts        # 地点相关 API
│   ├── comment.ts      # 评论相关 API
│   └── interaction.ts  # 互动相关 API
│
├── store/              # 状态管理 (类似 Cache/Session 层)
│   └── auth.ts         # 认证状态存储
│
├── types/              # TypeScript 类型定义 (类似 Entity/DTO 类)
│   └── index.ts        # 所有类型定义汇总
│
├── utils/              # 工具类
│   ├── request.ts      # HTTP 客户端 (类似 HttpClient 配置)
│   └── websocket.ts    # WebSocket 客户端
│
├── router/             # 路由配置 (类似 Spring MVC 的 URL Mapping)
│   └── index.tsx       # 路由定义
│
└── styles/             # 全局样式
    ├── variables.css   # CSS 变量
    └── global.css      # 全局样式重置
```

### 2.2 架构分层

```
┌─────────────────────────────────────┐
│          UI 层 (视图层)              │
│      Components + Pages (*.tsx)     │
│      对应: View + Controller        │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│          业务逻辑层                  │
│     Custom Hooks + Services         │
│         对应: Service Layer         │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│           数据访问层                 │
│     API Services (request.ts)       │
│         对应: DAO Layer             │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│           后端 API                   │
│         (Java Backend)              │
└─────────────────────────────────────┘
```

-----

## 第三章：核心技术

### 3.1 React 概念

#### 3.1.1 组件 (Component) = 前端的 "类"

**后端 Class:**

```java
public class UserCard {
    private String name;
    private String avatar;

    public String render() {
        return "<div>" + name + "</div>";
    }
}
```

**React Component:**

```typescript
// Props 定义
interface UserCardProps {
  name: string
  avatar: string
}

function UserCard({ name, avatar }: UserCardProps) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <span>{name}</span>
    </div>
  )
}
```

**核心区别:**

1.  **Props (属性)**: 像函数参数一样传递给组件的数据（只读）。
2.  **State (状态)**: 组件内部的数据，变化时会触发重新渲染。
3.  **JSX**: HTML 和 JavaScript 的混合语法。

#### 3.1.2 State = 类的实例变量

**后端:**

```java
public class Counter {
    private int count = 0;  // 实例变量

    public void increment() {
        count++;  // 直接修改
    }
}
```

**React:**

```typescript
function Counter() {
  const [count, setCount] = useState(0)  // State Hook

  function increment() {
    setCount(count + 1)  // 必须通过 Setter 更新
  }

  return <button onClick={increment}>Count: {count}</button>
}
```

**为什么要用 Setter 而不是直接修改？**

  - React 需要监控数据变化以触发 UI 更新（Re-render）。
  - 直接写 `count = count + 1` 只是改了变量，React 不知道，界面不会变。
  - 必须调用 `setCount()` 通知 React。

#### 3.1.3 useEffect = 生命周期方法

**后端 Spring Bean:**

```java
@Component
public class DataService {
    @PostConstruct  // Bean 创建后执行
    public void init() {
        loadData();
    }

    @PreDestroy  // Bean 销毁前执行
    public void cleanup() {
        closeConnections();
    }
}
```

**React useEffect:**

```typescript
function DataDisplay() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // 组件挂载后执行 (类似 @PostConstruct)
    loadData().then(setData)

    // 清理函数 (类似 @PreDestroy)
    return () => {
      cleanup()
    }
  }, [])  // 空数组依赖：只在挂载时运行一次

  return <div>{data}</div>
}
```

**useEffect 依赖项 (Dependencies):**

```typescript
useEffect(() => {
  fetchUser(userId)
}, [userId])  // 当 userId 变化时重新运行

// 后端类比:
// 监听 userId 变量，当它改变时自动调用 fetchUser()
```

### 3.2 TypeScript = Java 类型系统

TypeScript 提供了类似 Java 的类型安全：

```typescript
// Java                          // TypeScript
public class User {              interface User {
    private String name;             name: string
    private int age;                 age: number
    private List<String> tags;       tags: string[]
}                                }

// 集合类型
List<User> users;                User[]
Map<String, User> userMap;       Record<string, User>
Optional<User> maybeUser;        User | null

// 函数定义
public User getUser(Long id) {   function getUser(id: number): User {
    ...                              ...
}                                }
```

### 3.3 Zustand = 后端缓存/Session

**为什么要用全局状态 (Global State)?**: 为了在不同组件间共享数据。

**后端方式:**

```java
// 用户 Session 存储在 Redis 或 HttpSession
// 所有 Controller 都能访问
@GetMapping("/profile")
public User getProfile(HttpSession session) {
    return session.getAttribute("user");
}
```

**前端 Zustand:**

```typescript
// 定义 Store (类似定义 Session 结构)
interface AuthStore {
  user: User | null
  token: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
}))

// 在组件中使用 (类似获取 Session)
function ProfilePage() {
  const user = useAuthStore(state => state.user)  // 读取
  const setUser = useAuthStore(state => state.setUser)  // 写入

  return <div>{user?.name}</div>
}
```

**Zustand vs Redux:**

  - Zustand 就像 Redis (简单、直接)。
  - Redux 就像配置繁琐的 Spring Security + Session (结构重、样板代码多)。

### 3.4 Axios = RestTemplate/HttpClient

**后端 HTTP 请求:**

```java
RestTemplate restTemplate = new RestTemplate();
User user = restTemplate.getForObject(
    "https://api.example.com/user/1",
    User.class
);
```

**前端 Axios:**

```typescript
const user = await axios.get<User>('https://api.example.com/user/1')
```

**请求拦截器 (类似 Filter):**

```typescript
// 自动在所有请求头中添加 Token
axios.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 全局错误处理
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      redirectToLogin()
    }
    return Promise.reject(error)
  }
)
```

-----

## 第四章：代码实战解析

### 4.1 示例：用户管理页面 (Admin Users Page)

让我们逐行分析 `src/pages/admin/Users/index.tsx`：

```typescript
// ===== 第一步: 引入依赖 =====
import { useState, useEffect } from 'react'
// useState: 管理组件状态 (类似实例变量)
// useEffect: 处理副作用 (类似生命周期方法)

import { useNavigate } from 'react-router-dom'
// useNavigate: 路由跳转工具 (类似 redirect)

import { Users, UserCheck, Edit2, Trash2 } from 'lucide-react'
// 图标组件

import { getUserList, changeUserStatus, deleteUser } from '@/services/user'
// API 调用函数 (类似调用 Service 层)

import { AdminLayout, Loading } from '@/components'
// 通用组件

import type { AuthUserDTO, UserListParams } from '@/types'
// 类型定义 (类似 Entity 类)

import styles from './Users.module.css'
// CSS 模块 (局部样式)

// ===== 第二步: 定义组件 =====
export default function AdminUsers() {
  // ===== 第三步: 初始化状态 (类似实例变量) =====
  const [users, setUsers] = useState<AuthUserDTO[]>([])
  // users: 用户列表数据
  // setUsers: 更新 users 的函数

  const [loading, setLoading] = useState(true)
  // loading: 加载状态

  const [currentPage, setCurrentPage] = useState(1)
  // currentPage: 当前页码

  const [total, setTotal] = useState(0)
  // total: 总记录数

  // ===== 第四步: 定义功能函数 (类似类方法) =====
  const fetchUsers = async () => {
    setLoading(true)  // 开始加载
    try {
      const params: UserListParams = {
        pageNum: currentPage,
        pageSize: 10,
      }

      // 调用 API (类似调用 Service)
      const response = await getUserList(params)

      // 更新状态 (类似赋值给实例变量)
      setUsers(response.list || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      alert('加载用户失败')
    } finally {
      setLoading(false)  // 结束加载
    }
  }

  // ===== 第五步: 副作用 Hook (类似生命周期) =====
  useEffect(() => {
    fetchUsers()  // 组件挂载时加载数据
  }, [currentPage])  // 当 currentPage 变化时重新运行

  // 后端类比:
  // @PostConstruct
  // public void init() { fetchUsers(); }
  // 并且监听 currentPage，变了就再调一次

  // ===== 第六步: 事件处理函数 =====
  const handleDeleteUser = async (user: AuthUserDTO) => {
    if (!window.confirm(`确认删除用户 "${user.nickname}"?`)) {
      return
    }

    try {
      await deleteUser(user.openid)
      alert('用户已删除')
      fetchUsers()  // 刷新列表
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('删除失败')
    }
  }

  // ===== 第七步: 渲染 UI (类似 Return View) =====
  return (
    <AdminLayout>  {/* 布局包裹 */}
      {loading ? (
        <Loading />  {/* 显示加载中 */}
      ) : (
        <table>
          <thead>
            <tr>
              <th>用户名</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (  /* 循环渲染列表 */
              <tr key={user.openid}>  {/* key 帮助 React 优化性能 */}
                <td>{user.nickname}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user)}>
                    {/* onClick 绑定事件 */}
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  )
}
```

**执行流程:**

```
1. 用户访问页面
   ↓
2. 初始化所有 State (useState)
   ↓
3. 运行 useEffect
   ↓
4. 调用 fetchUsers()
   ↓
5. 发送 HTTP 请求
   ↓
6. 收到响应，调用 setUsers()
   ↓
7. 状态更新，触发重新渲染 (Re-render)
   ↓
8. 组件函数再次运行，读取新的 State 值
   ↓
9. 生成新的 UI HTML
```

### 4.2 API 服务配置: request.ts

```typescript
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

// 创建 axios 实例 (类似配置 RestTemplate)
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://49.235.97.26',
  timeout: 10000,
})

// 请求拦截器 (类似 Filter.doFilter)
request.interceptors.request.use(
  (config) => {
    // 添加 Token (类似鉴权)
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers['satoken'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 (类似 GlobalExceptionHandler)
request.interceptors.response.use(
  (response) => {
    // 统一处理响应结构
    const { data } = response
    if (data.success === false) {
      throw new Error(data.message || '请求失败')
    }
    return data.data  // 直接返回数据部分
  },
  (error) => {
    // 处理 HTTP 错误状态码
    if (error.response?.status === 401) {
      // 未登录，跳转到登录页
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default request
```

**后端类比:**

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception e) {
        return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
    }
}
```

### 4.3 路由配置: router/index.tsx

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'

// 路由守卫 (类似 Interceptor)
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />  // 强制跳转登录
  }

  return <>{children}</>
}

export default function AppRouter() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<Login />} />

      {/* 受保护路由 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ReviewList />
          </ProtectedRoute>
        }
      />

      {/* 嵌套路由 */}
      <Route path="/admin">
        <Route path="users" element={<AdminUsers />} />
        <Route path="roles" element={<AdminRoles />} />
      </Route>
    </Routes>
  )
}
```

-----

## 第五章：开发流程

### 5.1 如何添加一个新页面

**第一步：创建页面结构**

```bash
src/pages/MyNewPage/
  ├── index.tsx        # 主组件
  └── MyNewPage.module.css  # 样式文件
```

**第二步：编写组件代码**

```typescript
// src/pages/MyNewPage/index.tsx
import { useState, useEffect } from 'react'
import styles from './MyNewPage.module.css'

export default function MyNewPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // 加载数据
    fetchData().then(setData)
  }, [])

  return (
    <div className={styles.container}>
      <h1>我的新页面</h1>
      {data && <div>{data.title}</div>}
    </div>
  )
}
```

**第三步：添加路由**

```typescript
// src/router/index.tsx
import MyNewPage from '@/pages/MyNewPage'

<Route path="/my-new-page" element={<MyNewPage />} />
```

**第四步：添加跳转入口**

```typescript
import { useNavigate } from 'react-router-dom'

function SomeComponent() {
  const navigate = useNavigate()

  return (
    <button onClick={() => navigate('/my-new-page')}>
      跳转到新页面
    </button>
  )
}
```

### 5.2 如何调用后端 API

**第一步：定义类型**

```typescript
// src/types/index.ts
export interface MyDataDTO {
  id: string
  name: string
  count: number
}
```

**第二步：创建 API 服务**

```typescript
// src/services/myService.ts
import request from '@/utils/request'
import type { MyDataDTO } from '@/types'

export const getMyData = (id: string) => {
  return request.get<any, MyDataDTO>(`/my-api/${id}`)
}

export const createMyData = (data: MyDataDTO) => {
  return request.post<any, MyDataDTO>('/my-api', data)
}
```

**第三步：在组件中使用**

```typescript
import { useState, useEffect } from 'react'
import { getMyData } from '@/services/myService'

function MyComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getMyData('123')
      .then(setData)
      .catch(error => {
        console.error('API call failed:', error)
        alert('加载失败')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>加载中...</div>
  if (!data) return <div>无数据</div>

  return <div>{data.name}</div>
}
```

### 5.3 表单处理

```typescript
function MyForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    age: 0,
  })

  // 通用的变更处理函数
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,  // 保留其他字段
      [name]: value  // 更新当前字段
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()  // 阻止表单默认提交行为 (页面刷新)

    try {
      await submitForm(formData)
      alert('提交成功')
    } catch (error) {
      alert('提交失败')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="用户名"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="邮箱"
      />
      <button type="submit">提交</button>
    </form>
  )
}
```

-----

## 第六章：最佳实践

### 6.1 常见错误

#### 错误 1: 直接修改 State

**错误写法:**

```typescript
const [user, setUser] = useState({ name: 'Alice' })

// 错误: 直接修改对象属性
user.name = 'Bob'

// 错误: 修改了但没触发更新
user.name = 'Bob'
console.log(user)  // { name: 'Bob' }
// 但 UI 界面不会变！
```

**正确写法:**

```typescript
// 创建新对象
setUser({ ...user, name: 'Bob' })

// 或者使用函数式更新
setUser(prev => ({ ...prev, name: 'Bob' }))
```

**原因**: React 通过比较对象引用来检测变化，直接修改属性不改变引用，React 认为数据没变。

#### 错误 2: useEffect 死循环

**错误写法:**

```typescript
const [data, setData] = useState([])

useEffect(() => {
  fetchData().then(setData)
}, [data])  // 错误: 依赖了 data，但内部又调用 setData 修改 data -> 无限循环
```

**正确写法:**

```typescript
useEffect(() => {
  fetchData().then(setData)
}, [])  // 空数组: 只在挂载时执行一次
```

#### 错误 3: 事件绑定的 `this` 问题

**错误写法:**

```typescript
<button onClick={this.handleClick}>  {/* 函数组件没有 this */}
```

**正确写法:**

```typescript
// 写法 1: 箭头函数
<button onClick={() => handleClick()}>

// 写法 2: 直接引用
<button onClick={handleClick}>

// 写法 3: 传参
<button onClick={() => handleClick(id)}>
```

### 6.2 性能优化

#### 1\. 避免不必要的重渲染 (memo)

```typescript
import { memo } from 'react'

// 使用 memo 包裹组件
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // 只有当 props.data 发生变化时，才会重新渲染
  return <div>{/* 复杂的渲染逻辑 */}</div>
})
```

#### 2\. 缓存计算结果 (useMemo)

```typescript
import { useMemo } from 'react'

function DataList({ items }) {
  // 缓存计算结果
  const expensiveItems = useMemo(() => {
    return items.filter(item => {
      // 耗时操作
      return item.price > 100
    })
  }, [items])  // 仅当 items 变化时重新计算

  return <div>{expensiveItems.map(...)}</div>
}
```

### 6.3 编码规范

#### 1\. 组件拆分

  - **原则**: 单一职责。
  - **限制**: 组件代码建议不超过 200 行。
  - **做法**: 将大组件拆分为 `UserInfo`, `ReviewList`, `CommentSection` 等小组件。

#### 2\. 命名规范

  - **组件**: PascalCase (如 `UserProfile`)
  - **函数**: camelCase (如 `handleClick`, `fetchData`)
  - **布尔值**: `is`/`has` 前缀 (如 `isLoading`, `hasError`)

#### 3\. TypeScript 类型

  - **推荐**: 为所有 Props 和 API 返回值定义接口。
  - **禁止**: 尽量避免使用 `any`，这会失去 TypeScript 的意义。

### 6.4 调试技巧

1.  **React DevTools**: 必装 Chrome 插件，查看组件层级和 State。
2.  **debugger**: 在代码中写 `debugger` 语句，浏览器会自动断点。
3.  **日志**: `useEffect` 中打印日志查看 State 变化：
    ```typescript
    useEffect(() => {
      console.log('State changed:', state)
    }, [state])
    ```

-----

## 学习路线建议

### 第一天：打基础 (3-4 小时)

  - 阅读第一章：建立前后端概念映射 (1小时)
  - 阅读第二章：熟悉项目目录 (30分钟)
  - 阅读第三章：掌握 React 核心与 TS 类型 (2小时)

### 第二天：上手实践 (4-5 小时)

  - 阅读第四章：深入理解现有代码逻辑 (2小时)
  - 阅读第五章：学习开发流程 (1小时)
  - 动手尝试：复制一个现有页面，修改成新页面，调通 API (2小时)

### 第三天：进阶与规范 (3-4 小时)

  - 阅读第六章：学习最佳实践与避坑指南 (1小时)
  - 实现一个完整的 CRUD 功能 (3小时)

-----

## 资源推荐

### 官方文档 (中文)

  - [React 官方文档](https://zh-hans.react.dev/)
  - [TypeScript 官方文档](https://www.typescriptlang.org/zh/)
  - [Vite 官方文档](https://cn.vitejs.dev/)

### 在线演练场

  - [CodeSandbox (React)](https://codesandbox.io/)
  - [TypeScript Playground](https://www.typescriptlang.org/play)

-----

## 总结

本指南旨在帮助后端开发者平滑过渡到前端开发：

1.  **理解模型**: 用 Controller/Service 的思维理解 Component/Hook。
2.  **掌握状态**: 学会使用 `useState` 和 `useEffect` 管理数据流。
3.  **数据交互**: 熟悉 Axios 调用后端 API。
4.  **页面构建**: 掌握组件拆分与路由配置。

**下一步:**

  - 学习高级 Hooks (useReducer, useContext)
  - 了解前端测试 (Jest)
  - 学习前端工程化工具 (ESLint, Prettier)

**祝您编码愉快\!** 🚀