---
title: API
slug: api
type: page
summary: Machine-readable and human-readable references for the site's checkout API.
---

# API

The site currently exposes two public, unauthenticated API surfaces:

- `POST /functions/creem-checkout`
- `GET /api/health`

The checkout endpoint creates a Creem checkout session through the server-side function in this repo. The machine-readable contract lives at [`/openapi/creem-checkout.openapi.json`](/openapi/creem-checkout.openapi.json).

## Health

- `GET /api/health`

Returns a small JSON health payload for discovery and status checks.

## Authentication and discovery

This site does not currently publish OAuth/OIDC discovery metadata such as `/.well-known/openid-configuration` or `/.well-known/oauth-authorization-server`, because it does not currently run its own OAuth authorization server, token endpoint, or JWKS endpoint.

It also does not currently publish an MCP Server Card at `/.well-known/mcp/server-card.json`, because the repository exposes browser-side WebMCP helpers through `navigator.modelContext` rather than a standalone MCP server transport endpoint.

Agents should use the existing public discovery surface instead:

- `/.well-known/api-catalog`
- `/openapi/creem-checkout.openapi.json`
- `/docs/api`
- `/.well-known/agent-skills/index.json`
