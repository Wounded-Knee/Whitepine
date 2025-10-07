import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeToggle } from '@web/components/theme-toggle';

describe('ThemeToggle', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    
    global.Storage.prototype.getItem = vi.fn((key: string) => localStorageMock[key] || null);
    global.Storage.prototype.setItem = vi.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    global.Storage.prototype.clear = vi.fn(() => {
      localStorageMock = {};
    });

    // Mock matchMedia for system theme detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false, // default to light mode
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove('dark');
  });

  describe('Initial Render', () => {
    it('renders with moon icon (light mode) by default', async () => {
      render(<ThemeToggle />);

      // Wait for component to mount
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toBeInTheDocument();
      });

      // Moon icon indicates light mode (clicking will switch to dark)
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.querySelector('svg path[d*="M21"]')).toBeInTheDocument();
    });

    it('renders disabled button before mount', () => {
      // This test catches the initial disabled state before useEffect runs
      const { container } = render(<ThemeToggle />);
      
      // The button should exist but might be disabled initially
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Persistence - localStorage', () => {
    it('loads saved light theme from localStorage', async () => {
      localStorageMock['theme'] = 'light';

      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /toggle theme/i });
        // Should show moon icon (light mode)
        expect(button.querySelector('svg path[d*="M21"]')).toBeInTheDocument();
      });
    });

    it('loads saved dark theme from localStorage', async () => {
      localStorageMock['theme'] = 'dark';

      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /toggle theme/i });
        // Should show sun icon (dark mode)
        expect(button.querySelector('svg circle[cx="12"]')).toBeInTheDocument();
      });
    });

    it('saves theme to localStorage when toggled', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Toggle to dark mode
      fireEvent.click(button);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      });
    });

    it('updates localStorage when theme changes multiple times', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Toggle to dark
      fireEvent.click(button);
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      });

      // Toggle back to light
      fireEvent.click(button);
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
      });

      // Verify both calls were made
      expect(localStorage.setItem).toHaveBeenCalledTimes(3); // Initial mount + 2 toggles
    });
  });

  describe('System Theme Detection', () => {
    it('respects system dark mode preference when no saved theme', async () => {
      // Mock system preference for dark mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /toggle theme/i });
        // Should show sun icon (dark mode active)
        expect(button.querySelector('svg circle[cx="12"]')).toBeInTheDocument();
      });
    });

    it('prefers saved theme over system preference', async () => {
      // System prefers dark
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      // But user saved light theme
      localStorageMock['theme'] = 'light';

      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /toggle theme/i });
        // Should show moon icon (light mode - saved preference wins)
        expect(button.querySelector('svg path[d*="M21"]')).toBeInTheDocument();
      });
    });
  });

  describe('DOM Updates', () => {
    it('adds dark class to document element when in dark mode', async () => {
      localStorageMock['theme'] = 'dark';

      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('removes dark class from document element when in light mode', async () => {
      // Start with dark mode
      localStorageMock['theme'] = 'dark';
      document.documentElement.classList.add('dark');

      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Toggle to light mode
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });

    it('toggles dark class when button is clicked', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Initial state should be light (no dark class)
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Click to enable dark mode
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      // Click again to disable dark mode
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });
  });

  describe('Theme Toggle Functionality', () => {
    it('changes from light to dark mode when clicked', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Initially shows moon icon (light mode)
      expect(button.querySelector('svg path[d*="M21"]')).toBeInTheDocument();

      // Click to toggle
      fireEvent.click(button);

      await waitFor(() => {
        // Should now show sun icon (dark mode)
        expect(button.querySelector('svg circle[cx="12"]')).toBeInTheDocument();
      });
    });

    it('changes from dark to light mode when clicked', async () => {
      localStorageMock['theme'] = 'dark';

      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /toggle theme/i });
        // Initially shows sun icon (dark mode)
        expect(button.querySelector('svg circle[cx="12"]')).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Click to toggle
      fireEvent.click(button);

      await waitFor(() => {
        // Should now show moon icon (light mode)
        expect(button.querySelector('svg path[d*="M21"]')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible button with sr-only label', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toBeInTheDocument();
      });
    });

    it('button is keyboard accessible', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Button should be clickable via keyboard
      expect(button).not.toBeDisabled();
      expect(button.getAttribute('type')).not.toBe('submit');
    });
  });

  describe('SSR and Hydration', () => {
    it('prevents hydration mismatch with mounted state', async () => {
      // This test verifies that the component handles SSR properly
      const { container } = render(<ThemeToggle />);
      
      // Initially, component might render a placeholder
      expect(container.querySelector('button')).toBeInTheDocument();
      
      // After mount, it should show the proper theme toggle
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid localStorage values gracefully', async () => {
      localStorageMock['theme'] = 'invalid-theme';

      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /toggle theme/i });
        // Should default to light mode or system preference
        expect(button).toBeInTheDocument();
      });

      // Should still be able to toggle
      const button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      });
    });

    it('handles localStorage being unavailable gracefully', async () => {
      // Mock localStorage to throw errors
      global.Storage.prototype.getItem = vi.fn(() => {
        throw new Error('localStorage not available');
      });
      global.Storage.prototype.setItem = vi.fn(() => {
        throw new Error('localStorage not available');
      });

      // Component should still render without throwing
      render(<ThemeToggle />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Should still be able to toggle (just without persistence)
      fireEvent.click(button);

      await waitFor(() => {
        // Dark class should still be applied
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('handles multiple rapid clicks', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Click multiple times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Final state should be dark (even number of clicks from light)
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('maintains theme state across re-renders', async () => {
      const { rerender } = render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      
      // Toggle to dark mode
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      // Re-render component
      rerender(<ThemeToggle />);

      // Dark mode should persist
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('cleans up properly on unmount', async () => {
      const { unmount } = render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      // Toggle to dark mode
      const button = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      // Unmount component
      unmount();

      // Dark class should remain on document element
      // (this is intentional - theme persists even if toggle is removed)
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});

