# xLog Website

一个基于 [xLog](https://xlog.app) 的静态网站生成器，使用 Nuxt 3 + Vue 3 + TypeScript 构建。

## 特性

- 🔄 **自动同步** xLog 博客内容
- ⚡ **快速** 静态站点生成
- 🎨 **美观** 可定制的设计
- 📱 **响应式** 移动端友好
- 🔍 **SEO优化** 更好的搜索排名
- 🌙 **暗色模式** 支持
- 📝 **Markdown** 支持
- 🏷️ **标签系统**

## 快速开始

### 1. 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或者使用 npm
npm install

# 或者使用 yarn
yarn install
```

### 2. 配置 xLog

有两种方式配置你的 xLog：

#### 方式一：通过网页界面配置（推荐）

1. 启动开发服务器：
   ```bash
   pnpm dev
   ```

2. 访问 `http://localhost:3333/config`

3. 输入你的 xLog handle（例如：如果你的 xLog 地址是 `https://your-handle.xlog.app`，那么 handle 就是 `your-handle`）

4. 点击"测试连接"确认配置正确

5. 保存配置

#### 方式二：通过环境变量配置

创建 `.env` 文件：

```bash
# 你的 xLog handle
XLOG_HANDLE=your-xlog-handle
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3333` 查看你的网站。

### 4. 构建生产版本

```bash
pnpm build
```

## 项目结构

```
├── src/
│   ├── components/
│   │   ├── ListXLogPosts.vue    # xLog 文章列表组件
│   │   └── ...
│   ├── logics/
│   │   ├── xlog.ts              # xLog API 客户端
│   │   └── index.ts
│   └── types.ts                 # TypeScript 类型定义
├── pages/
│   ├── index.md                 # 首页
│   ├── posts.md                 # 文章列表页
│   ├── config.vue               # 配置页面
│   └── posts/
│       └── [slug].vue           # 文章详情页
└── ...
```

## API 功能

项目使用 [sakuin](https://www.npmjs.com/package/sakuin) SDK 与 xLog API 交互，支持：

- 获取站点信息
- 获取所有文章
- 分页获取文章
- 根据 slug 获取单篇文章
- 获取站点统计信息

## 自定义

### 修改样式

项目使用 [UnoCSS](https://github.com/unocss/unocss) 作为 CSS 框架，你可以：

1. 修改 `unocss.config.ts` 配置
2. 在组件中使用 UnoCSS 类名
3. 添加自定义 CSS

### 修改布局

- 编辑 `src/App.vue` 修改全局布局
- 编辑各个页面文件自定义页面布局
- 修改 `src/components/` 中的组件

### 添加功能

- 在 `src/logics/xlog.ts` 中添加新的 API 调用
- 在 `src/types.ts` 中添加新的类型定义
- 创建新的 Vue 组件和页面

## 部署

### Vercel

1. 连接你的 GitHub 仓库到 Vercel
2. 设置环境变量 `XLOG_HANDLE`
3. 部署

### Netlify

1. 连接你的 GitHub 仓库到 Netlify
2. 设置构建命令：`pnpm build`
3. 设置发布目录：`dist`
4. 设置环境变量 `XLOG_HANDLE`
5. 部署

### 其他平台

生成的 `dist` 目录可以部署到任何静态文件托管服务。

## 技术栈

- [Nuxt 3](https://nuxt.com/) - Vue.js 框架
- [Vue 3](https://vuejs.org/) - 前端框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [UnoCSS](https://github.com/unocss/unocss) - CSS 框架
- [sakuin](https://www.npmjs.com/package/sakuin) - xLog SDK
- [Vite](https://vitejs.dev/) - 构建工具

## 贡献

欢迎提交 Issues 和 Pull Requests！

## 许可证

MIT License

## 相关链接

- [xLog](https://xlog.app) - 去中心化博客平台
- [sakuin SDK](https://hyoban.xlog.app/xlog-sdk) - xLog JavaScript SDK
- [原始模板](https://github.com/pseudoyu/pseudoyu.com) - 基于的模板项目
