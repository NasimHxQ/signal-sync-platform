import type { Signal, Provider, ProviderPerformance } from '../types'

// Test data factories
export const createMockSignal = (overrides: Partial<Signal> = {}): Signal => ({
  id: '1',
  symbol: 'BTC/USDT',
  type: 'long',
  price: 43250,
  targetPrice: 45000,
  stopLoss: 42000,
  leverage: 10,
  timeframe: '4h',
  source: 'CryptoWhales',
  confidence: 85,
  timestamp: new Date().toISOString(),
  status: 'active',
  pnl: 2.3,
  ...overrides,
})

export const createMockProvider = (overrides: Partial<Provider> = {}): Provider => ({
  id: '1',
  name: 'CryptoWhales Discord',
  type: 'discord',
  status: 'active',
  signalCount: 156,
  lastSignal: '2 minutes ago',
  winRate: 73.2,
  ...overrides,
})

export const createMockProviderPerformance = (overrides: Partial<ProviderPerformance> = {}): ProviderPerformance => ({
  source: 'CryptoWhales',
  totalSignals: 156,
  winRate: 73.2,
  avgReturn: 4.8,
  totalPnL: 12450,
  accuracy: 78.5,
  riskScore: 45,
  ...overrides,
})

// Mock request helpers that work with Next.js testing
export const createMockRequest = (url: string, options: any = {}) => {
  const mockRequest = {
    url,
    method: options.method || 'GET',
    headers: new Map(Object.entries(options.headers || {})),
    json: async () => JSON.parse(options.body || '{}'),
    text: async () => options.body || '',
    ...options,
  }
  return mockRequest as any
}

export const createMockGetRequest = (path: string, searchParams: Record<string, string> = {}) => {
  const url = new URL(path, 'http://localhost:3000')
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  
  return createMockRequest(url.toString())
}

export const createMockPostRequest = (path: string, body: any) => {
  return createMockRequest(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Response helpers
export const extractJsonFromResponse = async (response: any) => {
  if (response.json) {
    return await response.json()
  }
  const text = await response.text()
  return JSON.parse(text)
}

// Mock console to capture logs in tests
export const mockConsole = () => {
  const originalConsole = global.console
  const mockLog = jest.fn()
  const mockError = jest.fn()
  const mockWarn = jest.fn()

  beforeEach(() => {
    global.console = {
      ...originalConsole,
      log: mockLog,
      error: mockError,
      warn: mockWarn,
    }
  })

  afterEach(() => {
    global.console = originalConsole
    jest.clearAllMocks()
  })

  return { mockLog, mockError, mockWarn }
}

// Mock NextResponse for API route testing
export const createMockNextResponse = (data: any, status = 200) => ({
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
})

// Environment variable helper for tests
export const mockEnvVar = (key: string, value: string) => {
  const original = process.env[key]
  
  beforeEach(() => {
    Object.defineProperty(process.env, key, {
      value,
      writable: true,
      configurable: true,
    })
  })
  
  afterEach(() => {
    if (original !== undefined) {
      Object.defineProperty(process.env, key, {
        value: original,
        writable: true,
        configurable: true,
      })
    } else {
      delete process.env[key]
    }
  })
}