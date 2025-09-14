import { getProviderStats, getProviders, connectProvider } from '../providers'
import { createMockProviderPerformance, createMockProvider } from '../../__tests__/test-utils'

describe('Providers Service', () => {
  describe('getProviderStats', () => {
    it('should return all provider performance stats', async () => {
      const result = await getProviderStats()
      
      expect(result.items).toHaveLength(5) // Based on mock data
      expect(result.items[0]).toHaveProperty('source')
      expect(result.items[0]).toHaveProperty('totalSignals')
      expect(result.items[0]).toHaveProperty('winRate')
      expect(result.items[0]).toHaveProperty('avgReturn')
      expect(result.items[0]).toHaveProperty('totalPnL')
      expect(result.items[0]).toHaveProperty('accuracy')
      expect(result.items[0]).toHaveProperty('riskScore')
    })

    it('should return top performers when summary is requested', async () => {
      const result = await getProviderStats({ summary: true })
      
      expect(result.items).toHaveLength(3) // Top 3 performers
      
      // Should be sorted by win rate descending
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i].winRate).toBeLessThanOrEqual(result.items[i - 1].winRate)
      }
    })

    it('should handle date filters (Phase 1: ignored)', async () => {
      const result = await getProviderStats({
        from: '2024-01-01',
        to: '2024-01-31',
      })
      
      // In Phase 1, date filters are ignored but should not error
      expect(result.items.length).toBeGreaterThan(0)
    })

    it('should return consistent data structure', async () => {
      const result = await getProviderStats()
      
      result.items.forEach(item => {
        expect(typeof item.source).toBe('string')
        expect(typeof item.totalSignals).toBe('number')
        expect(typeof item.winRate).toBe('number')
        expect(typeof item.avgReturn).toBe('number')
        expect(typeof item.totalPnL).toBe('number')
        expect(typeof item.accuracy).toBe('number')
        expect(typeof item.riskScore).toBe('number')
        
        // Validate ranges
        expect(item.winRate).toBeGreaterThanOrEqual(0)
        expect(item.winRate).toBeLessThanOrEqual(100)
        expect(item.accuracy).toBeGreaterThanOrEqual(0)
        expect(item.accuracy).toBeLessThanOrEqual(100)
        expect(item.riskScore).toBeGreaterThanOrEqual(0)
        expect(item.riskScore).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('getProviders', () => {
    it('should return all providers', async () => {
      const result = await getProviders()
      
      expect(result).toHaveLength(4) // Based on mock data
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('name')
      expect(result[0]).toHaveProperty('type')
      expect(result[0]).toHaveProperty('status')
      expect(result[0]).toHaveProperty('signalCount')
      expect(result[0]).toHaveProperty('lastSignal')
      expect(result[0]).toHaveProperty('winRate')
    })

    it('should return providers with valid types', async () => {
      const result = await getProviders()
      
      const validTypes = ['discord', 'telegram', 'twitter', 'premium']
      result.forEach(provider => {
        expect(validTypes).toContain(provider.type)
      })
    })

    it('should return providers with valid statuses', async () => {
      const result = await getProviders()
      
      const validStatuses = ['active', 'inactive', 'error']
      result.forEach(provider => {
        expect(validStatuses).toContain(provider.status)
      })
    })
  })

  describe('connectProvider', () => {
    const mockRequest = {
      name: 'Test Provider',
      credentials: { token: 'abc123' },
      metadata: { description: 'Test' },
    }

    it('should connect a provider successfully', async () => {
      const result = await connectProvider('discord', mockRequest)
      
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('type')
      expect(result).toHaveProperty('status')
      expect(result.type).toBe('discord')
      expect(typeof result.id).toBe('string')
      expect(result.id.length).toBeGreaterThan(0)
    })

    it('should return valid status', async () => {
      const result = await connectProvider('telegram', mockRequest)
      
      const validStatuses = ['active', 'inactive', 'error']
      expect(validStatuses).toContain(result.status)
    })

    it('should handle different provider types', async () => {
      const types = ['discord', 'telegram', 'twitter', 'premium']
      
      for (const type of types) {
        const result = await connectProvider(type, mockRequest)
        expect(result.type).toBe(type)
      }
    })

    it('should generate unique IDs', async () => {
      const results = await Promise.all([
        connectProvider('discord', mockRequest),
        connectProvider('discord', mockRequest),
        connectProvider('discord', mockRequest),
      ])
      
      const ids = results.map(r => r.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length) // All IDs should be unique
    })

    it('should include timestamp in ID generation', async () => {
      const result1 = await connectProvider('discord', mockRequest)
      
      // Wait a small amount to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1))
      
      const result2 = await connectProvider('discord', mockRequest)
      
      expect(result1.id).not.toBe(result2.id)
    })
  })
})
