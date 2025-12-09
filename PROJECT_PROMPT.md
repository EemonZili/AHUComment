# 校园点评前端项目开发提示词

## 项目概述

开发一个面向大学生的校园点评前端应用，提供校园生活相关的点评、分享和社交功能。项目需要集成完整的用户认证系统，包括用户管理、角色管理和权限管理。

## 技术栈要求

- **框架**: React 18+ 或 Vue 3+ (推荐 React + TypeScript)
- **状态管理**: Redux Toolkit / Zustand / Pinia
- **路由**: React Router / Vue Router
- **UI组件库**: Ant Design / Element Plus / 自定义组件
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **样式方案**: CSS Modules / Tailwind CSS / Styled-components
- **代码规范**: ESLint + Prettier

## 设计风格要求

### 目标用户
- 主要用户群体：在校大学生（18-25岁）
- 设计风格：年轻、活力、现代、清新
- 交互体验：简洁直观、操作流畅、反馈及时


## 功能模块规划

### 1. 用户认证模块
基于提供的API实现以下功能：

#### 登录/注册流程
- **微信扫码登录**：
  - 调用 `/user/getQR` 获取登录二维码
  - 通过 WebSocket 监听登录状态（sid参数）
  - 登录成功后调用 `/user/doLogin` 完成登录
  - 保存 token 到本地存储

- **用户注册**：
  - 调用 `/user/register` 注册新用户
  - 表单验证：openid、nickname 必填
  - 注册成功后自动登录

- **登录状态管理**：
  - 调用 `/user/isLogin` 检查登录状态
  - 实现路由守卫，未登录用户重定向到登录页
  - Token 过期自动刷新或重新登录

#### 用户信息管理
- **个人信息页面**：
  - 调用 `/user/getUserInfo` 获取用户信息
  - 显示：头像、昵称、性别、角色、注册时间等
  - 支持编辑：调用 `/user/update` 更新信息

- **头像上传**：
  - 调用 `/user/uploadAvatar` 上传头像
  - 支持图片预览、裁剪功能
  - 上传进度提示

- **权限查询**：
  - 调用 `/user/queryPermissionsByOpenId` 获取用户权限
  - 根据权限动态显示功能入口
  - 权限不足时显示友好提示

#### 用户管理（管理员功能）
- **用户列表**：
  - 显示所有用户信息
  - 支持搜索、筛选（按角色、状态）
  - 分页显示

- **用户操作**：
  - 启用/禁用：调用 `/user/changeStatus`
  - 删除用户：调用 `/user/delete`（需确认）
  - 分配角色：更新用户的 roleId

- **登出功能**：
  - 调用 `/user/logout` 登出
  - 清除本地存储的 token 和用户信息
  - 重定向到登录页

### 2. 角色管理模块（管理员功能）

- **角色列表**：
  - 调用 `/role/list` 获取所有角色
  - 卡片式展示，显示角色名称、状态、创建时间
  - 支持搜索和筛选

- **角色操作**：
  - 新增角色：调用 `/role/add`，表单包含 roleName、status
  - 编辑角色：调用 `/role/update`
  - 删除角色：调用 `/role/delete`（需确认，检查是否有关联用户）
  - 查看详情：调用 `/role/queryByRoleId`

### 3. 权限管理模块（管理员功能）

- **权限列表**：
  - 调用 `/permission/list` 获取所有权限
  - 树形或列表展示权限信息
  - 显示权限标识、状态

- **权限操作**：
  - 新增权限：调用 `/permission/add`
  - 删除权限：调用 `/permission/delete`

### 4. 角色权限关联模块（管理员功能）

- **权限分配界面**：
  - 调用 `/rolePermission/queryPermissionsByRoleId` 查询角色已有权限
  - 多选组件展示所有可用权限
  - 支持批量添加/删除权限关联
  - 调用 `/rolePermission/add` 和 `/rolePermission/delete` 进行关联操作

