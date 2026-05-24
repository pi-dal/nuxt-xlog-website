# OAuth and MCP Discovery Metadata Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish OAuth/OIDC discovery metadata, OAuth protected-resource metadata, and an MCP server card at the standard `.well-known` locations.

**Architecture:** Keep the discovery surface as Cloudflare Pages Functions under `functions/.well-known/` so the published JSON is served directly from the same origin as the site. Reuse `src/site/config.ts` as the single source of truth for the site URL and keep the payloads intentionally minimal and internally consistent.

**Tech Stack:** Cloudflare Pages Functions, TypeScript/JavaScript, Vitest, pnpm

### Task 1: Write the failing discovery tests

**Files:**
- Create: `tests/unit/discovery-metadata.test.ts`

**Step 1: Write the failing tests**

Add tests that import each `.well-known` function and assert the response is JSON with the expected required fields:
- `/.well-known/openid-configuration`
- `/.well-known/oauth-authorization-server`
- `/.well-known/oauth-protected-resource`
- `/.well-known/mcp/server-card.json`
- `/.well-known/jwks.json` if the OIDC metadata points there

**Step 2: Run the tests to verify they fail**

Run: `pnpm test tests/unit/discovery-metadata.test.ts`
Expected: FAIL because the function modules do not exist yet.

### Task 2: Implement the discovery endpoints

**Files:**
- Create: `functions/.well-known/openid-configuration.js`
- Create: `functions/.well-known/oauth-authorization-server.js`
- Create: `functions/.well-known/oauth-protected-resource.js`
- Create: `functions/.well-known/mcp/server-card.json.js`
- Create: `functions/.well-known/jwks.json.js`

**Step 1: Add minimal JSON responses**

Each handler should return `200` with `Content-Type: application/json; charset=utf-8` and CORS headers where appropriate.

**Step 2: Keep the documents consistent**

Use the site URL from `src/site/config.ts` and keep issuer/resource identifiers, endpoints, and scopes aligned across all metadata documents.

### Task 3: Verify the published surface

**Files:**
- Modify: `docs/plans/2026-05-24-agent-readiness.md` if needed to note the new endpoints

**Step 1: Run the focused tests**

Run: `pnpm test tests/unit/discovery-metadata.test.ts`
Expected: PASS.

**Step 2: Run a broader sanity check**

Run: `pnpm lint`
Expected: PASS or only unrelated pre-existing issues.

**Step 3: Inspect the final files**

Confirm the `.well-known` routes are present and the JSON is stable enough for agents to discover.
