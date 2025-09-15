const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // Ensure the test database schema is always up-to-date before tests run
  globalSetup: '<rootDir>/jest.global-setup.js',
  // Let Next.js handle the module mapping from tsconfig.json
  collectCoverageFrom: [
    'lib/server/**/*.{js,ts}',
    'app/api/**/*.{js,ts}',
    '!lib/server/**/*.d.ts',
    '!**/*.config.{js,ts}',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/test-utils.ts',
  ],
  testMatch: [
    '**/__tests__/**/*.(test|spec).{js,ts}',
    '**/*.(test|spec).{js,ts}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
}

module.exports = createJestConfig(customJestConfig)