# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **static website generator** for xLog blogs built with Vue 3 + Vite, using the vite-ssg plugin for static site generation. The project syncs content from xLog (a decentralized blogging platform) and generates an optimized static website.

**Key Architecture:**

- **Vue 3 + Vite**: Modern frontend framework with fast build tooling
- **vite-ssg**: Static site generation for Vue/Vite applications
- **File-based routing**: Uses `unplugin-vue-router` with pages in the `pages/` directory
- **Markdown support**: Full markdown processing with frontmatter, syntax highlighting, and Vue components
- **xLog integration**: Fetches blog content from xLog API using the `sakuin` SDK
- **UnoCSS**: Atomic CSS framework for styling
- **TypeScript**: Full type safety throughout the codebase

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production (includes font copying, RSS generation, and redirects)
pnpm build

# Preview production build
pnpm preview

# Run linting
pnpm lint

# Image compression (for photos)
pnpm compress

# Photo management (rename/organize photos with EXIF data)
pnpm photos
```

## Build Process

The build command runs multiple steps:

1. `vite-ssg build` - Static site generation
2. `tsx ./scripts/copy-fonts.ts` - Copy font files to public assets
3. `tsx ./scripts/rss.ts` - Generate RSS/Atom feeds
4. `cp _redirects dist/_redirects` - Copy redirect rules

## Configuration

### xLog Configuration

The site can be configured via two methods:

1. **Web interface**: Visit `/config` to set xLog handle through UI
2. **Environment variable**: Set `XLOG_HANDLE` in `.env` file

The xLog handle is stored in localStorage (client-side) and falls back to environment variables (server-side).

### Key Configuration Files

- `vite.config.ts`: Main build configuration with extensive markdown processing
- `unocss.config.ts`: CSS framework configuration
- `tsconfig.json`: TypeScript configuration
- `eslint.config.js`: Uses @antfu/eslint-config

## Architecture Details

### Data Flow

1. **xLog API**: Content is fetched from xLog via the `sakuin` SDK
2. **Local Storage**: xLog handle configuration is stored client-side
3. **Static Generation**: vite-ssg pre-renders pages at build time
4. **Markdown Processing**: Full markdown pipeline with syntax highlighting and Vue components

### Key Directories

- `src/components/`: Vue components including xLog-specific components
- `src/logics/`: Business logic and API clients for xLog integration
- `pages/`: File-based routing with both `.vue` and `.md` files
- `scripts/`: Build scripts for RSS, image processing, and font management
- `public/`: Static assets including generated OG images and fonts

### xLog Integration

- **API Client**: `src/logics/xlog.ts` - Main xLog SDK wrapper with error handling
- **Direct API**: `src/logics/xlog-direct.ts` - Direct API calls for some operations
- **Site State**: `src/logics/site.ts` - Global site information management
- **Types**: `src/types.ts` - TypeScript interfaces for xLog data structures

### Markdown Processing

The markdown pipeline includes:

- **Shiki**: Syntax highlighting with dual themes (light/dark)
- **Frontmatter**: YAML metadata processing
- **Anchor links**: Automatic heading anchors
- **Table of contents**: Auto-generated TOC
- **GitHub Alerts**: Support for GitHub-style alerts
- **Magic Links**: Automatic link enhancement for known repositories

### Image Handling

- **Photo Management**: Automated photo processing with EXIF data extraction
- **Compression**: Sharp-based image compression with quality optimization
- **OG Images**: Automatic Open Graph image generation for posts
- **Image Preview**: Click-to-zoom functionality for images in posts

## Development Notes

### Package Management

- Uses **pnpm** as package manager
- Configured with workspace support via `pnpm-workspace.yaml`
- Uses catalog entries for dependency version management

### Git Hooks

- Pre-commit hooks run `lint-staged` which applies ESLint fixes
- Configured via `simple-git-hooks`

### Error Handling

- xLog API calls are wrapped with comprehensive error handling
- Graceful fallbacks for missing content or API failures
- Client-side configuration validation

### Performance Optimization

- Static site generation for fast loading
- Image compression and optimization
- Font subsetting and local font loading
- CSS atomic classes for minimal bundle size

## Testing & Deployment

### Local Testing

Run `pnpm dev` to start the development server on port 3333. The `/config` page allows testing xLog connectivity.

### Build Validation

After running `pnpm build`, verify:

- Static files are generated in `dist/`
- RSS feeds are created (`feed.xml`, `feed.atom`, `feed.json`)
- Font files are copied to `public/assets/fonts/`
- Redirects file is in place

### Deployment

The `dist/` directory can be deployed to any static hosting service. The build process is optimized for platforms like Vercel, Netlify, or GitHub Pages.
