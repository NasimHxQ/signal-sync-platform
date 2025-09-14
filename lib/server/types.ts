// Shared DTOs and types for the server-side API

export type SignalType = "buy" | "sell" | "long" | "short"
export type SignalStatus = "active" | "filled" | "cancelled" | "expired"
export type ProviderType = "discord" | "telegram" | "twitter" | "premium"
export type ProviderStatus = "active" | "inactive" | "error"

export interface Signal {
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

export interface Provider {
  id: string
  name: string
  type: ProviderType
  status: ProviderStatus
  signalCount: number
  lastSignal: string
  winRate: number
}

export interface ProviderPerformance {
  source: string
  totalSignals: number
  winRate: number
  avgReturn: number
  totalPnL: number
  accuracy: number
  riskScore: number
}

export interface User {
  id: string
  name: string
  email: string
  firstName?: string
  lastName?: string
  timezone?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  display: {
    darkMode: boolean
    compactView: boolean
    defaultCurrency: 'usd' | 'eur' | 'btc' | 'eth'
  }
  trading: {
    defaultRiskLevel: 'low' | 'medium' | 'high'
    autoFollowSignals: boolean
  }
}

export interface AlertSettings {
  email?: { enabled: boolean; address?: string }
  telegram?: { enabled: boolean; username?: string }
  browser?: { enabled: boolean }
  sms?: { enabled: boolean; phone?: string }
  rules: {
    minConfidence: number
    types: SignalType[]
    minLeverage?: number
  }
}

// API Request/Response types
export interface SignalsResponse {
  items: Signal[]
  nextCursor?: string
}

export interface CreateFilterRequest {
  name: string
  criteria: {
    status?: string[]
    sources?: string[]
    types?: SignalType[]
    minConfidence?: number
    timeframe?: string
  }
}

export interface CreateFilterResponse {
  id: string
  name: string
  criteria: CreateFilterRequest["criteria"]
  createdAt: string
}

export interface ProviderStatsResponse {
  items: ProviderPerformance[]
}

export interface SaveAlertsResponse {
  saved: true
  updatedAt: string
}

export interface ConnectProviderRequest {
  name: string
  credentials: Record<string, string>
  metadata?: Record<string, unknown>
}

export interface ConnectProviderResponse {
  id: string
  type: ProviderType
  status: ProviderStatus
}

export interface MeResponse {
  user: User
  alerts: AlertSettings
  providers: Provider[]
}

// Account update types
export interface UpdateAccountRequest {
  firstName?: string
  lastName?: string
  email?: string
  timezone?: string
}

export interface UpdateAccountResponse {
  user: User
  updated: true
  updatedAt: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UpdatePasswordResponse {
  updated: true
  updatedAt: string
}

// User preferences types
export interface UpdatePreferencesRequest {
  display?: {
    darkMode?: boolean
    compactView?: boolean
    defaultCurrency?: 'usd' | 'eur' | 'btc' | 'eth'
  }
  trading?: {
    defaultRiskLevel?: 'low' | 'medium' | 'high'
    autoFollowSignals?: boolean
  }
}

export interface UpdatePreferencesResponse {
  preferences: UserPreferences
  updated: true
  updatedAt: string
}

// Error types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ErrorResponse {
  error: ApiError
}