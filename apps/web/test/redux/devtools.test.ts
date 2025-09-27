/**
 * Tests for Redux DevTools integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isDevToolsAvailable, logDevToolsStatus } from '../../store/devtools';

// Mock window object
const mockWindow = {
  __REDUX_DEVTOOLS_EXTENSION__: vi.fn(),
};

describe('Redux DevTools Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window object
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
    });
  });

  describe('isDevToolsAvailable', () => {
    it('should return false when window is undefined', () => {
      expect(isDevToolsAvailable()).toBe(false);
    });

    it('should return false when DevTools extension is not available', () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });
      expect(isDevToolsAvailable()).toBe(false);
    });

    it('should return true when DevTools extension is available', () => {
      Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true,
      });
      expect(isDevToolsAvailable()).toBe(true);
    });
  });

  describe('logDevToolsStatus', () => {
    it('should not log in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logDevToolsStatus();
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      (process.env as any).NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it('should log DevTools status in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Test with DevTools available
      Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true,
      });
      
      logDevToolsStatus();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redux DevTools Extension: Available'),
        expect.stringContaining('color: green')
      );
      
      (process.env as any).NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it('should log installation instructions when DevTools is not available', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Test without DevTools
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });
      
      logDevToolsStatus();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redux DevTools Extension: Not Available'),
        expect.stringContaining('color: orange')
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Install Redux DevTools Extension'),
        expect.stringContaining('color: orange')
      );
      
      (process.env as any).NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });
});
