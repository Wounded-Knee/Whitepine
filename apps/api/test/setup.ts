// Global test setup for API app with node environment
// This file is imported by vitest.config.ts

import { beforeAll, beforeEach, afterAll, afterEach } from 'vitest'

// Setup global test environment
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
})

// Global teardown
afterEach(() => {
  // Clean up after each test
})

beforeAll(() => {
  // Setup before all tests
})

afterAll(() => {
  // Cleanup after all tests
})