### 5. 校园点评核心功能（待扩展）

- **点评列表**：展示校园各类场所的点评
- **发布点评**：用户发布新的点评内容
- **点评详情**：查看详细点评信息和评论
- **搜索功能**：按关键词、分类搜索点评
- **个人中心**：我的点评、收藏、关注等

## API集成规范

### 请求配置
```typescript
// API 基础配置
const API_BASE_URL = '/auth'

// 请求拦截器
- 自动添加 token 到请求头
- 统一错误处理
- 请求超时设置

// 响应拦截器
- 统一处理 Result 格式的响应
- Token 过期自动处理
- 错误消息统一提示
```

### 数据类型定义
根据 OpenAPI schema 定义 TypeScript 类型：
- `AuthUserDTO`
- `AuthRoleDTO`
- `AuthPermissionDTO`
- `AuthRolePermissionDTO`
- `Result<T>`
- `SaTokenInfo`

### 错误处理
- 网络错误：显示"网络连接失败，请检查网络"
- 401 未授权：清除 token，跳转登录页
- 403 无权限：显示"您没有权限执行此操作"
- 其他错误：显示后端返回的 message

## 组件设计规范

### 通用组件
1. **Button**: 使用主色调，支持不同尺寸和状态
2. **Input**: 统一的输入框样式，带验证提示
3. **Card**: 卡片容器，使用圆角和阴影
4. **Modal**: 对话框组件，用于确认操作
5. **Avatar**: 头像组件，支持上传和显示
6. **Loading**: 加载动画，使用品牌色
7. **Empty**: 空状态组件，友好的提示文案

### 页面组件
1. **LoginPage**: 登录页面，二维码展示区域
2. **RegisterPage**: 注册页面，表单验证
3. **UserProfilePage**: 个人中心页面
4. **UserManagementPage**: 用户管理页面（管理员）
5. **RoleManagementPage**: 角色管理页面（管理员）
6. **PermissionManagementPage**: 权限管理页面（管理员）

## 状态管理设计

### 用户状态
```typescript
interface UserState {
  userInfo: AuthUserDTO | null
  token: string | null
  permissions: string[]
  isLogin: boolean
}
```

### 操作
- `login`: 登录
- `logout`: 登出
- `updateUserInfo`: 更新用户信息
- `fetchPermissions`: 获取权限列表

## 路由设计

```
/                    -> 首页/点评列表
/login               -> 登录页
/register            -> 注册页
/profile             -> 个人中心
/profile/edit        -> 编辑个人信息
/admin               -> 管理后台（需要管理员权限）
  /admin/users       -> 用户管理
  /admin/roles       -> 角色管理
  /admin/permissions -> 权限管理
  /admin/role-permissions -> 角色权限管理
```

## 响应式设计

- **断点设置**：
  - 手机：< 768px
  - 平板：768px - 1024px
  - 桌面：> 1024px
- **适配方案**：使用 flexbox/grid 布局，媒体查询调整

## 性能优化

1. **代码分割**：路由级别的懒加载
2. **图片优化**：使用 WebP 格式，懒加载
3. **请求优化**：防抖、节流，避免重复请求
4. **缓存策略**：用户信息、权限列表适当缓存

## 代码规范

1. **命名规范**：
   - 组件：PascalCase（如 `UserProfile.tsx`）
   - 函数/变量：camelCase（如 `getUserInfo`）
   - 常量：UPPER_SNAKE_CASE（如 `API_BASE_URL`）

2. **文件组织**：
   ```
   src/
     components/     # 通用组件
     pages/         # 页面组件
     services/      # API 服务
     store/         # 状态管理
     utils/         # 工具函数
     types/         # 类型定义
     styles/        # 样式文件
   ```

3. **注释要求**：关键函数、复杂逻辑需要注释说明

## 测试要求

- 单元测试：关键工具函数、API 服务
- 组件测试：核心组件渲染和交互
- E2E 测试：主要用户流程（登录、注册、信息更新）

