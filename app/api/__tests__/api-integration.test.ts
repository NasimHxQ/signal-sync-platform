/**
 * @jest-environment node
 */

// Integration tests for API routes using direct service testing
// This approach tests the business logic without Next.js routing complexity

import { getSignals } from '@/lib/server/services/signals'
import { getProviderStats, connectProvider } from '@/lib/server/services/providers'
import { saveAlertSettings } from '@/lib/server/services/alerts'
import { getUserProfile } from '@/lib/server/services/user'
import { createFilter } from '@/lib/server/services/filters'
import { 
  SignalsQuerySchema, 
  CreateFilterSchema, 
  ProviderStatsQuerySchema, 
  AlertSettingsSchema, 
  ConnectProviderSchema,
  ProviderParamSchema 
} from '@/lib/server/validation'

describe('API Integration Tests', () => {
  describe('Signals API Logic', () => {
    it('should handle complete signals workflow', async () => {
      // Test the same logic that GET /api/signals uses
      const queryParams = {
        since: '-24h',
        status: 'active',
        minConfidence: '80',
        limit: '10',
      }
      
      // Validate query (same as route handler)
      const filters = SignalsQuerySchema.parse(queryParams)
      expect(filters.minConfidence).toBe(80)
      expect(filters.limit).toBe(10)
      
      // Get signals (same as route handler)
      const result = await getSignals(filters)
      
      expect(result).toHaveProperty('items')
      expect(Array.isArray(result.items)).toBe(true)
      expect(result.items.every(s => s.confidence >= 80)).toBe(true)
      expect(result.items.every(s => s.status === 'active')).toBe(true)
    })

    it('should handle invalid query parameters', () => {
      const invalidQuery = { minConfidence: '101' }
      
      expect(() => SignalsQuerySchema.parse(invalidQuery)).toThrow()
    })
  })

  describe('Provider Stats API Logic', () => {
    it('should handle provider stats workflow', async () => {
      const queryParams = { summary: 'true' }
      
      // Validate query
      const filters = ProviderStatsQuerySchema.parse(queryParams)
      expect(filters.summary).toBe(true)
      
      // Get stats
      const result = await getProviderStats(filters)
      
      expect(result).toHaveProperty('items')
      expect(Array.isArray(result.items)).toBe(true)
      expect(result.items.length).toBeLessThanOrEqual(3) // Summary mode
    })
  })

  describe('Alerts API Logic', () => {
    it('should handle alert settings workflow', async () => {
      const alertSettings = {
        email: { enabled: true, address: 'test@example.com' },
        rules: { minConfidence: 75, types: ['buy', 'long'] },
      }
      
      // Validate settings
      const validated = AlertSettingsSchema.parse(alertSettings)
      expect(validated.email?.enabled).toBe(true)
      expect(validated.rules.minConfidence).toBe(75)
      
      // Save settings
      const result = await saveAlertSettings(validated)
      
      expect(result.saved).toBe(true)
      expect(result.updatedAt).toBeDefined()
    })

    it('should reject invalid alert settings', () => {
      const invalidSettings = {
        email: { enabled: true, address: 'invalid-email' },
        rules: { minConfidence: 75, types: ['buy'] },
      }
      
      expect(() => AlertSettingsSchema.parse(invalidSettings)).toThrow()
    })
  })

  describe('Connect Provider API Logic', () => {
    it('should handle provider connection workflow', async () => {
      // Validate provider type
      const providerParam = ProviderParamSchema.parse({ provider: 'discord' })
      expect(providerParam.provider).toBe('discord')
      
      const connectionRequest = {
        name: 'Test Discord',
        credentials: { token: 'abc123' },
      }
      
      // Validate request
      const validated = ConnectProviderSchema.parse(connectionRequest)
      expect(validated.name).toBe('Test Discord')
      
      // Connect provider
      const result = await connectProvider(providerParam.provider, validated)
      
      expect(result).toHaveProperty('id')
      expect(result.type).toBe('discord')
      expect(['active', 'inactive', 'error']).toContain(result.status)
    })

    it('should reject invalid provider types', () => {
      expect(() => ProviderParamSchema.parse({ provider: 'invalid' })).toThrow()
    })
  })

  describe('User Profile API Logic', () => {
    it('should handle user profile workflow', async () => {
      const result = await getUserProfile()
      
      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('alerts')
      expect(result).toHaveProperty('providers')
      
      expect(result.user).toHaveProperty('id')
      expect(result.user).toHaveProperty('name')
      expect(result.user).toHaveProperty('email')
      
      expect(result.alerts).toHaveProperty('rules')
      expect(Array.isArray(result.providers)).toBe(true)
    })
  })

  describe('Filters API Logic', () => {
    it('should handle filter creation workflow', async () => {
      const filterRequest = {
        name: 'Test Filter',
        criteria: {
          types: ['long', 'buy'],
          minConfidence: 80,
          status: ['active'],
        },
      }
      
      // Validate request
      const validated = CreateFilterSchema.parse(filterRequest)
      expect(validated.name).toBe('Test Filter')
      
      // Create filter
      const result = await createFilter(validated)
      
      expect(result).toHaveProperty('id')
      expect(result.name).toBe('Test Filter')
      expect(result.criteria).toEqual(filterRequest.criteria)
      expect(result.createdAt).toBeDefined()
    })

    it('should reject invalid filter requests', () => {
      const invalidRequest = { criteria: {} } // Missing name
      
      expect(() => CreateFilterSchema.parse(invalidRequest)).toThrow()
    })
  })

  describe('End-to-End API Workflow Simulation', () => {
    it('should simulate complete user journey', async () => {
      // 1. User loads dashboard - gets profile
      const profile = await getUserProfile()
      expect(profile.user.id).toBeDefined()
      
      // 2. User views signals with filters
      const signalsResult = await getSignals({
        status: 'active',
        minConfidence: 70,
        limit: 10,
      })
      expect(signalsResult.items.length).toBeGreaterThan(0)
      
      // 3. User checks provider performance
      const statsResult = await getProviderStats({ summary: true })
      expect(statsResult.items.length).toBeGreaterThan(0)
      
      // 4. User creates a filter
      const filterResult = await createFilter({
        name: 'High Confidence',
        criteria: { minConfidence: 80 },
      })
      expect(filterResult.id).toBeDefined()
      
      // 5. User updates alert settings
      const alertResult = await saveAlertSettings({
        email: { enabled: true, address: profile.user.email },
        rules: { minConfidence: 75, types: ['buy', 'long'] },
      })
      expect(alertResult.saved).toBe(true)
      
      // 6. User connects a new provider
      const providerResult = await connectProvider('discord', {
        name: 'New Discord Server',
        credentials: { token: 'xyz789' },
      })
      expect(providerResult.id).toBeDefined()
    })
  })
})
