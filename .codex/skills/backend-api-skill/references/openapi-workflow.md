# OpenAPI Workflow

## Goal

Implement frontend code from the currently running backend OpenAPI spec with minimal unnecessary change to the existing React project.

## Source Priority

1. Live OpenAPI document behind Swagger UI on `localhost:8083`
2. Live OpenAPI document behind Swagger UI on `localhost:8000`
3. Existing frontend code patterns in this repository
4. User prompt details

Do not invert this order. The live contract wins over assumptions and stale frontend code.

## How to Extract the Spec

1. Open the Swagger UI page.
2. Inspect the page source or network references to find the backing spec URL.
3. Fetch the OpenAPI JSON or YAML.
4. Work from the raw contract:
   - paths
   - operation ids
   - parameters
   - request bodies
   - response schemas
   - auth requirements

If the UI is reachable but the spec URL is not obvious, look for:

- `swagger-config`
- `urls`
- `configUrl`
- `url:`
- `/v3/api-docs`

## Frontend Mapping Checklist

- Identify which screens the contract implies:
  - list
  - detail
  - create
  - update
  - delete
  - search/filter
- Check whether a similar page already exists under `src/pages/`.
- Add or update API functions with the existing axios instance.
- Preserve auth handling and request interceptors.
- Match request payload field names exactly to the OpenAPI schema.
- Handle empty, loading, success, and error states in the UI.
- Wire navigation and routes only when the feature requires them.

## Editing Boundaries

- Prefer targeted edits over architectural cleanup.
- Do not rewrite unrelated pages just to unify style.
- If an existing implementation is close, adapt it instead of rebuilding from scratch.
- If the backend exposes an already implemented endpoint, leave it alone unless the current frontend is incompatible with the live contract.

## Validation Checklist

- Run `npm run build`.
- When asked to verify execution, run `npm start` and confirm startup succeeds.
- If possible, verify the new or changed screen against the running backend.
- Record any gaps caused by missing auth, test data, or backend failures.
