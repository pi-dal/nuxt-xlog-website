# Agent Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add truthful agent-readiness support for sitemap publishing, robots metadata, API discovery metadata, Link headers, markdown negotiation, and browser-exposed WebMCP tools.

**Architecture:** Keep static discovery artifacts build-driven from the same local Markdown content model that powers the site, and use Cloudflare Pages Functions only for response-layer concerns that static hosting cannot express cleanly. Avoid inventing OAuth or MCP server metadata unless the repository actually exposes those capabilities.

**Tech Stack:** Vite SSG, Vue 3, Cloudflare Pages Functions, TypeScript, Vitest, pnpm

### Task 1: Lock down the publishing surface with failing tests

**Files:**
- Modify: `tests/unit/publishing-surface.test.ts`
- Create: `tests/unit/agent-readiness.test.ts`

**Step 1:** Extend publishing-surface coverage so sitemap expectations include standalone markdown pages and discovery metadata files.

**Step 2:** Add worker-facing tests for homepage `Link` headers, `Accept: text/markdown` negotiation, and well-known discovery responses.

**Step 3:** Run `pnpm test tests/unit/publishing-surface.test.ts tests/unit/agent-readiness.test.ts` and confirm failure.

### Task 2: Extract build helpers for canonical URLs and agent metadata

**Files:**
- Create: `src/logics/agent-readiness.ts`
- Modify: `scripts/rss.ts`
- Modify: `src/content/files.ts`

**Step 1:** Add filesystem helpers that enumerate canonical public routes from Markdown and routable Vue pages.

**Step 2:** Reuse those helpers from the sitemap generator so `/sitemap.xml` is derived from the real publishing surface.

**Step 3:** Add helpers for markdown negotiation manifests and well-known metadata payloads.

### Task 3: Generate static discovery assets during publish

**Files:**
- Create: `scripts/generate-agent-artifacts.ts`
- Modify: `package.json`
- Modify: `public/robots.txt`
- Create: `public/.well-known/agent-skills/*.md`
- Create: `public/.well-known/agent-skills/index.json`
- Create: `public/openapi/creem-checkout.openapi.json`
- Create: `pages/docs/api.md`

**Step 1:** Generate build-time artifacts for markdown negotiation and agent-skills discovery from source content.

**Step 2:** Add Content Signals to `robots.txt` without regressing the sitemap reference.

**Step 3:** Publish human docs and machine-readable OpenAPI material for the existing checkout function.

### Task 4: Add Cloudflare response behavior

**Files:**
- Create: `functions/_middleware.js`
- Create: `functions/.well-known/api-catalog.js`
- Create: `functions/api/health.js`

**Step 1:** Add homepage `Link` headers for `api-catalog`, `service-desc`, `service-doc`, and `describedby`.

**Step 2:** Implement `Accept: text/markdown` handling that returns markdown with `Content-Type: text/markdown` and `x-markdown-tokens`.

**Step 3:** Serve `/.well-known/api-catalog` with `application/linkset+json`.

### Task 5: Expose browser tools for WebMCP

**Files:**
- Create: `src/logics/webmcp.ts`
- Modify: `src/main.ts`

**Step 1:** Register a minimal truthful tool set on page load when `navigator.modelContext` is available.

**Step 2:** Expose high-signal site actions such as listing recent content, reading route metadata, and navigating to a route.

### Task 6: Verify end to end

**Files:**
- Modify: `README.md`

**Step 1:** Run targeted tests until green.

**Step 2:** Run `pnpm lint`, `pnpm test`, and `pnpm build`.

**Step 3:** Inspect generated `dist/` artifacts and summarize any intentionally unimplemented items such as OAuth discovery or MCP server cards if the repo still has no real backing service for them.
