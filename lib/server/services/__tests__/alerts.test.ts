import { getAlertSettings, saveAlertSettings, testAlerts } from '../alerts'
import type { AlertSettings } from '../../types'

describe('Alerts Service', () => {
  describe('getAlertSettings', () => {
    it('should return default alert settings', async () => {
      const result = await getAlertSettings()
      
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('telegram')
      expect(result).toHaveProperty('browser')
      expect(result).toHaveProperty('sms')
      expect(result).toHaveProperty('rules')
      
      expect(result.rules).toHaveProperty('minConfidence')
      expect(result.rules).toHaveProperty('types')
      expect(Array.isArray(result.rules.types)).toBe(true)
    })

    it('should return consistent data structure', async () => {
      const result = await getAlertSettings()
      
      // Email settings
      if (result.email) {
        expect(typeof result.email.enabled).toBe('boolean')
        if (result.email.address) {
          expect(typeof result.email.address).toBe('string')
        }
      }
      
      // Telegram settings
      if (result.telegram) {
        expect(typeof result.telegram.enabled).toBe('boolean')
        if (result.telegram.username) {
          expect(typeof result.telegram.username).toBe('string')
        }
      }
      
      // Browser settings
      if (result.browser) {
        expect(typeof result.browser.enabled).toBe('boolean')
      }
      
      // SMS settings
      if (result.sms) {
        expect(typeof result.sms.enabled).toBe('boolean')
        if (result.sms.phone) {
          expect(typeof result.sms.phone).toBe('string')
        }
      }
      
      // Rules
      expect(typeof result.rules.minConfidence).toBe('number')
      expect(result.rules.minConfidence).toBeGreaterThanOrEqual(0)
      expect(result.rules.minConfidence).toBeLessThanOrEqual(100)
      expect(Array.isArray(result.rules.types)).toBe(true)
      
      if (result.rules.minLeverage) {
        expect(typeof result.rules.minLeverage).toBe('number')
        expect(result.rules.minLeverage).toBeGreaterThan(0)
      }
    })
  })

  describe('saveAlertSettings', () => {
    const mockSettings: AlertSettings = {
      email: { enabled: true, address: 'test@example.com' },
      telegram: { enabled: false, username: '@test' },
      browser: { enabled: true },
      sms: { enabled: false, phone: '+1234567890' },
      rules: {
        minConfidence: 75,
        types: ['buy', 'long'],
        minLeverage: 3,
      },
    }

    it('should save alert settings successfully', async () => {
      const result = await saveAlertSettings(mockSettings)
      
      expect(result.saved).toBe(true)
      expect(result.updatedAt).toBeDefined()
      expect(typeof result.updatedAt).toBe('string')
      
      // Should be a valid ISO date string
      expect(() => new Date(result.updatedAt)).not.toThrow()
      expect(new Date(result.updatedAt).toISOString()).toBe(result.updatedAt)
    })

    it('should handle minimal settings', async () => {
      const minimalSettings: AlertSettings = {
        rules: {
          minConfidence: 80,
          types: ['buy'],
        },
      }
      
      const result = await saveAlertSettings(minimalSettings)
      expect(result.saved).toBe(true)
    })

    it('should handle all notification methods enabled', async () => {
      const allEnabledSettings: AlertSettings = {
        email: { enabled: true, address: 'test@example.com' },
        telegram: { enabled: true, username: '@test' },
        browser: { enabled: true },
        sms: { enabled: true, phone: '+1234567890' },
        rules: {
          minConfidence: 70,
          types: ['buy', 'sell', 'long', 'short'],
          minLeverage: 1,
        },
      }
      
      const result = await saveAlertSettings(allEnabledSettings)
      expect(result.saved).toBe(true)
    })

    it('should return recent timestamp', async () => {
      const before = new Date()
      const result = await saveAlertSettings(mockSettings)
      const after = new Date()
      
      const updatedAt = new Date(result.updatedAt)
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('testAlerts', () => {
    it('should report no methods when all disabled', async () => {
      const disabledSettings: AlertSettings = {
        email: { enabled: false },
        telegram: { enabled: false },
        browser: { enabled: false },
        sms: { enabled: false },
        rules: { minConfidence: 70, types: ['buy'] },
      }
      
      const result = await testAlerts(disabledSettings)
      
      expect(result.sent).toBe(false)
      expect(result.message).toContain('No alert methods are enabled')
    })

    it('should report success when methods are enabled', async () => {
      const enabledSettings: AlertSettings = {
        email: { enabled: true, address: 'test@example.com' },
        browser: { enabled: true },
        rules: { minConfidence: 70, types: ['buy'] },
      }
      
      const result = await testAlerts(enabledSettings)
      
      expect(result.sent).toBe(true)
      expect(result.message).toContain('Test alerts sent via:')
      expect(result.message).toContain('email')
      expect(result.message).toContain('browser')
    })

    it('should list all enabled methods', async () => {
      const allEnabledSettings: AlertSettings = {
        email: { enabled: true, address: 'test@example.com' },
        telegram: { enabled: true, username: '@test' },
        browser: { enabled: true },
        sms: { enabled: true, phone: '+1234567890' },
        rules: { minConfidence: 70, types: ['buy'] },
      }
      
      const result = await testAlerts(allEnabledSettings)
      
      expect(result.sent).toBe(true)
      expect(result.message).toContain('email')
      expect(result.message).toContain('telegram')
      expect(result.message).toContain('browser')
      expect(result.message).toContain('sms')
    })

    it('should handle mixed enabled/disabled methods', async () => {
      const mixedSettings: AlertSettings = {
        email: { enabled: true, address: 'test@example.com' },
        telegram: { enabled: false },
        browser: { enabled: true },
        sms: { enabled: false },
        rules: { minConfidence: 70, types: ['buy'] },
      }
      
      const result = await testAlerts(mixedSettings)
      
      expect(result.sent).toBe(true)
      expect(result.message).toContain('email')
      expect(result.message).toContain('browser')
      expect(result.message).not.toContain('telegram')
      expect(result.message).not.toContain('sms')
    })
  })
})
