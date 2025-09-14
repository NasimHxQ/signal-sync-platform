# Implementation Notes

## Conventions
- Route handlers in `app/api/*/route.ts`.
- Shared DTOs in `lib/server/types.ts`.
- Validation schemas in `lib/server/validation.ts` (zod).
- Services in `lib/server/services/*` with deterministic mock data in Phase 1.
- Errors in `lib/server/errors.ts`; logging in `lib/server/logger.ts`.

## Validation
- Validate query/body with zod.
- 400 on invalid input; include `details` for field errors.

## Error Envelope
```json
{ "error": { "code": "BadRequest", "message": "Invalid 'since'", "details": { "since": "Invalid format" } } }
```

## Logging
- JSON lines: `{ ts, level, reqId, path, method, durationMs, status, msg }`.
- Redact secrets and PII; assign `X-Request-Id` per request.

## Rate Limiting (Phase 1)
- Simple token bucket per IP+path in-memory.
- Upgrade later to durable store (e.g., Upstash/Redis) if needed.

## Security
- No CORS (same-origin).
- Input validation + output encoding; avoid reflecting raw input in messages.
- Plan for auth in Phase 3; stub `/api/me` with demo user in Phase 1.

## Testing
- Unit tests for each route and schema
- Aim 95% coverage for `lib/server` and `app/api`

## Config
- `.env.local` placeholders: `DATABASE_URL`, provider tokens.
- Do not log env var values.
