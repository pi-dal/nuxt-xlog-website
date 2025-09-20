# Test Strategy

This document tracks the testing plan as we introduce a Vitest-based automated suite.

## Goals

1. Lock down pure utilities (URL resolution, cache helpers) with unit tests.
2. Simulate xLog GraphQL fetch flows with mocked responses to validate caching and error paths.
3. Provide coverage insight (via `vitest --coverage`) to guide future work.

## Structure

- `tests/setup/` – shared harness (msw, env shims) to reuse across specs.
- `tests/unit/` – pure function / cache tests, no network.
- `tests/integration/` – mocked GraphQL requests, verifying xlog-direct behavior.

## Immediate Next Steps

- [ ] Add `tests/setup/msw.ts` to register a default MSW server (no handlers yet).
- [ ] Write unit tests for `src/logics/site-meta.ts` (resolveSiteUrl, buildAbsoluteUrl, resolveAuthorHandle).
- [ ] Write unit tests for `src/logics/cache.ts` (withCache, cacheManager TTL behavior).
- [ ] Add MSW handlers covering `GET_SITE_QUERY`, `GET_POSTS_QUERY`; assert caching and transformation logic.

Keep this document updated as new suites or helpers are added.
