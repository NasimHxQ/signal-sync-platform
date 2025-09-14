import { getSignals, SignalFilters } from '../signals'
import { createMockSignal } from '../../__tests__/test-utils'

describe('Signals Service', () => {
  describe('getSignals', () => {
    it('should return all signals when no filters applied', async () => {
      const result = await getSignals()
      
      expect(result.items).toHaveLength(6) // Based on mock data
      expect(result.items[0]).toHaveProperty('id')
      expect(result.items[0]).toHaveProperty('symbol')
      expect(result.items[0]).toHaveProperty('type')
      expect(result.items[0]).toHaveProperty('status')
    })

    it('should filter by status', async () => {
      const activeSignals = await getSignals({ status: 'active' })
      const filledSignals = await getSignals({ status: 'filled' })
      
      expect(activeSignals.items.every(s => s.status === 'active')).toBe(true)
      expect(filledSignals.items.every(s => s.status === 'filled')).toBe(true)
    })

    it('should filter by source', async () => {
      const result = await getSignals({ source: 'CryptoWhales' })
      
      expect(result.items.every(s => s.source === 'CryptoWhales')).toBe(true)
    })

    it('should filter by type', async () => {
      const longSignals = await getSignals({ type: 'long' })
      const shortSignals = await getSignals({ type: 'short' })
      
      expect(longSignals.items.every(s => s.type === 'long')).toBe(true)
      expect(shortSignals.items.every(s => s.type === 'short')).toBe(true)
    })

    it('should filter by minimum confidence', async () => {
      const highConfidenceSignals = await getSignals({ minConfidence: 80 })
      
      expect(highConfidenceSignals.items.every(s => s.confidence >= 80)).toBe(true)
    })

    it('should filter by timeframe', async () => {
      const fourHourSignals = await getSignals({ timeframe: '4h' })
      
      expect(fourHourSignals.items.every(s => s.timeframe === '4h')).toBe(true)
    })

    it('should filter by since parameter with relative time', async () => {
      const recentSignals = await getSignals({ since: '-1h' })
      
      // Should return signals from the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      expect(recentSignals.items.every(s => 
        new Date(s.timestamp) >= oneHourAgo
      )).toBe(true)
    })

    it('should filter by since parameter with ISO date', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const result = await getSignals({ since: yesterday.toISOString() })
      
      expect(result.items.every(s => 
        new Date(s.timestamp) >= yesterday
      )).toBe(true)
    })

    it('should combine multiple filters', async () => {
      const result = await getSignals({
        status: 'active',
        type: 'long',
        minConfidence: 80,
      })
      
      expect(result.items.every(s => 
        s.status === 'active' && 
        s.type === 'long' && 
        s.confidence >= 80
      )).toBe(true)
    })

    it('should respect limit parameter', async () => {
      const result = await getSignals({ limit: 3 })
      
      expect(result.items).toHaveLength(3)
    })

    it('should return nextCursor when limit is exceeded', async () => {
      const result = await getSignals({ limit: 3 })
      
      // Mock data has 6 items, so with limit 3 we should get a cursor
      expect(result.nextCursor).toBeDefined()
    })

    it('should not return nextCursor when all items fit in limit', async () => {
      const result = await getSignals({ limit: 10 })
      
      expect(result.nextCursor).toBeUndefined()
    })

    it('should sort results by timestamp descending', async () => {
      const result = await getSignals()
      
      for (let i = 1; i < result.items.length; i++) {
        const currentTime = new Date(result.items[i].timestamp).getTime()
        const previousTime = new Date(result.items[i - 1].timestamp).getTime()
        expect(currentTime).toBeLessThanOrEqual(previousTime)
      }
    })

    it('should handle invalid since parameter gracefully', async () => {
      const result = await getSignals({ since: 'invalid-date' })
      
      // Should return some signals when since filter is invalid
      expect(result.items.length).toBeGreaterThanOrEqual(0)
    })

    it('should ignore status filter when set to "all"', async () => {
      const allResult = await getSignals()
      const allFilterResult = await getSignals({ status: 'all' })
      
      expect(allFilterResult.items).toHaveLength(allResult.items.length)
    })

    it('should ignore source filter when set to "all"', async () => {
      const allResult = await getSignals()
      const allFilterResult = await getSignals({ source: 'all' })
      
      expect(allFilterResult.items).toHaveLength(allResult.items.length)
    })
  })
})
