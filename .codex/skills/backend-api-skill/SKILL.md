---
name: backend-api-skill
description: Implement or update frontend code by inspecting the live backend OpenAPI/Swagger spec exposed by the local backend, especially when asked to build frontend features from the current backend API spec, wire API clients, create pages/forms/list/detail flows, or adjust existing UI only where required. Use for prompts such as implementing frontend from the running backend API, referencing Swagger at localhost:8083 or localhost:8000, or validating that the resulting React app builds and starts successfully.
---

# Backend API Skill

## Overview

Implement frontend changes against the currently running backend API instead of guessing contracts. Prefer the live OpenAPI spec as the source of truth, preserve existing project patterns, and only modify already-implemented API flows when the new backend contract requires it.

## Workflow

1. Find the active Swagger UI from these preferred URLs:
   - `http://localhost:8083/api/contracts/swagger-ui/index.html`
   - `http://localhost:8000/api/contracts/swagger-ui/index.html`
2. Derive the underlying OpenAPI JSON or YAML from the Swagger UI rather than relying on screenshots or page text alone.
3. Inspect the existing frontend structure before editing:
   - `src/api/`
   - `src/pages/`
   - `src/components/`
   - routing and auth flow in `src/App.js`, `src/index.js`, and related context files
4. Implement only the missing or contract-breaking frontend pieces required by the backend spec.
5. Verify the result:
   - run a production build
   - start the app when runtime verification is required and confirm it boots cleanly
6. Report what was implemented, what was verified, and any remaining backend or environment blockers.

## Contract Discovery

- First try the two known Swagger UI URLs.
- If one host is down, try the other immediately.
- From Swagger UI, locate the actual OpenAPI document URL. Common patterns include:
  - `/v3/api-docs`
  - `/v3/api-docs.yaml`
  - `/api-docs`
  - a `swagger-config` response that points to the spec URL
- Prefer the machine-readable OpenAPI document over manual inspection of the rendered UI.
- If both known hosts are unavailable, stop and report that the live backend spec could not be reached.

For concrete discovery patterns and implementation rules, read [references/openapi-workflow.md](./references/openapi-workflow.md).

## Implementation Rules

- Treat the live OpenAPI contract as authoritative for request paths, methods, params, headers, and response shapes.
- Reuse existing axios setup and auth/token refresh behavior from `src/api/api.js` unless the backend contract forces a change.
- Keep new API wrappers and page logic aligned with the repository structure and naming conventions.
- Change existing API integrations only when needed:
  - the contract changed
  - a shared abstraction is required for the new feature
  - the current implementation is clearly incompatible with the live spec
- Avoid broad refactors unrelated to the requested backend-backed feature.
- When the contract is ambiguous or the backend behavior differs from the spec, document the mismatch explicitly.

## Validation

- Always run `npm run build` after implementation.
- When the request includes execution/runtime confirmation, also run `npm start` and verify the dev server boots without immediate errors.
- If runtime verification is blocked by environment issues such as occupied ports, missing `.env`, or unavailable backend servers, report the exact blocker.
- Do not claim completion without stating which checks actually ran.

## Project Notes

- This repository is a React app using `react-app-rewired`.
- Main commands:
  - `npm start`
  - `npm run build`
  - `npm test`
- Existing API access is centralized around `src/api/api.js`.
- Prefer incremental feature work over introducing a new client architecture unless the codebase already supports it.
