# SignalSync Backend Plan (Internal)

Purpose: Working notes for building the backend behind the existing Next.js UI. This evolves as we deliver phases. Not user-facing docs.

## Current State
- Next.js 14 app router; UI pages use mock data.
- No API routes yet. `zod` available for validation; SQLite planned.

## Target Architecture (incremental)
- Phase 1: Next.js route handlers (`app/api/*`) with mock/deterministic data.
- Phase 2: SQLite with ORM (Prisma preferred); services backed by DB.
- Phase 3: Auth, rate limiting, provider connectors (Discord/Telegram/Twitter/Premium).

```d2
// High-level flow: UI -> API -> services -> (DB/providers later)
UI_Dashboard -> API_Signals: "GET /api/signals?since&filters"
UI_Signals -> API_Signals: "GET /api/signals?since&filters"
UI_Analytics -> API_ProviderStats: "GET /api/providers/stats?from&to"
UI_Settings_Alerts -> API_Alerts: "POST /api/alerts"
UI_Settings_Sources -> API_Connect: "POST /api/connect/{provider}"
UI_Settings -> API_Me: "GET /api/me"

API_* -> ServiceLayer: validate, log, map DTOs
ServiceLayer -> DB: Phase 2
ServiceLayer -> ProviderConnectors: Phase 3
```

## Endpoints (Phase 1 scope)
- GET `/api/signals?since&filters`
- POST `/api/filters`
- GET `/api/providers/stats?from&to`
- POST `/api/alerts`
- POST `/api/connect/{provider}`
- GET `/api/me`

See `01-api-contracts.md` for contracts and examples.

## UI Mapping
- Dashboard/Signals pages: `/api/signals`
- Analytics: `/api/providers/stats`
- Settings > Alerts: `/api/alerts`
- Settings > Sources: `/api/connect/*`, `/api/me`

## Quality & Security
- Validation with `zod` at route boundary.
- Standard error envelope; minimal PII in logs; redact secrets.
- Simple in-memory rate limiting in Phase 1; stronger later.

## Phased Roadmap
- Phase 1: Stubs + wiring + schemas + logging.
- Phase 2: SQLite + ORM, migrate services.
- Phase 3: Auth, providers, rate limiting, observability.

Owner notes: Update `04-progress-log.md` after each meaningful change.
