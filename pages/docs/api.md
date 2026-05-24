---
title: API
slug: api
type: page
summary: Machine-readable and human-readable references for the site's checkout API.
---

# API

The site currently exposes one public API surface:

- `POST /functions/creem-checkout`

It creates a Creem checkout session through the server-side function in this repo. The machine-readable contract lives at [`/openapi/creem-checkout.openapi.json`](/openapi/creem-checkout.openapi.json).

## Health

- `GET /api/health`

Returns a small JSON health payload for discovery and status checks.
