import '@testing-library/jest-dom'

// Global test setup for web app with jsdom environment
// This file is imported by vitest.config.ts

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: vi.fn(),
      pop: vi.fn(),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Setup global test environment
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
})
