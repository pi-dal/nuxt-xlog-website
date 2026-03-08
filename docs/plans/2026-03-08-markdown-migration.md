# Markdown Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the broken Crossbell/xLog-backed content flow with a markdown-first architecture based on local files, using the existing `Articles/` export as the first import source and aligning the site with `antfu.me` patterns.

**Architecture:** Make markdown files under `pages/` the canonical source for routable content, with frontmatter exposed through route metadata by Vite. Import legacy posts from `Articles/` into normalized markdown files plus static asset folders, and rewrite list pages, RSS generation, and OG generation to consume local markdown instead of runtime API fetches. Keep the first migration scoped to blog posts and the about page; leave books, projects, and chat as explicit follow-up content tracks instead of forcing fake parity with the removed Crossbell source.

**Tech Stack:** Vue 3, Vite, vite-ssg, unplugin-vue-router, unplugin-vue-markdown, TypeScript, Vitest, gray-matter, fast-glob, fs-extra

### Task 1: Lock down the target content model

**Files:**
- Create: `src/types/content.ts`
- Create: `tests/unit/content-model.test.ts`
- Modify: `src/types.ts`

**Step 1: Write a failing test for normalized content entries.**

Create `tests/unit/content-model.test.ts` to assert:
- a blog post entry exposes `title`, `slug`, `date`, `summary`, `tags`, `draft`, `type`
- a page entry can omit `date`
- invalid `type` values are rejected by runtime helpers

**Step 2: Run the test to confirm failure.**

Run:
```bash
pnpm vitest run tests/unit/content-model.test.ts
```

Expected: FAIL because `src/types/content.ts` does not exist yet.

**Step 3: Add the shared content types.**

Create `src/types/content.ts` with:
- `ContentType = 'post' | 'page' | 'book' | 'project' | 'chat'`
- `SiteLink`
- `SiteConfig`
- `ContentFrontmatter`
- `ImportedArticleRecord`

Keep `src/types.ts` temporarily exporting existing xLog types for untouched code, but re-export the new content types there so new code can import from one place during the migration.

**Step 4: Re-run the test.**

Run:
```bash
pnpm vitest run tests/unit/content-model.test.ts
```

Expected: PASS.

### Task 2: Introduce local site configuration and remove site-info dependency from page chrome

**Files:**
- Create: `src/site/config.ts`
- Create: `tests/unit/site-config.test.ts`
- Modify: `src/logics/site-meta.ts`
- Modify: `src/components/Logo.vue`
- Modify: `pages/index.vue`
- Modify: `src/components/ListPage.vue`

**Step 1: Write a failing test for local site config.**

Create `tests/unit/site-config.test.ts` to assert:
- the base site URL resolves from local config
- author handle/social links come from local config
- no xLog fallback is used when local config exists

**Step 2: Run the test to confirm failure.**

Run:
```bash
pnpm vitest run tests/unit/site-config.test.ts
```

Expected: FAIL because `src/site/config.ts` does not exist yet.

**Step 3: Create the local config module.**

Create `src/site/config.ts` exporting a typed object with:
- site title
- description
- canonical base URL
- avatar path
- author name
- social links

Seed the values from the current live branding in:
- `index.html`
- `src/components/Footer.vue`
- `public/avatar.webp`
- existing social links in the current homepage/about content

**Step 4: Update URL helpers to use local config first.**

Modify `src/logics/site-meta.ts` so:
- `resolveSiteUrl()` defaults to the local site config
- `resolveAuthorHandle()` derives from local config instead of `XLogSite`
- xLog-specific fallback strings like `xlog` are removed

**Step 5: Point shell UI at local config.**

Update:
- `src/components/Logo.vue`
- `pages/index.vue`
- `src/components/ListPage.vue`

Use local config where they currently depend on fetched `siteInfo`.

**Step 6: Re-run the site config test.**

Run:
```bash
pnpm vitest run tests/unit/site-config.test.ts
```

Expected: PASS.

### Task 3: Build the one-time `Articles/` import pipeline

**Files:**
- Create: `scripts/import-articles.ts`
- Create: `tests/unit/import-articles.test.ts`
- Create: `tests/fixtures/articles/`
- Create: `public/article-assets/.gitkeep`
- Modify: `package.json`

