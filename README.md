# Campus Review - 校园点评系统

基于 React 18 + TypeScript + Vite 的校园点评前端应用。

## 技术栈

- **框架**: React 18.2
- **语言**: TypeScript 5.2
- **构建工具**: Vite 5.1
- **状态管理**: Zustand 4.5
- **路由**: React Router 6.22
- **HTTP 客户端**: Axios 1.6
- **图标**: Lucide React
- **样式**: CSS Modules

## 项目结构

```
src/
├── components/      # 通用 UI 组件
│   ├── Button/
│   ├── Input/
│   ├── Loading/
│   └── Modal/
├── pages/          # 页面组件
│   ├── Login/      # 登录页面（微信扫码）
│   ├── Profile/    # 个人中心
│   ├── ReviewList/ # 点评列表
│   ├── ReviewDetail/ # 点评详情
│   └── admin/      # 管理后台
├── services/       # API 服务层
│   ├── user.ts
│   ├── role.ts
│   ├── permission.ts
│   └── rolePermission.ts
├── store/          # Zustand 状态管理
│   ├── auth.ts
│   ├── user.ts
│   ├── role.ts
│   └── permission.ts
├── utils/          # 工具函数
│   ├── request.ts  # Axios 实例
│   └── websocket.ts # WebSocket 客户端
├── types/          # TypeScript 类型定义
└── styles/         # 全局样式
```

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动。

### 生产构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 后端配置

后端服务器地址: `http://49.235.97.26`

API 代理配置在 `vite.config.ts` 中：
- `/auth/*` → `http://49.235.97.26/auth/*`

WebSocket 地址: `ws://49.235.97.26/ws/login/{sessionId}`

## 功能特性

### ✅ 已实现

1. **项目基础架构**
   - Vite + React + TypeScript 配置
   - 路径别名 (@/)
   - ESLint + Prettier 代码规范

2. **状态管理**
   - Zustand 集成
   - 认证状态持久化
   - 用户/角色/权限状态管理

3. **API 服务层**
   - Axios 请求拦截器（自动添加 token）
   - 响应拦截器（统一错误处理）
   - 完整的类型定义

4. **路由系统**
   - React Router 配置
   - 路由守卫（认证保护）
   - 管理员权限路由

5. **通用组件**
   - Button（多种变体）
   - Input（带验证）
   - Loading（全屏/内联）
   - Modal（可配置）

6. **登录页面**
   - 微信扫码登录
   - WebSocket 实时状态监听
   - 4 种二维码状态（Loading/Ready/Scanned/Expired）
   - 响应式设计

### ⏳ 待实现

- 用户个人中心页面
- 点评列表和详情页面
- 管理后台页面（用户/角色/权限管理）

## 设计系统

### 安徽大学配色

- 深蓝色: `#2E4A85` (主色)
- 学术金: `#D4AF37` (辅助色)

### 字体

- 标题: Plus Jakarta Sans
- 正文: Inter
- 等宽: JetBrains Mono

### 间距

使用 CSS 变量系统，基于 4px 网格。

## API 文档

详见 `PROJECT_PROMPT.md` 中的 OpenAPI 规范。

## 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/router/index.tsx` 添加路由
3. 根据需要添加路由守卫

### 添加新 API

1. 在 `src/types/` 添加类型定义
2. 在 `src/services/` 创建 API 方法
3. 在 `src/store/` 创建状态管理（如需要）

### 样式规范

- 使用 CSS Modules
- 使用 CSS 变量（在 `src/styles/index.css`）
- 遵循响应式设计原则（使用 clamp()）

## 联调测试

登录功能已实现，可以进行联调测试：

1. 启动开发服务器: `npm run dev`
2. 访问 `http://localhost:3000/login`
3. 测试微信扫码登录流程

## License

MIT
