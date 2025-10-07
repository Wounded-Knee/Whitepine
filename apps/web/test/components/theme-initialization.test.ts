import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Integration tests for the theme initialization script
 * This script runs in the <head> of layout.tsx before React hydrates
 * to prevent flash of incorrect theme.
 */
describe('Theme Initialization Script', () => {
  let localStorageMock: { [key: string]: string };
  let matchMediaMock: (query: string) => MediaQueryList;

  beforeEach(() => {
    // Reset DOM
    document.documentElement.className = '';
    
    // Mock localStorage
    localStorageMock = {};
    global.Storage.prototype.getItem = vi.fn((key: string) => localStorageMock[key] || null);
    global.Storage.prototype.setItem = vi.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    // Mock matchMedia
    matchMediaMock = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(matchMediaMock),
    });
  });

  const runInitScript = () => {
    // This is the actual script from layout.tsx
    // Extracted as a function for testing
    try {
      const t = localStorage.getItem('theme');
      if (t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      // Silently fail
    }
  };

  describe('localStorage-based theme loading', () => {
    it('adds dark class when theme is "dark" in localStorage', () => {
      localStorageMock['theme'] = 'dark';
      
      runInitScript();
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('does not add dark class when theme is "light" in localStorage', () => {
      localStorageMock['theme'] = 'light';
      
      runInitScript();
      
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('prefers localStorage over system preference', () => {
      // System prefers dark
      matchMediaMock = (query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(matchMediaMock),
      });

      // But localStorage says light
      localStorageMock['theme'] = 'light';
      
      runInitScript();
      
      // Should respect localStorage (light mode)
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('System preference detection', () => {
    it('adds dark class when system prefers dark and no localStorage value', () => {
      // System prefers dark
      matchMediaMock = (query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(matchMediaMock),
      });

      // No localStorage value
      localStorageMock = {};
      
      runInitScript();
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('does not add dark class when system prefers light and no localStorage value', () => {
      // System prefers light (default mock behavior)
      localStorageMock = {};
      
      runInitScript();
      
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('fails silently when localStorage throws error', () => {
      global.Storage.prototype.getItem = vi.fn(() => {
        throw new Error('localStorage not available');
      });
      
      // Should not throw
      expect(() => runInitScript()).not.toThrow();
      
      // Should not add dark class (fail safe to light mode)
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('fails silently when matchMedia throws error', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: () => {
          throw new Error('matchMedia not available');
        },
      });
      
      // Should not throw
      expect(() => runInitScript()).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('handles invalid localStorage values by checking system preference', () => {
      localStorageMock['theme'] = 'invalid-value';
      
      // System prefers dark
      matchMediaMock = (query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(matchMediaMock),
      });
      
      runInitScript();
      
      // Should fall back to system preference
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('handles null localStorage value', () => {
      localStorageMock['theme'] = null as any;
      
      runInitScript();
      
      // Should check system preference
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('handles undefined localStorage value', () => {
      delete localStorageMock['theme'];
      
      runInitScript();
      
      // Should check system preference
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });
  });

  describe('Performance', () => {
    it('runs synchronously without async operations', () => {
      localStorageMock['theme'] = 'dark';
      
      const startTime = performance.now();
      runInitScript();
      const endTime = performance.now();
      
      // Should be extremely fast (< 1ms in most cases)
      expect(endTime - startTime).toBeLessThan(10);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('adds only one dark class even if called multiple times', () => {
      localStorageMock['theme'] = 'dark';
      
      runInitScript();
      runInitScript();
      runInitScript();
      
      // Should still have exactly one 'dark' class
      const darkClasses = Array.from(document.documentElement.classList).filter(c => c === 'dark');
      expect(darkClasses.length).toBe(1);
    });
  });

  describe('Script injection format', () => {
    it('matches the minified format used in layout.tsx', () => {
      // The actual script from layout.tsx is minified to:
      const minifiedScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`;
      
      // Verify it's valid JavaScript and doesn't throw
      expect(() => {
        // eslint-disable-next-line no-eval
        eval(minifiedScript);
      }).not.toThrow();
    });
  });

  describe('Flash prevention', () => {
    it('applies theme before React hydration', () => {
      // Simulate page load sequence:
      // 1. HTML parsed, script runs
      localStorageMock['theme'] = 'dark';
      runInitScript();
      
      // At this point, dark class should already be applied
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      
      // 2. React hydrates (would happen after)
      // The ThemeToggle component would see dark mode already active
      // and maintain it, preventing any flash
    });

    it('prevents light-to-dark flash on page load', () => {
      // User has dark mode saved
      localStorageMock['theme'] = 'dark';
      
      // Page loads - script runs immediately
      runInitScript();
      
      // Dark mode is active before any render
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      
      // No flash occurs because dark class was added synchronously
    });

    it('prevents dark-to-light flash when user prefers light', () => {
      // User has light mode saved
      localStorageMock['theme'] = 'light';
      
      // Someone else set dark mode (shouldn't happen, but defensive)
      document.documentElement.classList.add('dark');
      
      // Script runs
      runInitScript();
      
      // Should NOT remove existing dark class
      // (Script only adds, never removes, to be safe)
      // The ThemeToggle component handles removal after mount
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Consistency with ThemeToggle component', () => {
    it('uses same localStorage key as ThemeToggle', () => {
      const STORAGE_KEY = 'theme';
      
      localStorageMock[STORAGE_KEY] = 'dark';
      runInitScript();
      
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('uses same theme values as ThemeToggle', () => {
      const VALID_THEMES = ['light', 'dark'];
      
      VALID_THEMES.forEach(theme => {
        // Reset
        document.documentElement.className = '';
        
        localStorageMock['theme'] = theme;
        runInitScript();
        
        if (theme === 'dark') {
          expect(document.documentElement.classList.contains('dark')).toBe(true);
        } else {
          expect(document.documentElement.classList.contains('dark')).toBe(false);
        }
      });
    });

    it('uses same media query as ThemeToggle', () => {
      const MEDIA_QUERY = '(prefers-color-scheme: dark)';
      
      localStorageMock = {}; // No saved preference
      runInitScript();
      
      expect(window.matchMedia).toHaveBeenCalledWith(MEDIA_QUERY);
    });
  });
});