## 开发优先级

### Phase 1: 基础认证功能
1. 登录/注册页面
2. 用户信息管理
3. 路由守卫
4. Token 管理

### Phase 2: 管理后台
1. 用户管理
2. 角色管理
3. 权限管理
4. 角色权限关联

### Phase 3: 核心功能
1. 点评列表
2. 发布点评
3. 点评详情
4. 搜索功能

### Phase 4: 优化和扩展
1. 性能优化
2. 用户体验优化
3. 功能扩展

## 注意事项

1. **安全性**：
   - Token 存储在 httpOnly cookie 或安全的 localStorage
   - 敏感操作需要二次确认
   - XSS 防护，输入验证和转义

2. **用户体验**：
   - 所有异步操作提供加载状态
   - 操作成功/失败有明确反馈
   - 错误信息用户友好
   - 支持键盘导航

3. **可访问性**：
   - 语义化 HTML
   - ARIA 标签
   - 键盘操作支持
   - 颜色对比度符合 WCAG 标准

4. **兼容性**：
   - 支持现代浏览器（Chrome、Firefox、Safari、Edge 最新版本）
   - 移动端浏览器兼容性测试

## 配色方案应用示例
/* CSS HEX */
--pearl-aqua: #a1d2ceff;
--pearl-aqua-2: #78cad2ff;
--tropical-teal: #62a8acff;
--pacific-cyan: #5497a7ff;
--dark-cyan: #50858bff;

/* CSS HSL */
--pearl-aqua: hsla(175, 35%, 73%, 1);
--pearl-aqua-2: hsla(185, 50%, 65%, 1);
--tropical-teal: hsla(183, 31%, 53%, 1);
--pacific-cyan: hsla(192, 33%, 49%, 1);
--dark-cyan: hsla(186, 27%, 43%, 1);

/* SCSS HEX */
$pearl-aqua: #a1d2ceff;
$pearl-aqua-2: #78cad2ff;
$tropical-teal: #62a8acff;
$pacific-cyan: #5497a7ff;
$dark-cyan: #50858bff;

/* SCSS HSL */
$pearl-aqua: hsla(175, 35%, 73%, 1);
$pearl-aqua-2: hsla(185, 50%, 65%, 1);
$tropical-teal: hsla(183, 31%, 53%, 1);
$pacific-cyan: hsla(192, 33%, 49%, 1);
$dark-cyan: hsla(186, 27%, 43%, 1);

/* SCSS RGB */
$pearl-aqua: rgba(161, 210, 206, 1);
$pearl-aqua-2: rgba(120, 202, 210, 1);
$tropical-teal: rgba(98, 168, 172, 1);
$pacific-cyan: rgba(84, 151, 167, 1);
$dark-cyan: rgba(80, 133, 139, 1);

