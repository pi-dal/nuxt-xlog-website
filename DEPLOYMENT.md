# Cloudflare Pages 部署指南

## 部署步骤

### 1. 准备 GitHub 仓库

确保你的代码已经推送到 GitHub 仓库。

### 2. 登录 Cloudflare Dashboard

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 部分

### 3. 创建新的 Pages 项目

1. 点击 **Create a project**
2. 选择 **Connect to Git**
3. 授权并选择你的 GitHub 仓库

### 4. 配置构建设置

- **Project name**: `nuxt-xlog-website` (或你喜欢的名字)
- **Production branch**: `main`
- **Build command**: `pnpm build`
- **Build output directory**: `dist`
- **Root directory**: `/` (留空)

### 5. 环境变量设置 (可选)

在 Cloudflare Pages 项目设置中添加以下环境变量：

- `XLOG_HANDLE`: 你的 xLog 用户名 (默认: pi-dal)
- `NODE_VERSION`: `18`

### 6. 高级设置

- **Node.js version**: 18 (由 .nvmrc 文件自动设置)
- **Package manager**: pnpm

## 自定义域名 (可选)

1. 在项目设置中选择 **Custom domains**
2. 添加你的域名
3. 按照指示配置 DNS 记录

## 构建优化

项目已经配置了以下优化：

- 静态站点生成 (SSG)
- 自动字体复制
- RSS 生成
- 重定向规则
- 图片压缩和优化

## 注意事项

- 确保所有依赖都在 package.json 中正确声明
- 构建时间约 3-5 分钟
- Cloudflare Pages 会自动处理缓存和 CDN 分发
