# 部署到公网指南

## 🚀 方案一：Vercel 部署（推荐 - 最简单）

### 优点
- ✅ 完全免费
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 自动部署（git push后自动更新）
- ✅ 适合前端项目

### 部署步骤

#### 1. 准备工作

首先需要修改代码，让生产环境直接访问后端地址：

**修改 `src/utils/request.ts`:**
```typescript
const request = axios.create({
  baseURL: import.meta.env.PROD ? 'http://49.235.97.26/auth' : '/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

**修改 `src/utils/reviewRequest.ts`:**
```typescript
const reviewRequest = axios.create({
  baseURL: import.meta.env.PROD ? 'http://49.235.97.26/review' : '/review',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

**修改 `src/utils/postRequest.ts`:**
```typescript
const postRequest = axios.create({
  baseURL: import.meta.env.PROD ? 'http://49.235.97.26/post' : '/post',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

#### 2. 创建 vercel.json 配置文件

在项目根目录创建 `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 3. 部署到 Vercel

**方式A: 使用 GitHub（推荐）**

1. 将代码推送到 GitHub
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <你的GitHub仓库地址>
   git push -u origin main
   ```

2. 访问 [vercel.com](https://vercel.com)
3. 用 GitHub 登录
4. 点击 "Import Project"
5. 选择你的 GitHub 仓库
6. 保持默认配置，点击 "Deploy"
7. 等待几分钟，部署完成！

**方式B: 使用 Vercel CLI**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

#### 4. 获取部署地址

部署成功后，Vercel 会给你一个地址，例如：
```
https://ahu-comment.vercel.app
```

---

## 🌐 方案二：Netlify 部署（也很简单）

### 优点
- ✅ 免费
- ✅ 自动HTTPS
- ✅ 简单易用

### 部署步骤

#### 1. 修改代码（同方案一）

#### 2. 创建 netlify.toml

在项目根目录创建 `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. 部署

**方式A: 拖拽部署**

1. 构建项目
   ```bash
   npm run build
   ```
2. 访问 [netlify.com](https://netlify.com)
3. 拖拽 `dist` 文件夹到页面
4. 完成！

**方式B: GitHub 自动部署**

1. 推送代码到 GitHub
2. 访问 [netlify.com](https://netlify.com)
3. 用 GitHub 登录
4. "New site from Git"
5. 选择仓库
6. Build command: `npm run build`
7. Publish directory: `dist`
8. 点击 "Deploy site"

---

## 🐳 方案三：Docker + 云服务器（更专业）

### 优点
- ✅ 完全控制
- ✅ 可以部署在国内服务器（更快）
- ✅ 适合生产环境

### 部署步骤

#### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`:
```dockerfile
# 构建阶段
FROM node:18-alpine as build

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=build /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 创建 nginx.conf

在项目根目录创建 `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 如果需要代理后端（可选）
    location /auth {
        proxy_pass http://49.235.97.26;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /review {
        proxy_pass http://49.235.97.26;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /post {
        proxy_pass http://49.235.97.26;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket 支持
    location /ws {
        proxy_pass http://49.235.97.26;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 3. 构建和运行

```bash
# 构建镜像
docker build -t ahu-comment-frontend .

# 运行容器
docker run -d -p 80:80 --name ahu-comment ahu-comment-frontend
```

#### 4. 在云服务器上部署

购买云服务器（阿里云、腾讯云等），然后：

```bash
# SSH 连接到服务器
ssh root@你的服务器IP

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 上传代码（或 git clone）
git clone <你的仓库>

# 构建和运行
cd ahu-comment-claude
docker build -t ahu-comment-frontend .
docker run -d -p 80:80 --name ahu-comment ahu-comment-frontend

# 配置域名（可选）
# 绑定域名到服务器IP
# 配置 HTTPS（使用 Let's Encrypt）
```

---

## 🌟 方案四：GitHub Pages（免费但有限制）

### 优点
- ✅ 完全免费
- ✅ 和 GitHub 集成

### 缺点
- ⚠️ 不支持代理
- ⚠️ 需要配置 base path

### 部署步骤

#### 1. 修改 vite.config.ts

```typescript
export default defineConfig({
  base: '/ahu-comment/', // 你的仓库名
  // ... 其他配置
})
```

#### 2. 创建部署脚本

创建 `deploy.sh`:
```bash
#!/usr/bin/env sh

set -e

npm run build

cd dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:你的用户名/ahu-comment.git main:gh-pages

cd -
```

#### 3. 部署

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📊 方案对比

| 方案 | 难度 | 费用 | 速度 | 适用场景 |
|------|------|------|------|----------|
| Vercel | ⭐ 最简单 | 免费 | 🚀 快 | 测试/演示 |
| Netlify | ⭐ 简单 | 免费 | 🚀 快 | 测试/演示 |
| Docker+云服务器 | ⭐⭐⭐ 中等 | ¥50-200/月 | 🔥 最快（国内） | 生产环境 |
| GitHub Pages | ⭐⭐ 简单 | 免费 | 🐌 较慢 | 静态展示 |

---

## ⚠️ 重要提醒

### CORS 问题

如果生产环境直接访问后端 API，可能遇到 CORS 跨域问题。需要后端配置：

**后端需要添加 CORS 支持（Spring Boot）:**

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://你的前端域名.vercel.app")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### WebSocket 连接

WebSocket 地址也需要修改：

**修改 `src/utils/websocket.ts`:**
```typescript
const wsUrl = import.meta.env.PROD
  ? 'ws://49.235.97.26/ws/login'
  : 'ws://localhost:3000/ws/login'
```

---

## 🎯 推荐流程

**测试阶段（现在）:**
1. 使用 **Vercel** 部署（5分钟搞定）
2. 发给后端同学测试
3. 快速迭代

**生产环境（正式上线）:**
1. 购买云服务器
2. 使用 **Docker + Nginx** 部署
3. 配置域名和 HTTPS
4. 设置 CI/CD 自动部署

---

## 🚀 快速开始（推荐 Vercel）

```bash
# 1. 修改代码（见上文）
# 2. 推送到 GitHub
git init
git add .
git commit -m "Initial commit"
git push

# 3. 访问 vercel.com 连接 GitHub
# 4. 点击部署
# 5. 完成！
```

部署完成后，你会得到一个地址，例如：
```
https://ahu-comment-xxxx.vercel.app
```

把这个地址发给后端同学就可以了！🎉