**Step 1: Write a failing test for article import behavior.**

Create `tests/unit/import-articles.test.ts` covering:
- published `Post` rows import into `pages/posts/<slug>.md`
- `Page` rows import into `pages/<slug>.md`
- `Draft` rows are skipped
- `Untitled` files with no `slug` are skipped
- relative image links are rewritten to `/article-assets/<slug>/...`

Use small fixture files based on:
- `Articles/pi-dal's Blog 81bcf076da0a4bd492e85de090c409c9.csv`
- `Articles/pi-dal's Blog/About 24ad8c69eaad4e939b453403132c04e6.md`
- `Articles/pi-dal's Blog/2022湖南之旅 135c4b22ba4c4ac381a1ebb7068e1709.md`

**Step 2: Run the test to confirm failure.**

Run:
```bash
pnpm vitest run tests/unit/import-articles.test.ts
```

Expected: FAIL because the import script does not exist yet.

**Step 3: Implement the importer.**

Create `scripts/import-articles.ts` that:
- reads the CSV manifest
- maps each row by title and slug
- parses the legacy markdown preamble (`date:`, `slug:`, `status:`, `tags:`, `summary:`, `type:`)
- converts the legacy header into YAML frontmatter
- copies matching asset folders into `public/article-assets/<slug>/`
- rewrites markdown image paths to `/article-assets/<slug>/...`
- skips:
  - `status: Draft`
  - rows without `slug`
  - files whose title stays `Untitled`

Add a package script:
```json
"import:articles": "tsx scripts/import-articles.ts"
```

**Step 4: Re-run the importer test.**

Run:
```bash
pnpm vitest run tests/unit/import-articles.test.ts
```

Expected: PASS.

**Step 5: Execute the importer against the real export.**

Run:
```bash
pnpm import:articles
```

Expected:
- `pages/posts/` contains normalized markdown posts for the 7 published blog articles
- `pages/about.md` exists
- `public/article-assets/` contains copied article image folders

### Task 4: Convert posts and pages to route-first markdown content

**Files:**
- Create: `src/components/ListContent.vue`
- Create: `src/composables/useContentRoutes.ts`
- Modify: `pages/posts/index.vue`
- Modify: `pages/about.md`
- Modify: `src/components/WrapperPost.vue`
- Delete: `src/composables/usePost.ts`
- Delete: `src/components/DetailPage.vue`
- Delete: `pages/posts/[slug].vue`

**Step 1: Write a failing test for route aggregation.**

Create `tests/unit/content-routes.test.ts` asserting:
- `router.getRoutes()`-style data is filtered by frontmatter `type`
- drafts are excluded
- posts sort by descending `date`
- pages with no date are excluded from the posts listing

**Step 2: Run the test to confirm failure.**

Run:
```bash
pnpm vitest run tests/unit/content-routes.test.ts
```

Expected: FAIL because `useContentRoutes.ts` does not exist.

**Step 3: Implement route-based content aggregation.**

Create `src/composables/useContentRoutes.ts` to:
- read `useRouter().getRoutes()`
- filter markdown routes with frontmatter
- return typed entries for `post`, `book`, `project`, `page`, `chat`

Create `src/components/ListContent.vue` as the markdown-first replacement for `ListPage.vue`'s fetch logic.

**Step 4: Replace the posts list page.**

Modify `pages/posts/index.vue` to:
- stop importing `getAllPostsDirect`
- use `ListContent.vue`
- render metadata from route frontmatter

**Step 5: Make markdown pages own their detail routes.**

Delete:
- `pages/posts/[slug].vue`
- `src/components/DetailPage.vue`
- `src/composables/usePost.ts`

Keep `src/components/WrapperPost.vue` as the shared article shell and align it with the `antfu.me` model:
- title/date/draft UI comes from frontmatter
- anchor navigation stays in the wrapper
- back navigation stays in the wrapper

**Step 6: Re-run the route aggregation test.**

Run:
```bash
pnpm vitest run tests/unit/content-routes.test.ts
```

Expected: PASS.

### Task 5: Rewrite RSS and OG generation for markdown-first content

**Files:**
- Create: `src/content/files.ts`
- Create: `tests/unit/rss-content.test.ts`
- Modify: `scripts/rss.ts`
- Modify: `scripts/rss-dev.ts`
- Modify: `scripts/generate-xlog-og.ts`
- Modify: `package.json`

