/**
 * @jest-environment node
 */

import {
  ApiErrorClass,
  BadRequestError,
  NotFoundError,
  ValidationError,
  InternalServerError,
  RateLimitError,
  createErrorResponse,
  createValidationError,
} from '../errors'

describe('Error Handling', () => {
  describe('ApiErrorClass', () => {
    it('should create error with all properties', () => {
      const error = new ApiErrorClass('TestError', 'Test message', 400, { field: 'test' })
      
      expect(error.name).toBe('ApiError')
      expect(error.code).toBe('TestError')
      expect(error.message).toBe('Test message')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({ field: 'test' })
    })

    it('should default to status code 500', () => {
      const error = new ApiErrorClass('TestError', 'Test message')
      
      expect(error.statusCode).toBe(500)
      expect(error.details).toBeUndefined()
    })
  })

  describe('Error Constructors', () => {
    it('should create BadRequestError correctly', () => {
      const error = BadRequestError('Invalid input', { field: 'name' })
      
      expect(error.code).toBe('BadRequest')
      expect(error.message).toBe('Invalid input')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({ field: 'name' })
    })

    it('should create NotFoundError correctly', () => {
      const error = NotFoundError('User not found')
      
      expect(error.code).toBe('NotFound')
      expect(error.message).toBe('User not found')
      expect(error.statusCode).toBe(404)
    })

    it('should create NotFoundError with default message', () => {
      const error = NotFoundError()
      
      expect(error.message).toBe('Resource not found')
    })

    it('should create ValidationError correctly', () => {
      const error = ValidationError('Validation failed', { email: 'Invalid format' })
      
      expect(error.code).toBe('ValidationError')
      expect(error.message).toBe('Validation failed')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({ email: 'Invalid format' })
    })

    it('should create InternalServerError correctly', () => {
      const error = InternalServerError('Database error')
      
      expect(error.code).toBe('InternalServerError')
      expect(error.message).toBe('Database error')
      expect(error.statusCode).toBe(500)
    })

    it('should create InternalServerError with default message', () => {
      const error = InternalServerError()
      
      expect(error.message).toBe('Internal server error')
    })

    it('should create RateLimitError correctly', () => {
      const error = RateLimitError('Too many requests')
      
      expect(error.code).toBe('RateLimitExceeded')
      expect(error.message).toBe('Too many requests')
      expect(error.statusCode).toBe(429)
    })

    it('should create RateLimitError with default message', () => {
      const error = RateLimitError()
      
      expect(error.message).toBe('Rate limit exceeded')
    })
  })

  describe('createErrorResponse', () => {
    it('should create response from ApiErrorClass', async () => {
      const error = new ApiErrorClass('TestError', 'Test message', 400, { field: 'test' })
      const response = createErrorResponse(error)
      
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data).toEqual({
        error: {
          code: 'TestError',
          message: 'Test message',
          details: { field: 'test' },
        },
      })
    })

    it('should create response from regular Error in development', async () => {
      // Test development behavior by temporarily overriding NODE_ENV
      const originalDescriptor = Object.getOwnPropertyDescriptor(process.env, 'NODE_ENV')
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true })
      
      const error = new Error('Regular error')
      const response = createErrorResponse(error)
      
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toEqual({
        error: {
          code: 'InternalServerError',
          message: 'Regular error',
        },
      })
      
      // Restore original descriptor
      if (originalDescriptor) {
        Object.defineProperty(process.env, 'NODE_ENV', originalDescriptor)
      }
    })

    it('should mask error message in production', async () => {
      // Test production behavior by temporarily overriding NODE_ENV
      const originalDescriptor = Object.getOwnPropertyDescriptor(process.env, 'NODE_ENV')
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true })
      
      const error = new Error('Sensitive error details')
      const response = createErrorResponse(error)
      
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toEqual({
        error: {
          code: 'InternalServerError',
          message: 'Internal server error',
        },
      })
      
      // Restore original descriptor
      if (originalDescriptor) {
        Object.defineProperty(process.env, 'NODE_ENV', originalDescriptor)
      }
    })

    it('should handle unknown error types', async () => {
      const response = createErrorResponse('string error')
      
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toEqual({
        error: {
          code: 'InternalServerError',
          message: 'An unexpected error occurred',
        },
      })
    })

    it('should handle null/undefined errors', async () => {
      const nullResponse = createErrorResponse(null)
      const undefinedResponse = createErrorResponse(undefined)
      
      expect(nullResponse.status).toBe(500)
      expect(undefinedResponse.status).toBe(500)
      
      const nullData = await nullResponse.json()
      const undefinedData = await undefinedResponse.json()
      
      expect(nullData.error.code).toBe('InternalServerError')
      expect(undefinedData.error.code).toBe('InternalServerError')
    })
  })

  describe('createValidationError', () => {
    it('should create validation error from zod error', () => {
      const mockZodError = {
        issues: [
          {
            path: ['name'],
            message: 'Name is required',
          },
          {
            path: ['email'],
            message: 'Invalid email format',
          },
          {
            path: ['nested', 'field'],
            message: 'Nested field error',
          },
        ],
      }
      
      const error = createValidationError(mockZodError)
      
      expect(error.code).toBe('ValidationError')
      expect(error.message).toBe('Invalid input data')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({
        name: 'Name is required',
        email: 'Invalid email format',
        'nested.field': 'Nested field error',
      })
    })

    it('should handle zod error without issues', () => {
      const mockZodError = {}
      
      const error = createValidationError(mockZodError)
      
      expect(error.code).toBe('ValidationError')
      expect(error.message).toBe('Invalid input data')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({})
    })

    it('should handle empty path in zod issues', () => {
      const mockZodError = {
        issues: [
          {
            path: [],
            message: 'Root level error',
          },
        ],
      }
      
      const error = createValidationError(mockZodError)
      
      expect(error.details).toEqual({
        '': 'Root level error',
      })
    })

    it('should handle complex nested paths', () => {
      const mockZodError = {
        issues: [
          {
            path: ['user', 'profile', 'settings', 0, 'value'],
            message: 'Complex nested error',
          },
        ],
      }
      
      const error = createValidationError(mockZodError)
      
      expect(error.details).toEqual({
        'user.profile.settings.0.value': 'Complex nested error',
      })
    })
  })
})