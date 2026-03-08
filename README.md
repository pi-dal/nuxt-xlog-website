# Markdown-First Personal Site

This repository builds a static personal site with Vue 3, Vite, and `vite-ssg`. Content now lives in local Markdown files under `pages/`, not in Crossbell or xLog. The current setup follows the same route-first approach used in [antfu.me](https://github.com/antfu/antfu.me): Markdown files become routes, frontmatter becomes route metadata, and build scripts read local files directly for feeds and OG assets.

## Features

- Markdown-first content model for posts and pages
- Static site generation with `vite-ssg`
- Route metadata powered listing pages
- Local RSS generation from Markdown files
- Local Open Graph image generation from Markdown files
- Legacy `Articles/` importer for first-pass migration
- UnoCSS styling and Vue 3 components

## Content Model

The site treats Markdown files in `pages/` as the canonical source of content.

```text
pages/
├── chat.md
├── index.md
├── projects.md
├── books/
│   └── index.md
└── posts/
    ├── index.md
    └── *.md
```

Each content file uses frontmatter with this schema:

```yaml
---
title: Example Title
slug: example-title
type: post
date: 2026-03-08
summary: Short description shown in lists and feeds.
tags:
  - notes
  - vue
image: /article-assets/example-title/cover.jpg
draft: false
---
```

Supported `type` values are `post`, `book`, `page`, `chat`, and `project`.

For non-`index.md` pages, the route URL now comes from frontmatter `slug`, not the filename. That means `pages/posts/anything.md` can still render at `/posts/my-real-slug` as long as the file contains `slug: my-real-slug`.

## Local Configuration

Site-wide metadata lives in [src/site/config.ts](/Users/pi-dal/Developer/nuxt-xlog-website/src/site/config.ts). Update this file when you want to change:

- Site title and description
- Canonical URL
- Avatar path
- Author name and handle
- Social links

## Importing Legacy Articles

The repository includes a one-shot importer for the existing export inside `Articles/`.

```bash
pnpm import:articles
```

The importer will:

- read the legacy CSV export for metadata
- parse the legacy Markdown files in `Articles/pi-dal's Blog`
- convert pseudo-frontmatter into YAML frontmatter
- copy static assets into `public/article-assets/<slug>/`
- rewrite relative asset links to the new public path
- keep draft entries as local markdown
- skip `Untitled` files
- write posts to `pages/posts/*.md`
- write drafts to `drafts/posts/*.md`
- write standalone pages such as `about` to `pages/*.md`

## Development

Install dependencies and start the site locally:

```bash
pnpm install
pnpm dev
```

The dev server runs at [http://localhost:3333](http://localhost:3333).

RSS feeds are generated during the production build, not on every dev startup.

## Build

```bash
pnpm build
pnpm preview
```

The production build runs this pipeline:

1. Generate OG images from local Markdown content
2. Build the static site with `vite-ssg`
3. Copy optimized fonts into the output directory
4. Generate RSS, Atom, and JSON feeds from local Markdown content
5. Copy `_redirects` into `dist/`

`NO_WEBFONT_FETCH=1` is enabled in the default build command so CI does not fetch remote fonts.

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm import:articles
pnpm compress
pnpm photos
```

## Architecture

- [vite.config.ts](/Users/pi-dal/Developer/nuxt-xlog-website/vite.config.ts): Vite, Markdown routing, auto imports, SSG setup
- [src/composables/useContentRoutes.ts](/Users/pi-dal/Developer/nuxt-xlog-website/src/composables/useContentRoutes.ts): derives list data from route frontmatter
- [src/components/ListContent.vue](/Users/pi-dal/Developer/nuxt-xlog-website/src/components/ListContent.vue): shared Markdown-native list UI
- [src/content/files.ts](/Users/pi-dal/Developer/nuxt-xlog-website/src/content/files.ts): filesystem loader for RSS and OG scripts
- [scripts/import-articles.ts](/Users/pi-dal/Developer/nuxt-xlog-website/scripts/import-articles.ts): legacy article migration script
- [scripts/rss.ts](/Users/pi-dal/Developer/nuxt-xlog-website/scripts/rss.ts): RSS generation from local Markdown files
- [scripts/generate-og.ts](/Users/pi-dal/Developer/nuxt-xlog-website/scripts/generate-og.ts): OG generation from local Markdown files

## Verification

Before shipping changes, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If you change imported content, rerun `pnpm import:articles` before building.