**Step 1: Write a failing RSS test.**

Create `tests/unit/rss-content.test.ts` asserting:
- markdown files under `pages/posts/*.md` are discovered
- frontmatter fields become feed item metadata
- local images and relative links are converted to absolute URLs
- drafts are excluded

**Step 2: Run the test to confirm failure.**

Run:
```bash
pnpm vitest run tests/unit/rss-content.test.ts
```

Expected: FAIL because the new markdown discovery helper does not exist.

**Step 3: Create a shared file-discovery helper.**

Create `src/content/files.ts` with helpers to:
- glob markdown files
- read frontmatter with `gray-matter`
- normalize content for scripts

Use it from both RSS and OG scripts.

**Step 4: Rewrite RSS scripts.**

Modify:
- `scripts/rss.ts`
- `scripts/rss-dev.ts`

Make them follow the `antfu.me` pattern:
- read local markdown from `pages/posts/*.md`
- optionally later expand to `pages/books/*.md`
- stop importing any Crossbell logic

**Step 5: Rewrite OG generation.**

Modify `scripts/generate-xlog-og.ts` to:
- stop calling GraphQL
- iterate local markdown files
- derive slug/title from frontmatter
- keep manifest-based skipping for unchanged content

If the filename no longer matches behavior after the rewrite, rename it to `scripts/generate-og.ts` in a follow-up commit once the migration is stable.

**Step 6: Re-run the RSS test.**

Run:
```bash
pnpm vitest run tests/unit/rss-content.test.ts
```

Expected: PASS.

### Task 6: Remove Crossbell/xLog runtime dependencies

**Files:**
- Delete: `src/logics/xlog-direct.ts`
- Delete: `src/logics/site.ts`
- Delete: `src/logics/useSiteInfo.ts`
- Delete: `pages/config.vue`
- Modify: `pages/chat.vue`
- Modify: `pages/projects.vue`
- Modify: `pages/books/index.vue`
- Modify: `src/logics/index.ts`
- Modify: `README.md`
- Modify: `src/types.ts`

**Step 1: Remove imports of xLog data helpers.**

Refactor all remaining pages that currently import:
- `getSiteInfoDirect`
- `getAllPostsDirect`
- `getBooksDirect`
- `getPortfolioDirect`
- `getPostsByTagDirect`

Replace them with one of:
- local markdown pages
- local site config
- temporary static placeholder content

For this migration pass:
- `chat` becomes a local page
- `projects` becomes a temporary local page or static data file
- `books` can remain as an empty-state page until content is imported

**Step 2: Remove the dead modules.**

Delete the xLog-specific modules once no imports remain.

**Step 3: Update public docs.**

Rewrite `README.md` so it no longer claims:
- xLog auto sync
- xLog handle configuration
- Crossbell GraphQL integration

Document:
- local markdown content
- `Articles/` importer
- which content sections are already migrated

### Task 7: Verify the markdown-first site end to end

**Files:**
- Modify: `docs/plans/2026-03-08-markdown-migration.md`

**Step 1: Run the focused tests.**

Run:
```bash
pnpm vitest run tests/unit/content-model.test.ts tests/unit/site-config.test.ts tests/unit/import-articles.test.ts tests/unit/content-routes.test.ts tests/unit/rss-content.test.ts
```

Expected: PASS.

**Step 2: Run lint.**

Run:
```bash
pnpm lint
```

Expected: PASS.

**Step 3: Run the production build.**

Run:
```bash
pnpm build
```

Expected:
- no Crossbell network calls
- RSS files generated from markdown
- OG files generated from markdown
- static pages compile successfully

**Step 4: Run preview and manually verify.**

Run:
```bash
pnpm preview
```

Manual checks:
- `/` renders the imported about content or new local homepage content
- `/posts` lists the imported blog entries
- several imported post detail pages render images from `/article-assets/...`
- no `/config` route remains
- RSS links point to local feeds

**Step 5: Document remaining follow-up work.**

Append a short note to this plan or create a follow-up plan covering:
- importing `books`
- replacing the temporary `projects` page
- replacing the temporary `chat` page
- reviewing skipped `Untitled` source files manually
