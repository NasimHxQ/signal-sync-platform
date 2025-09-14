import {
  SignalsQuerySchema,
  CreateFilterSchema,
  ProviderStatsQuerySchema,
  AlertSettingsSchema,
  ConnectProviderSchema,
  ProviderParamSchema,
  validateQuery,
  validateBody,
} from '../validation'

describe('Validation Schemas', () => {
  describe('SignalsQuerySchema', () => {
    it('should validate valid query parameters', () => {
      const validQuery = {
        since: '-24h',
        status: 'active',
        source: 'CryptoWhales',
        type: 'long',
        minConfidence: '80',
        timeframe: '4h',
        cursor: 'abc123',
        limit: '50',
      }

      const result = SignalsQuerySchema.parse(validQuery)
      expect(result).toEqual({
        since: '-24h',
        status: 'active',
        source: 'CryptoWhales',
        type: 'long',
        minConfidence: 80,
        timeframe: '4h',
        cursor: 'abc123',
        limit: 50,
      })
    })

    it('should apply default limit when not provided', () => {
      const result = SignalsQuerySchema.parse({})
      expect(result.limit).toBe(50)
    })

    it('should coerce string numbers to numbers', () => {
      const result = SignalsQuerySchema.parse({ minConfidence: '75', limit: '25' })
      expect(result.minConfidence).toBe(75)
      expect(result.limit).toBe(25)
    })

    it('should reject invalid signal types', () => {
      expect(() => SignalsQuerySchema.parse({ type: 'invalid' })).toThrow()
    })

    it('should reject confidence out of range', () => {
      expect(() => SignalsQuerySchema.parse({ minConfidence: '101' })).toThrow()
      expect(() => SignalsQuerySchema.parse({ minConfidence: '-1' })).toThrow()
    })

    it('should reject limit out of range', () => {
      expect(() => SignalsQuerySchema.parse({ limit: '101' })).toThrow()
      expect(() => SignalsQuerySchema.parse({ limit: '0' })).toThrow()
    })
  })

  describe('CreateFilterSchema', () => {
    it('should validate valid filter creation', () => {
      const validFilter = {
        name: 'High Confidence Longs',
        criteria: {
          types: ['long', 'buy'],
          minConfidence: 80,
          status: ['active'],
          sources: ['CryptoWhales'],
          timeframe: '4h',
        },
      }

      const result = CreateFilterSchema.parse(validFilter)
      expect(result).toEqual(validFilter)
    })

    it('should require name', () => {
      expect(() => CreateFilterSchema.parse({ criteria: {} })).toThrow()
    })

    it('should reject empty name', () => {
      expect(() => CreateFilterSchema.parse({ name: '', criteria: {} })).toThrow()
    })

    it('should reject name too long', () => {
      const longName = 'a'.repeat(101)
      expect(() => CreateFilterSchema.parse({ name: longName, criteria: {} })).toThrow()
    })

    it('should validate criteria with optional fields', () => {
      const result = CreateFilterSchema.parse({
        name: 'Simple Filter',
        criteria: { minConfidence: 70 },
      })
      expect(result.criteria.minConfidence).toBe(70)
      expect(result.criteria.types).toBeUndefined()
    })
  })

  describe('ProviderStatsQuerySchema', () => {
    it('should validate date range query', () => {
      const query = { from: '2024-01-01', to: '2024-01-31', summary: 'true' }
      const result = ProviderStatsQuerySchema.parse(query)
      
      expect(result).toEqual({
        from: '2024-01-01',
        to: '2024-01-31',
        summary: true,
      })
    })

    it('should default summary to false', () => {
      const result = ProviderStatsQuerySchema.parse({})
      expect(result.summary).toBe(false)
    })

    it('should coerce summary to boolean', () => {
      expect(ProviderStatsQuerySchema.parse({ summary: 'true' }).summary).toBe(true)
      expect(ProviderStatsQuerySchema.parse({ summary: '1' }).summary).toBe(true)
      expect(ProviderStatsQuerySchema.parse({ summary: '' }).summary).toBe(false)
      // Note: zod coerces any non-empty string to true, including '0' and 'false'
      expect(ProviderStatsQuerySchema.parse({ summary: '0' }).summary).toBe(true)
      expect(ProviderStatsQuerySchema.parse({ summary: 'false' }).summary).toBe(true)
    })
  })

  describe('AlertSettingsSchema', () => {
    it('should validate complete alert settings', () => {
      const validSettings = {
        email: { enabled: true, address: 'user@example.com' },
        telegram: { enabled: false, username: '@user' },
        browser: { enabled: true },
        sms: { enabled: false, phone: '+1234567890' },
        rules: {
          minConfidence: 75,
          types: ['buy', 'long'],
          minLeverage: 5,
        },
      }

      const result = AlertSettingsSchema.parse(validSettings)
      expect(result).toEqual(validSettings)
    })

    it('should require rules', () => {
      expect(() => AlertSettingsSchema.parse({})).toThrow()
    })

    it('should validate email address format', () => {
      const settings = {
        email: { enabled: true, address: 'invalid-email' },
        rules: { minConfidence: 70, types: ['buy'] },
      }
      expect(() => AlertSettingsSchema.parse(settings)).toThrow()
    })

    it('should validate confidence range in rules', () => {
      const settings = {
        rules: { minConfidence: 101, types: ['buy'] },
      }
      expect(() => AlertSettingsSchema.parse(settings)).toThrow()
    })

    it('should validate signal types in rules', () => {
      const settings = {
        rules: { minConfidence: 70, types: ['invalid'] },
      }
      expect(() => AlertSettingsSchema.parse(settings)).toThrow()
    })
  })

  describe('ConnectProviderSchema', () => {
    it('should validate provider connection request', () => {
      const validRequest = {
        name: 'My Discord Server',
        credentials: { token: 'abc123', serverId: '123456' },
        metadata: { description: 'Test server' },
      }

      const result = ConnectProviderSchema.parse(validRequest)
      expect(result).toEqual(validRequest)
    })

    it('should require name and credentials', () => {
      expect(() => ConnectProviderSchema.parse({})).toThrow()
      expect(() => ConnectProviderSchema.parse({ name: 'Test' })).toThrow()
      expect(() => ConnectProviderSchema.parse({ credentials: {} })).toThrow()
    })

    it('should reject empty name', () => {
      expect(() => ConnectProviderSchema.parse({ 
        name: '', 
        credentials: { token: 'abc' } 
      })).toThrow()
    })
  })

  describe('ProviderParamSchema', () => {
    it('should validate valid provider types', () => {
      expect(ProviderParamSchema.parse({ provider: 'discord' })).toEqual({ provider: 'discord' })
      expect(ProviderParamSchema.parse({ provider: 'telegram' })).toEqual({ provider: 'telegram' })
      expect(ProviderParamSchema.parse({ provider: 'twitter' })).toEqual({ provider: 'twitter' })
      expect(ProviderParamSchema.parse({ provider: 'premium' })).toEqual({ provider: 'premium' })
    })

    it('should reject invalid provider types', () => {
      expect(() => ProviderParamSchema.parse({ provider: 'invalid' })).toThrow()
    })
  })

  describe('Validation Helper Functions', () => {
    describe('validateQuery', () => {
      it('should return parsed data for valid input', () => {
        const result = validateQuery(SignalsQuerySchema, { limit: '25' })
        expect(result.limit).toBe(25)
      })

      it('should throw error for invalid input', () => {
        expect(() => validateQuery(SignalsQuerySchema, { limit: '101' })).toThrow('Validation failed')
      })
    })

    describe('validateBody', () => {
      it('should return parsed data for valid input', () => {
        const body = { name: 'Test Filter', criteria: {} }
        const result = validateBody(CreateFilterSchema, body)
        expect(result.name).toBe('Test Filter')
      })

      it('should throw error for invalid input', () => {
        expect(() => validateBody(CreateFilterSchema, {})).toThrow('Validation failed')
      })
    })
  })
})
