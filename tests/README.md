# Test Strategy

This directory covers the markdown-first site model and its build helpers.

## Goals

1. Lock down the shared content types and site configuration.
2. Verify route-derived content lists for posts and books.
3. Verify the legacy `Articles/` importer before future content migrations.
4. Verify Markdown-driven RSS generation and related file loaders.
5. Keep script-level regressions catchable without relying on the full build.

## Structure

- `tests/fixtures/` contains small legacy article samples and asset fixtures.
- `tests/unit/` contains unit tests for content typing, route extraction, import behavior, RSS helpers, and site metadata.

## Current Coverage

- `content-model.test.ts` validates content type normalization.
- `site-config.test.ts` validates the local site configuration contract.
- `content-routes.test.ts` validates route frontmatter extraction and sorting.
- `import-articles.test.ts` validates legacy article import and asset rewriting.
- `rss-content.test.ts` validates Markdown file loading for feed generation.
- `site-meta.test.ts` validates canonical URL and author handle helpers.

## Verification Commands

```bash
pnpm test
pnpm test:coverage
```

For release-level verification, also run:

```bash
pnpm lint
pnpm typecheck
pnpm build
```
