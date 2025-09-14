/**
 * @jest-environment node
 */

import { setupTestDb, teardownTestDb } from '../../__tests__/db-setup'
import { getSignals } from '../signals'
import { getProviderStats, getProviders, connectProvider } from '../providers'
import { getAlertSettings, saveAlertSettings } from '../alerts'
import { getUserProfile } from '../user'
import { createFilter, getFilters } from '../filters'

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDb()
  })

  afterAll(async () => {
    await teardownTestDb()
  })

  describe('Signals with Database', () => {
    it('should fetch signals from database', async () => {
      const result = await getSignals()
      
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.items[0]).toHaveProperty('id')
      expect(result.items[0]).toHaveProperty('symbol')
      expect(result.items[0]).toHaveProperty('source')
    })

    it('should filter signals by status', async () => {
      const activeSignals = await getSignals({ status: 'active' })
      
      expect(activeSignals.items.length).toBeGreaterThan(0)
      expect(activeSignals.items.every(s => s.status === 'active')).toBe(true)
    })

    it('should respect limit parameter', async () => {
      const result = await getSignals({ limit: 2 })
      
      expect(result.items.length).toBeLessThanOrEqual(2)
    })

    it('should filter by confidence', async () => {
      const highConfidenceSignals = await getSignals({ minConfidence: 80 })
      
      expect(highConfidenceSignals.items.every(s => s.confidence >= 80)).toBe(true)
    })
  })

  describe('Providers with Database', () => {
    it('should fetch providers from database', async () => {
      const result = await getProviders()
      
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('name')
      expect(result[0]).toHaveProperty('type')
    })

    it('should connect new provider to database', async () => {
      const result = await connectProvider('discord', {
        name: 'Test Discord Server',
        credentials: { token: 'test_token' },
      })
      
      expect(result).toHaveProperty('id')
      expect(result.type).toBe('discord')
      expect(result.status).toBe('active')
      
      // Verify it was saved to database
      const providers = await getProviders()
      const newProvider = providers.find(p => p.id === result.id)
      expect(newProvider).toBeDefined()
      expect(newProvider?.name).toBe('Test Discord Server')
    })

    it('should calculate provider stats from database', async () => {
      const result = await getProviderStats()
      
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.items[0]).toHaveProperty('source')
      expect(result.items[0]).toHaveProperty('totalSignals')
      expect(result.items[0]).toHaveProperty('winRate')
    })
  })

  describe('Alerts with Database', () => {
    it('should load alert settings from database', async () => {
      const result = await getAlertSettings()
      
      expect(result).toHaveProperty('rules')
      expect(result.rules).toHaveProperty('minConfidence')
      expect(result.rules).toHaveProperty('types')
    })

    it('should save alert settings to database', async () => {
      const newSettings = {
        email: { enabled: false, address: 'new@example.com' },
        rules: { minConfidence: 85, types: ['sell', 'short'] as const },
      }
      
      const result = await saveAlertSettings(newSettings)
      
      expect(result.saved).toBe(true)
      
      // Verify settings were saved
      const savedSettings = await getAlertSettings()
      expect(savedSettings.email?.enabled).toBe(false)
      expect(savedSettings.rules.minConfidence).toBe(85)
    })
  })

  describe('User Profile with Database', () => {
    it('should load complete user profile from database', async () => {
      const result = await getUserProfile()
      
      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('alerts')
      expect(result).toHaveProperty('providers')
      
      expect(result.user.email).toBe('demo@signalsync.app')
      expect(result.providers.length).toBeGreaterThan(0)
    })
  })

  describe('Filters with Database', () => {
    it('should create and retrieve filters from database', async () => {
      const filterRequest = {
        name: 'High Confidence Filter',
        criteria: {
          minConfidence: 80,
          types: ['long', 'buy'],
          status: ['active'],
        },
      }
      
      const created = await createFilter(filterRequest)
      
      expect(created).toHaveProperty('id')
      expect(created.name).toBe('High Confidence Filter')
      
      // Verify it was saved
      const filters = await getFilters()
      const savedFilter = filters.find(f => f.id === created.id)
      expect(savedFilter).toBeDefined()
      expect(savedFilter?.name).toBe('High Confidence Filter')
    })
  })

  describe('End-to-End Database Workflow', () => {
    it('should handle complete user journey with database', async () => {
      // 1. Load user profile
      const profile = await getUserProfile()
      expect(profile.user.id).toBeDefined()
      
      // 2. Get signals with filtering
      const signals = await getSignals({ status: 'active', limit: 5 })
      expect(signals.items.length).toBeGreaterThan(0)
      
      // 3. Get provider stats
      const stats = await getProviderStats({ summary: true })
      expect(stats.items.length).toBeGreaterThan(0)
      
      // 4. Create a filter
      const filter = await createFilter({
        name: 'Integration Test Filter',
        criteria: { minConfidence: 75 },
      })
      expect(filter.id).toBeDefined()
      
      // 5. Update alert settings
      const alertResult = await saveAlertSettings({
        email: { enabled: true, address: profile.user.email },
        rules: { minConfidence: 80, types: ['buy'] },
      })
      expect(alertResult.saved).toBe(true)
      
      // 6. Connect a new provider
      const providerResult = await connectProvider('premium', {
        name: 'Integration Test Provider',
        credentials: { apiKey: 'test_key' },
      })
      expect(providerResult.id).toBeDefined()
      
      // Verify all operations persisted
      const updatedProfile = await getUserProfile()
      expect(updatedProfile.providers.length).toBeGreaterThan(profile.providers.length)
      
      const updatedFilters = await getFilters()
      expect(updatedFilters.some(f => f.name === 'Integration Test Filter')).toBe(true)
    })
  })
})
