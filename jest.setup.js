// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.setup.js`

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js server components for test environment
class MockResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Map(Object.entries(init.headers || {}))
  }
  
  async json() {
    if (typeof this.body === 'string') {
      return JSON.parse(this.body)
    }
    return this.body
  }
  
  async text() {
    if (typeof this.body === 'object') {
      return JSON.stringify(this.body)
    }
    return this.body || ''
  }
}

class MockRequest {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input.toString()
    this.method = init.method || 'GET'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.body = init.body
  }
  
  async json() {
    return JSON.parse(this.body || '{}')
  }
  
  async text() {
    return this.body || ''
  }
}

// Mock NextResponse
class MockNextResponse extends MockResponse {
  static json(data, init = {}) {
    return new MockNextResponse(data, init)
  }
}

// Set up global mocks
global.Request = MockRequest
global.Response = MockResponse
global.NextResponse = MockNextResponse

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextRequest: MockRequest,
  NextResponse: MockNextResponse,
}))

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to ignore specific log levels in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Setup test environment
process.env.NODE_ENV = 'test'