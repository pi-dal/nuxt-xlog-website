# xLog Website

A modern static website generator for [xLog](https://xlog.app) blogs, built with Vue 3, Vite, and TypeScript. This project automatically syncs content from xLog (a decentralized blogging platform) and generates optimized static websites with excellent performance and SEO.

## ✨ Features

- 🔄 **Auto Sync** - Automatically syncs blog content from xLog
- ⚡ **Fast Build** - Lightning-fast static site generation with Vite
- 🎨 **Beautiful Design** - Customizable and responsive design
- 📱 **Mobile-First** - Optimized for all devices
- 🔍 **SEO Ready** - Built-in SEO optimization
- 🌙 **Dark Mode** - Automatic dark/light theme switching
- 📝 **Markdown Support** - Full markdown processing with syntax highlighting
- 🏷️ **Tag System** - Organize content with tags
- 🖼️ **Image Optimization** - Automatic image compression and optimization
- 📡 **RSS Feeds** - Auto-generated RSS/Atom feeds
- 🚀 **Performance** - Optimized for Core Web Vitals

## 🛠️ Tech Stack

- **Frontend**: [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- **Build Tool**: [Vite](https://vitejs.dev/) - Next generation frontend tooling
- **SSG**: [vite-ssg](https://github.com/antfu/vite-ssg) - Static site generation for Vue
- **TypeScript**: [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- **Styling**: [UnoCSS](https://github.com/unocss/unocss) - Instant on-demand atomic CSS
- **xLog SDK**: [sakuin](https://www.npmjs.com/package/sakuin) - xLog JavaScript SDK
- **Markdown**: [Shiki](https://shiki.matsu.io/) - Syntax highlighting with dual themes

## 📦 Installation

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/pi-dal/nuxt-xlog-website.git
cd nuxt-xlog-website

# Install dependencies (using pnpm is recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

## 🚀 Quick Start

### 1. Configure xLog

There are two ways to configure your xLog integration:

#### Option 1: Web Interface (Recommended)

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. Visit `http://localhost:3333/config`

3. Enter your xLog handle (e.g., if your xLog URL is `https://your-handle.xlog.app`, then your handle is `your-handle`)

4. Click "Test Connection" to verify the configuration

5. Save the configuration

#### Option 2: Environment Variables

Create a `.env` file in the root directory:

```bash
# Your xLog handle
XLOG_HANDLE=your-xlog-handle
```

### 2. Development

```bash
# Start development server
pnpm dev

# The site will be available at http://localhost:3333
```

### 3. Build for Production

```bash
# Build the static site
pnpm build

# Preview the production build
pnpm preview
```

The build process includes:

- Static site generation with vite-ssg
- Font optimization and copying
- RSS feed generation
- Redirect rules setup

## 📁 Project Structure

```
├── src/
│   ├── components/           # Vue components
│   │   ├── DetailPage.vue    # Reusable detail page component
│   │   ├── ListPage.vue      # Reusable list page component
│   │   └── ...
│   ├── logics/              # Business logic
│   │   ├── xlog.ts          # xLog API client
│   │   ├── site.ts          # Site configuration
│   │   └── ...
│   ├── types.ts             # TypeScript type definitions
│   └── App.vue              # Root component
├── pages/                   # File-based routing
│   ├── index.vue            # Homepage
│   ├── posts/
│   │   ├── [slug].vue       # Post detail page
│   │   └── index.md         # Posts listing
│   ├── config.vue           # Configuration page
│   └── ...
├── scripts/                 # Build scripts
│   ├── rss.ts              # RSS feed generation
│   ├── og.ts               # Open Graph image generation
│   └── ...
├── public/                  # Static assets
└── dist/                    # Build output
```

## 🎯 API Integration

The project uses the [sakuin](https://www.npmjs.com/package/sakuin) SDK to interact with xLog's API, supporting:

- **Site Information**: Fetch site metadata and configuration
- **Posts**: Retrieve all posts with pagination support
- **Single Post**: Get individual post by slug
- **Statistics**: Site analytics and metrics
- **Error Handling**: Robust error handling with fallbacks

## 🎨 Customization

### Styling

The project uses [UnoCSS](https://github.com/unocss/unocss) for styling:

1. **Configuration**: Modify `unocss.config.ts` for custom utilities
2. **Components**: Use UnoCSS classes directly in Vue components
3. **Custom CSS**: Add custom styles in `src/styles/`

### Layout

- **Global Layout**: Edit `src/App.vue` for site-wide changes
- **Page Layouts**: Customize individual pages in the `pages/` directory
- **Components**: Modify or create new components in `src/components/`

### Adding Features

- **API Calls**: Extend `src/logics/xlog.ts` for new xLog API endpoints
- **Type Definitions**: Add new types in `src/types.ts`
- **Components**: Create new Vue components and pages as needed

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set the `XLOG_HANDLE` environment variable
3. Deploy

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `pnpm build`
3. Set publish directory: `dist`
4. Set environment variable: `XLOG_HANDLE`
5. Deploy

### Other Platforms

The generated `dist/` directory can be deployed to any static hosting service like:

- GitHub Pages
- Cloudflare Pages
- Surge.sh
- AWS S3 + CloudFront

## 🧪 Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linting
pnpm lint

# Compress images
pnpm compress

# Manage photos with EXIF data
pnpm photos
```

## 📊 Build Features

The build process includes several optimizations:

- **Static Site Generation**: Pre-renders all pages for optimal performance
- **Image Optimization**: Automatic compression and WebP conversion
- **Font Optimization**: Subset and optimize web fonts
- **RSS Generation**: Creates RSS, Atom, and JSON feeds
- **SEO Optimization**: Automatic meta tags and Open Graph images

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `pnpm lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Guidelines

- Follow the existing code style
- Add TypeScript types for new features
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [xLog](https://xlog.app) - Decentralized blogging platform
- [sakuin SDK](https://hyoban.xlog.app/xlog-sdk) - xLog JavaScript SDK
- [Original Template](https://github.com/pseudoyu/pseudoyu.com) - Base template project
- [Vue.js](https://vuejs.org/) - The progressive JavaScript framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

## 🔗 Links

- [xLog Platform](https://xlog.app) - Create your decentralized blog
- [sakuin SDK Documentation](https://hyoban.xlog.app/xlog-sdk) - Learn about xLog SDK
- [Vue 3 Documentation](https://vuejs.org/guide/) - Vue.js guide
- [Vite Documentation](https://vitejs.dev/guide/) - Vite build tool guide

---

Built with ❤️ using modern web technologies. Star ⭐ this repo if you find it helpful!
