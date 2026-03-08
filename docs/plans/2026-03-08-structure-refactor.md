# Structure Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate shared app state and markdown configuration, remove duplicated page shell responsibilities, and restore reliable typechecking for the xLog website.

**Architecture:** Centralize xLog configuration and site info into one module that owns the current handle and cache lifecycle. Extract markdown-it configuration into one shared pipeline used by both runtime rendering and Vite markdown compilation. Simplify page components so app-shell concerns live in shared components instead of being reimplemented per page.

**Tech Stack:** Vue 3, Vite, vite-ssg, Vitest, TypeScript, markdown-it, Shiki

### Task 1: Lock down shared boundaries with tests

**Files:**

- Create: `tests/unit/site-state.test.ts`
- Create: `tests/unit/markdown-pipeline.test.ts`

**Step 1:** Write failing tests for unified site-state behavior.
**Step 2:** Run `pnpm test tests/unit/site-state.test.ts` and confirm failure.
**Step 3:** Write failing tests for shared markdown pipeline behavior.
**Step 4:** Run `pnpm test tests/unit/markdown-pipeline.test.ts` and confirm failure.

### Task 2: Unify xLog handle and site info state

**Files:**

- Create: `src/logics/site-state.ts`
- Modify: `src/logics/site.ts`
- Modify: `src/logics/useSiteInfo.ts`
- Modify: `src/logics/xlog-direct.ts`
- Modify: `pages/config.vue`
- Modify: `pages/index.vue`
- Modify: `src/components/Logo.vue`

**Step 1:** Introduce one module that owns the configured handle, pending state, cached site info, and cache reset.
**Step 2:** Update API helpers to accept an explicit `handle` override instead of mutating `localStorage`.
**Step 3:** Point legacy imports at the new state module so existing callers converge on one source of truth.
**Step 4:** Re-run the new site-state tests and make them pass.

### Task 3: Extract a shared markdown pipeline

**Files:**

- Create: `src/logics/markdown-pipeline.ts`
- Modify: `src/logics/markdown.ts`
- Modify: `vite.config.ts`
- Modify: `src/composables/useMarkdownRenderer.ts`
- Modify: `src/types.ts`
- Modify: `src/components/Toc.vue`
- Modify: `src/components/TocItem.vue`

**Step 1:** Move markdown-it plugin setup into a reusable shared module.
**Step 2:** Export shared TOC types from a TS module instead of importing types from `.vue` files.
**Step 3:** Update runtime and build-time markdown setup to consume the same pipeline.
**Step 4:** Re-run the markdown pipeline tests and make them pass.

### Task 4: Simplify shell-level UI responsibilities

**Files:**

- Create: `src/components/PageBackLink.vue`
- Modify: `src/App.vue`
- Modify: `src/components/WrapperPost.vue`
- Modify: `src/components/ListPage.vue`
- Modify: `src/components/DetailPage.vue`
- Modify: `pages/chat.vue`
- Modify: `pages/config.vue`
- Modify: `pages/projects.vue`
- Modify: `pages/index.vue`

**Step 1:** Remove duplicated background-art rendering from page-level components.
**Step 2:** Replace repeated `cd ..` footer snippets with one reusable component.
**Step 3:** Keep route-specific behavior explicit where it differs from the default.

### Task 5: Restore engineering guardrails

**Files:**

- Modify: `package.json`
- Modify: `shims.d.ts`
- Modify: `src/logics/analytics.ts`
- Modify: `src/logics/creem.ts`
- Modify: `src/logics/errors.ts`
- Modify: `scripts/og.ts`

**Step 1:** Add a project typecheck command and missing Vue module declarations.
**Step 2:** Fix the current TypeScript errors surfaced by `pnpm exec tsc --noEmit`.
**Step 3:** Remove the hardcoded Creem API key fallback.

### Task 6: Verify the refactor

**Files:**

- Modify: `tests/README.md`

**Step 1:** Run targeted tests.
**Step 2:** Run `pnpm lint`.
**Step 3:** Run `pnpm exec tsc --noEmit`.
**Step 4:** Run `pnpm build`.
**Step 5:** Update testing notes if the verification shape changed.
