# API Contracts (Phase 1)

All responses use JSON. On error, respond with `{ error: { code, message, details? } }`.

## GET /api/signals
Query:
- `since` (ISO or relative `-24h`)
- Filters as query params: `status`, `source`, `type`, `minConfidence`, `timeframe`, `cursor?`

Response:
```ts
type SignalType = "buy" | "sell" | "long" | "short"
type SignalStatus = "active" | "filled" | "cancelled" | "expired"
interface Signal {
  id: string
  symbol: string
  type: SignalType
  price: number
  targetPrice?: number
  stopLoss?: number
  leverage?: number
  timeframe: string
  source: string
  confidence: number
  timestamp: string
  status: SignalStatus
  pnl?: number
}
interface SignalsResponse { items: Signal[]; nextCursor?: string }
```

Example:
```http
GET /api/signals?since=-24h&status=active&type=long&minConfidence=70
```

## POST /api/filters
Body:
```ts
interface CreateFilterRequest {
  name: string
  criteria: {
    status?: string[]
    sources?: string[]
    types?: SignalType[]
    minConfidence?: number
    timeframe?: string
  }
}
```
Response:
```ts
interface CreateFilterResponse { id: string; name: string; criteria: CreateFilterRequest["criteria"]; createdAt: string }
```

## GET /api/providers/stats
Query: `from`, `to` (ISO), optional `summary=true`

Response:
```ts
interface ProviderPerformance {
  source: string
  totalSignals: number
  winRate: number
  avgReturn: number
  totalPnL: number
  accuracy: number
  riskScore: number
}
interface ProviderStatsResponse { items: ProviderPerformance[] }
```

## POST /api/alerts
Body:
```ts
type SignalType = "buy" | "sell" | "long" | "short"
interface AlertSettings {
  email?: { enabled: boolean; address?: string }
  telegram?: { enabled: boolean; username?: string }
  browser?: { enabled: boolean }
  sms?: { enabled: boolean; phone?: string }
  rules: { minConfidence: number; types: SignalType[]; minLeverage?: number }
}
```
Response:
```ts
interface SaveAlertsResponse { saved: true; updatedAt: string }
```

## POST /api/connect/{provider}
Path: `{provider}` in [discord, telegram, twitter, premium]

Body:
```ts
interface ConnectProviderRequest {
  name: string
  credentials: Record<string, string>
  metadata?: Record<string, unknown>
}
```
Response:
```ts
type ProviderType = "discord" | "telegram" | "twitter" | "premium"
type ProviderStatus = "active" | "inactive" | "error"
interface ConnectProviderResponse { id: string; type: ProviderType; status: ProviderStatus }
```

## GET /api/me
Response:
```ts
interface Provider { id: string; name: string; type: ProviderType; status: ProviderStatus; signalCount: number; lastSignal: string; winRate: number }
interface User { id: string; name: string; email: string }
interface MeResponse { user: User; alerts: AlertSettings; providers: Provider[] }
```

Validation: Implement with `zod` in `lib/server/validation.ts`.
