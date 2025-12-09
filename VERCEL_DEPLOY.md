# Vercel 快速部署指南

## 最简单的方式（5分钟完成）

### 步骤1: 推送代码到GitHub

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "准备部署到Vercel"

# 添加远程仓库（替换成你的GitHub仓库地址）
git remote add origin https://github.com/你的用户名/ahu-comment.git

# 推送到GitHub
git push -u origin main
```

### 步骤2: 部署到Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **"Sign Up"** 或 **"Login"**（使用GitHub登录）
3. 点击 **"Add New Project"**
4. 选择你刚刚推送的仓库 `ahu-comment`
5. Vercel会自动识别为Vite项目，保持默认配置：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. 点击 **"Deploy"**
7. 等待2-3分钟，部署完成！

### 步骤3: 获取部署地址

部署成功后，你会看到一个地址，例如：
```
https://ahu-comment-xxxx.vercel.app
```

### 步骤4: 分享给后端同学

把地址发给后端同学：
- 测试页面: `https://你的域名.vercel.app/api-test`
- 登录页面: `https://你的域名.vercel.app/login`

---

## 后续更新

以后每次更新代码，只需要：

```bash
git add .
git commit -m "更新说明"
git push
```

Vercel会自动部署新版本！🎉

---

## 可能遇到的问题

### 1. CORS 跨域错误

**现象**: 浏览器控制台显示 CORS 错误

**解决**: 让后端同学添加CORS配置：

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "https://你的域名.vercel.app",
                    "http://localhost:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 2. WebSocket 连接失败

**解决**: 检查WebSocket地址是否正确（应该是 `ws://49.235.97.26/ws/login/{sid}`）

### 3. 部署后白屏

**解决**:
- 检查浏览器控制台错误
- 确认 `vercel.json` 文件存在
- 检查路由配置

---

## 使用自定义域名（可选）

如果你有自己的域名：

1. 在Vercel项目设置中点击 **"Domains"**
2. 输入你的域名
3. 按照提示配置DNS记录
4. 等待生效（通常几分钟）

---

## 性能优化建议

部署后的网站会自动享有：
- ✅ 全球CDN加速
- ✅ 自动HTTPS
- ✅ Gzip压缩
- ✅ 静态资源缓存

---

## 监控和日志

在Vercel dashboard中可以查看：
- 部署历史
- 访问日志
- 性能监控
- 错误报告

---

## 需要帮助？

- Vercel文档: https://vercel.com/docs
- GitHub Issues: 在你的仓库创建issue
- 联系团队成员

祝部署顺利！🚀
