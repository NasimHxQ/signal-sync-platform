import { z } from "zod"

// Base types
export const SignalTypeSchema = z.enum(["buy", "sell", "long", "short"])
export const SignalStatusSchema = z.enum(["active", "filled", "cancelled", "expired"])
export const ProviderTypeSchema = z.enum(["discord", "telegram", "twitter", "premium"])

// GET /api/signals validation
export const SignalsQuerySchema = z.object({
  since: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  type: SignalTypeSchema.optional(),
  minConfidence: z.coerce.number().min(0).max(100).optional(),
  timeframe: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
})

// POST /api/filters validation
export const CreateFilterSchema = z.object({
  name: z.string().min(1).max(100),
  criteria: z.object({
    status: z.array(z.string()).optional(),
    sources: z.array(z.string()).optional(),
    types: z.array(SignalTypeSchema).optional(),
    minConfidence: z.number().min(0).max(100).optional(),
    timeframe: z.string().optional(),
  }),
})

// GET /api/providers/stats validation
export const ProviderStatsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  summary: z.coerce.boolean().optional().default(false),
})

// POST /api/alerts validation
export const AlertSettingsSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    address: z.string().email().optional(),
  }).optional(),
  telegram: z.object({
    enabled: z.boolean(),
    username: z.string().optional(),
  }).optional(),
  browser: z.object({
    enabled: z.boolean(),
  }).optional(),
  sms: z.object({
    enabled: z.boolean(),
    phone: z.string().optional(),
  }).optional(),
  rules: z.object({
    minConfidence: z.number().min(0).max(100),
    types: z.array(SignalTypeSchema),
    minLeverage: z.number().min(1).max(100).optional(),
  }),
})

// POST /api/connect/{provider} validation
export const ConnectProviderSchema = z.object({
  name: z.string().min(1).max(100),
  credentials: z.record(z.string()),
  metadata: z.record(z.unknown()).optional(),
})

export const ProviderParamSchema = z.object({
  provider: ProviderTypeSchema,
})

// PATCH /api/me validation (account updates)
export const UpdateAccountSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  timezone: z.string().min(1).max(50).optional(),
})

// POST /api/me/password validation
export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
})

// PATCH /api/me/preferences validation
export const UpdatePreferencesSchema = z.object({
  display: z.object({
    darkMode: z.boolean().optional(),
    compactView: z.boolean().optional(),
    defaultCurrency: z.enum(['usd', 'eur', 'btc', 'eth']).optional(),
  }).optional(),
  trading: z.object({
    defaultRiskLevel: z.enum(['low', 'medium', 'high']).optional(),
    autoFollowSignals: z.boolean().optional(),
  }).optional(),
})

// Utility function to validate and parse request data
export function validateQuery<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`)
  }
  return result.data
}

export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`)
  }
  return result.data
}
