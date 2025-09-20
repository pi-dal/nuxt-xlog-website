<!-- prettier-ignore-start -->
# Repository Guidelines

## Project Structure & Module Organization
The site is built with Vite, Vue 3, and vite-ssg. Routable views live in `pages/`, mirroring the public URL structure (for example `pages/posts/[slug].vue` for posts and `pages/config.vue` for the configuration wizard). Shared UI belongs in `src/components/`, while domain logic sits in `src/logics/` (notably `xlog.ts` for API access and `site.ts` for configuration). State is managed under `src/store/`, composables under `src/composables/`, and design tokens in `src/styles/`. Build and content automation (OG images, RSS, font copying) reside in `scripts/`. Static assets live in `public/`, and curated media is organized through `photos/` and `data/`. Serverless hooks such as `functions/creem-checkout.js` deploy with Cloudflare or Netlify.

## Build, Test, and Development Commands
Run `pnpm dev` to launch the Vite dev server on `http://localhost:3333`; the script seeds RSS via `scripts/rss-dev.ts` before the server boots. Use `pnpm build` for the full static pipeline (OG images, vite-ssg prerender, font copying, RSS, redirects) and `pnpm preview` to review the production build. Run `pnpm lint` to apply ESLint and formatting. Media helpers include `pnpm compress` for staged image compression and `pnpm photos` for the photo catalogue tool.

## Coding Style & Naming Conventions
Stick with TypeScript across `src/` and supporting scripts. Follow Vue SFC conventions with `<script setup lang="ts">` and two-space indentation. Components and composables use PascalCase filenames; utilities in `src/logics/` prefer kebab-case. ESLint is configured through `@antfu/eslint-config`; rely on `pnpm lint -- --fix` or the pre-commit hook (`lint-staged`) to resolve violations. Keep UnoCSS utility classes expressive yet minimal and prefer design tokens instead of raw hex values.

## Testing Guidelines
Automated unit tests are not yet established, so rely on manual verification. Before opening a PR, confirm `pnpm lint`, `pnpm build`, and a fresh `pnpm preview`. Smoke-test the generated site in both light and dark modes, verify pagination beyond page six, and run the configuration wizard with a live xLog handle to catch API regressions.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (`feat:`, `fix:`, `chore:`) with concise imperatives and optional scopes (see `fix: add horizontal scrolling for long LaTeX formulas`). PRs should cover the problem statement, change summary, screenshots or GIFs for UI work, dark/light theme verification, and links to related issues or xLog threads. Call out any scripts that need rerunning and note follow-up tasks for reviewers.
<!-- prettier-ignore-end -->