/* SCSS Gradient */
$gradient-top: linear-gradient(0deg, #a1d2ceff, #78cad2ff, #62a8acff, #5497a7ff, #50858bff);
$gradient-right: linear-gradient(90deg, #a1d2ceff, #78cad2ff, #62a8acff, #5497a7ff, #50858bff);
$gradient-bottom: linear-gradient(180deg, #a1d2ceff, #78cad2ff, #62a8acff, #5497a7ff, #50858bff);
$gradient-left: linear-gradient(270deg, #a1d2ceff, #78cad2ff, #62a8acff, #5497a7ff, #50858bff);
$gradient-top-right: linear-gradient(45deg, #a1d2ceff, #78cad2ff, #62a8acff, #5497a7ff, #50858bff);
$gradient-bottom-right: linear-gradient(135deg, #a1d2ceff, #78cad2ff, #62a8acff, #5497a7ff, #50858bff);
$gradient-top-left: linear-gradient(225deg, #a1d2ceff, #78cad2ff, #62a8acff, #5497a7ff, #50858bff);
$gradient-bottom-left: linear-gradient(315deg, #a1d2ceff, #78cad2ff, #62a8acff, #5497a7ff, #50858bff);
$gradient-radial: radial-gradient(#a1d2ceff, #78cad2ff, #62a8acff, #5497a7ff, #50858bff);

---

## 目前开发的api文档进度如下：
{"openapi":"3.0.1","info":{"title":"Auth Document","description":"Auth Document","license":{"name":"Apache 2.0","url":"http://springdoc.org"},"version":"1.0"},"servers":[{"url":"/auth"}],"tags":[{"name":"权限管理","description":"权限相关API"},{"name":"角色管理","description":"角色相关API"},{"name":"用户管理接口","description":"提供用户注册、登录、权限查询等用户相关操作"},{"name":"角色权限管理","description":"角色权限关联相关API"}],"paths":{"/user/uploadAvatar":{"post":{"tags":["用户管理接口"],"operationId":"upload","parameters":[{"name":"multipartFile","in":"query","required":true,"schema":{"type":"string","format":"binary"}}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"type":"string"}}}}}}},"/user/update":{"post":{"tags":["用户管理接口"],"summary":"修改用户信息","description":"更新用户基本信息","operationId":"update","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthUserDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultBoolean"}}}}}}},"/user/register":{"post":{"tags":["用户管理接口"],"summary":"用户注册","description":"通过微信openid注册新用户","operationId":"register","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthUserDTO"}}},"required":true},"responses":{"200":{"description":"注册成功","content":{"application/json":{"schema":{"$ref":"#/components/schemas/Result"}}}}}}},"/user/queryPermissionsByOpenId":{"post":{"tags":["用户管理接口"],"summary":"根据 openId 查询角色权限","description":"根据用户openId查询该用户拥有的所有权限","operationId":"queryPermissionsByOpenId","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthUserDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListAuthPermissionDTO"}}}}}}},"/user/logout":{"post":{"tags":["用户管理接口"],"summary":"用户登出","description":"用户通过openid登出","operationId":"logout","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthUserDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/Result"}}}}}}},"/user/isLogin":{"post":{"tags":["用户管理接口"],"summary":"检查登录状态","description":"检查当前会话是否已登录","operationId":"isLogin","responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"type":"string"}}}}}}},"/user/getUserInfo":{"post":{"tags":["用户管理接口"],"summary":"获取用户信息","description":"根据openId获取用户详细信息","operationId":"getUserInfo","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthUserDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultAuthUserDTO"}}}}}}},"/user/getQR":{"post":{"tags":["用户管理接口"],"summary":"获取登录二维码","description":"生成微信登录二维码","operationId":"generateQR","parameters":[{"name":"sid","in":"query","description":"WebSocket会话ID","required":true,"schema":{"type":"string"}}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultString"}}}}}}},"/user/doLogin":{"post":{"tags":["用户管理接口"],"summary":"用户登录","description":"用户通过openid登录系统","operationId":"doLogin","parameters":[{"name":"openId","in":"query","description":"微信openid","required":true,"schema":{"type":"string"}},{"name":"sid","in":"query","description":"WebSocket会话ID","required":true,"schema":{"type":"string"}}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultSaTokenInfo"}}}}}}},"/user/delete":{"post":{"tags":["用户管理接口"],"summary":"删除用户","description":"根据用户信息删除指定用户","operationId":"delete","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthUserDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultBoolean"}}}}}}},"/user/changeStatus":{"post":{"tags":["用户管理接口"],"summary":"角色启用/禁用","description":"启用或禁用用户账号","operationId":"changeStatus","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthUserDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultBoolean"}}}}}}},"/rolePermission/queryPermissionsByRoleId":{"post":{"tags":["角色权限管理"],"summary":"根据 roleId 查询角色权限","description":"根据 roleId 查询角色权限","operationId":"queryPermissionsByRoleId","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthRolePermissionDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListAuthPermissionDTO"}}}}}}},"/rolePermission/delete":{"post":{"tags":["角色权限管理"],"summary":"删除角色关联权限","description":"删除角色关联权限","operationId":"delete_1","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthRolePermissionDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultBoolean"}}}}}}},"/rolePermission/add":{"post":{"tags":["角色权限管理"],"summary":"新增角色权限关联","description":"为角色分配权限","operationId":"add","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthRolePermissionDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultBoolean"}}}}}}},"/role/update":{"post":{"tags":["角色管理"],"summary":"更新角色","description":"更新角色信息","operationId":"update_1","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthRoleDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultBoolean"}}}}}}},"/role/queryByRoleId":{"post":{"tags":["角色管理"],"summary":"根据 roleId 查询角色","description":"根据 roleId 查询角色","operationId":"queryByRoleId","parameters":[{"name":"roleId","in":"query","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultAuthRoleDTO"}}}}}}},"/role/list":{"post":{"tags":["角色管理"],"summary":"查询所有角色","description":"查询所有角色","operationId":"list","responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListAuthRoleDTO"}}}}}}},"/role/delete":{"post":{"tags":["角色管理"],"summary":"删除角色","description":"根据ID删除角色信息","operationId":"delete_2","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthRoleDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultBoolean"}}}}}}},"/role/add":{"post":{"tags":["角色管理"],"summary":"新增角色","description":"新增角色信息","operationId":"add_1","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthRoleDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultBoolean"}}}}}}},"/permission/list":{"post":{"tags":["权限管理"],"summary":"查询所有权限","description":"获取权限列表","operationId":"list_1","responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListAuthPermissionDTO"}}}}}}},"/permission/delete":{"post":{"tags":["权限管理"],"summary":"删除权限","description":"根据ID删除权限信息","operationId":"delete_3","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthPermissionDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultBoolean"}}}}}}},"/permission/add":{"post":{"tags":["权限管理"],"summary":"新增权限","description":"新增权限信息","operationId":"add_2","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AuthPermissionDTO"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultBoolean"}}}}}}}},"components":{"schemas":{"AuthUserDTO":{"type":"object","properties":{"id":{"type":"integer","description":"主键","format":"int64"},"openid":{"type":"string","description":"微信用户唯一标识"},"nickname":{"type":"string","description":"昵称"},"sex":{"type":"string","description":"性别"},"avatar":{"type":"string","description":"头像"},"status":{"type":"integer","description":"用户状态：0：封禁 1：正常 暂时还想不到别的（","format":"int32"},"roleId":{"type":"integer","description":"角色Id","format":"int32"},"createdBy":{"type":"string","description":"创建人"},"createTime":{"type":"string","description":"创建时间","format":"date-time"},"updateBy":{"type":"string","description":"更新人"},"updateTime":{"type":"string","description":"更新时间","format":"date-time"},"isDeleted":{"type":"integer","description":"是否删除 0：未删除 1：已删除","format":"int32"}},"description":"用户信息(AuthUser)实体类"},"ResultBoolean":{"type":"object","properties":{"success":{"type":"boolean","description":"请求成功","example":true},"code":{"type":"integer","description":"状态码","format":"int32","example":200},"message":{"type":"string","description":"响应消息","example":"操作成功"},"data":{"type":"boolean","description":"响应数据"}},"description":"统一响应结果封装类"},"Result":{"type":"object","properties":{"success":{"type":"boolean","description":"请求成功","example":true},"code":{"type":"integer","description":"状态码","format":"int32","example":200},"message":{"type":"string","description":"响应消息","example":"操作成功"},"data":{"type":"object","description":"响应数据"}},"description":"统一响应结果封装类"},"AuthPermissionDTO":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"permission":{"type":"string"},"status":{"type":"integer","format":"int32"},"isDeleted":{"type":"integer","format":"int32"}},"description":"响应数据"},"ResultListAuthPermissionDTO":{"type":"object","properties":{"success":{"type":"boolean","description":"请求成功","example":true},"code":{"type":"integer","description":"状态码","format":"int32","example":200},"message":{"type":"string","description":"响应消息","example":"操作成功"},"data":{"type":"array","description":"响应数据","items":{"$ref":"#/components/schemas/AuthPermissionDTO"}}},"description":"统一响应结果封装类"},"ResultAuthUserDTO":{"type":"object","properties":{"success":{"type":"boolean","description":"请求成功","example":true},"code":{"type":"integer","description":"状态码","format":"int32","example":200},"message":{"type":"string","description":"响应消息","example":"操作成功"},"data":{"$ref":"#/components/schemas/AuthUserDTO"}},"description":"统一响应结果封装类"},"ResultString":{"type":"object","properties":{"success":{"type":"boolean","description":"请求成功","example":true},"code":{"type":"integer","description":"状态码","format":"int32","example":200},"message":{"type":"string","description":"响应消息","example":"操作成功"},"data":{"type":"string","description":"响应数据"}},"description":"统一响应结果封装类"},"ResultSaTokenInfo":{"type":"object","properties":{"success":{"type":"boolean","description":"请求成功","example":true},"code":{"type":"integer","description":"状态码","format":"int32","example":200},"message":{"type":"string","description":"响应消息","example":"操作成功"},"data":{"$ref":"#/components/schemas/SaTokenInfo"}},"description":"统一响应结果封装类"},"SaTokenInfo":{"type":"object","properties":{"tokenName":{"type":"string"},"tokenValue":{"type":"string"},"isLogin":{"type":"boolean"},"loginId":{"type":"object"},"loginType":{"type":"string"},"tokenTimeout":{"type":"integer","format":"int64"},"sessionTimeout":{"type":"integer","format":"int64"},"tokenSessionTimeout":{"type":"integer","format":"int64"},"tokenActiveTimeout":{"type":"integer","format":"int64"},"loginDeviceType":{"type":"string"},"tag":{"type":"string"}},"description":"响应数据"},"AuthRolePermissionDTO":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"roleId":{"type":"integer","format":"int64"},"permissionId":{"type":"integer","format":"int64"},"status":{"type":"integer","format":"int32"},"createdBy":{"type":"string"},"createTime":{"type":"string","format":"date-time"},"updateBy":{"type":"string"},"updateTime":{"type":"string","format":"date-time"},"isDeleted":{"type":"integer","format":"int32"},"permissions":{"type":"array","items":{"type":"string"}},"permissionIds":{"type":"array","items":{"type":"integer","format":"int64"}}}},"AuthRoleDTO":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"roleName":{"type":"string"},"status":{"type":"integer","format":"int32"},"createdBy":{"type":"string"},"createTime":{"type":"string","format":"date-time"},"updateBy":{"type":"string"},"updateTime":{"type":"string","format":"date-time"},"isDeleted":{"type":"integer","format":"int32"}}},"ResultAuthRoleDTO":{"type":"object","properties":{"success":{"type":"boolean","description":"请求成功","example":true},"code":{"type":"integer","description":"状态码","format":"int32","example":200},"message":{"type":"string","description":"响应消息","example":"操作成功"},"data":{"$ref":"#/components/schemas/AuthRoleDTO"}},"description":"统一响应结果封装类"},"ResultListAuthRoleDTO":{"type":"object","properties":{"success":{"type":"boolean","description":"请求成功","example":true},"code":{"type":"integer","description":"状态码","format":"int32","example":200},"message":{"type":"string","description":"响应消息","example":"操作成功"},"data":{"type":"array","description":"响应数据","items":{"$ref":"#/components/schemas/AuthRoleDTO"}}},"description":"统一响应结果封装类"}}}}

**开始开发时，请按照此提示词进行项目构建，确保代码质量、用户体验和设计一致性。如果更好设计方案，可以提出商讨**

