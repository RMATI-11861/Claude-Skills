---
name: http-apis
description: "Designs HTTP APIs and resilient API clients with proper status codes, RFC 9457 errors, pagination, idempotency, retries."
---

# HTTP APIs

Follow the project's existing conventions first; apply these defaults where none exist.

## Designing an API
1. **Contract first.** Write or update the OpenAPI fragment (or typed schema) and review it before any handler.
2. **Resources and methods.** Plural nouns (`/orders/{id}`). GET is safe; PUT and DELETE are idempotent; POST creates; PATCH updates partially.
3. **Status codes.** 200, 201 with `Location`, 204; 400 malformed, 401 unauthenticated, 403 forbidden, 404, 409 conflict, 422 validation, 429 with `Retry-After`; 5xx only for server faults.
4. **Errors.** RFC 9457 `application/problem+json` with `type`, `title`, `status`, `detail`, `instance` and field errors. Never leak stack traces.
5. **Lists.** Cursor pagination (`?limit=&cursor=`, `next_cursor` in the response), a stable sort and a maximum `limit`.
6. **Idempotency.** Accept an `Idempotency-Key` header on POSTs that clients may retry, and store the result per key.
7. **Security.** Authenticate every route, check object-level authorization (the caller may access this id), validate and bound all input at the edge, rate-limit.
8. **Evolution.** Only additive changes in place. A breaking change needs a new version, `Deprecation` and `Sunset` headers on the old one, and a list of affected consumers.

## Calling an API
- Set a timeout on every request.
- Retry only idempotent requests, on network errors, 429 and 503, with exponential backoff and jitter; honor `Retry-After`; cap the attempts.
- Read problem+json errors and surface `detail` in messages.
- Keep credentials in environment variables or a secret store; never log tokens or bodies with personal data.

Client snippets (Node and PowerShell 5.1): [references/clients.md](references/clients.md).
