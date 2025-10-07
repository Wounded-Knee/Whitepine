import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Navigation } from '@web/components/navigation';

// Mock next-auth
const mockSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockSession(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    usePathname: () => mockPathname(),
  };
});

// Mock child components
vi.mock('@web/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}));

vi.mock('@web/components/auth-button', () => ({
  AuthButton: ({ fullWidth }: { fullWidth?: boolean }) => (
    <div data-testid={fullWidth ? 'auth-button-fullwidth' : 'auth-button'}>
      AuthButton
    </div>
  ),
}));

describe('Navigation', () => {
  beforeEach(() => {
    // Default mocks
    mockPathname.mockReturnValue('/');
    mockSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Navigation', () => {
    it('renders desktop navigation with base links', () => {
      render(<Navigation />);

      // Desktop nav should be visible on larger screens
      const whitepineElements = screen.getAllByText('Whitepine');
      expect(whitepineElements.length).toBeGreaterThan(0);

      // Base navigation items
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    });

    it('does not show demo links when user is not logged in', () => {
      mockSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<Navigation />);

      // Demo links should not be present
      expect(screen.queryByRole('link', { name: 'Nodes' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Tree' })).not.toBeInTheDocument();
    });

    it('shows demo links when user is logged in', () => {
      mockSession.mockReturnValue({
        data: {
          user: { name: 'Test User', email: 'test@example.com' },
        },
        status: 'authenticated',
      });

      render(<Navigation />);

      // Demo links should be present for authenticated users
      expect(screen.getAllByRole('link', { name: 'Nodes' }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: 'Tree' }).length).toBeGreaterThan(0);
    });

    it('highlights active navigation item', () => {
      mockPathname.mockReturnValue('/marketing/about-us');

      render(<Navigation />);

      const aboutLinks = screen.getAllByRole('link', { name: 'About' });
      // Desktop nav About link should have active styling
      const desktopAboutLink = aboutLinks.find(link => 
        link.className.includes('text-foreground') && 
        !link.className.includes('text-foreground/60')
      );
      expect(desktopAboutLink).toBeDefined();
    });

    it('renders theme toggle and auth button', () => {
      render(<Navigation />);

      // Should have multiple instances (desktop and mobile)
      const themeToggles = screen.getAllByTestId('theme-toggle');
      expect(themeToggles.length).toBeGreaterThan(0);

      const authButtons = screen.getAllByTestId(/auth-button/);
      expect(authButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile Navigation', () => {
    it('renders mobile menu trigger button', () => {
      render(<Navigation />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('opens mobile menu when trigger is clicked', async () => {
      render(<Navigation />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(menuButton);

      // Wait for the menu to open
      await waitFor(() => {
        // The SheetContent should be visible
        const navMenu = screen.getByRole('heading', { name: /navigation menu/i, hidden: true });
        expect(navMenu).toBeInTheDocument();
      });
    });

    it('displays navigation items in mobile menu', async () => {
      render(<Navigation />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        // Verify the mobile menu is open and contains navigation items
        expect(screen.getByRole('heading', { name: /navigation menu/i, hidden: true })).toBeInTheDocument();
        
        // Check that navigation links exist in the document
        const homeLinks = screen.getAllByRole('link', { name: 'Home' });
        const aboutLinks = screen.getAllByRole('link', { name: 'About' });
        expect(homeLinks.length).toBeGreaterThanOrEqual(1);
        expect(aboutLinks.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('shows fullWidth auth button in mobile menu', async () => {
      render(<Navigation />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByTestId('auth-button-fullwidth')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Menu Collapse Behavior', () => {
    it('closes mobile menu when a navigation link is clicked', async () => {
      render(<Navigation />);

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(menuButton);

      // Wait for menu to open
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /navigation menu/i, hidden: true })).toBeInTheDocument();
      });

      // Click on a navigation link in the mobile menu
      const allHomeLinks = screen.getAllByRole('link', { name: 'Home' });
      // Find the mobile menu link (not the desktop one)
      const mobileHomeLink = allHomeLinks[allHomeLinks.length - 1];
      fireEvent.click(mobileHomeLink);

      // The menu should close - the dialog should not be in the document anymore
      // or should be marked as closed
      await waitFor(() => {
        // After clicking, the Sheet should be closed
        // We can verify this by checking if the open state changed
        // Since the Sheet uses radix-ui dialog, it will update data-state
        const content = document.querySelector('[data-state]');
        if (content) {
          expect(content.getAttribute('data-state')).not.toBe('open');
        }
      }, { timeout: 2000 });
    });

    it('closes mobile menu when About link is clicked', async () => {
      render(<Navigation />);

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /navigation menu/i, hidden: true })).toBeInTheDocument();
      });

      // Click on About link
      const allAboutLinks = screen.getAllByRole('link', { name: 'About' });
      const mobileAboutLink = allAboutLinks[allAboutLinks.length - 1];
      fireEvent.click(mobileAboutLink);

      await waitFor(() => {
        const content = document.querySelector('[data-state]');
        if (content) {
          expect(content.getAttribute('data-state')).not.toBe('open');
        }
      }, { timeout: 2000 });
    });

    it('closes mobile menu when logo is clicked', async () => {
      render(<Navigation />);

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /navigation menu/i, hidden: true })).toBeInTheDocument();
      });

      // Click on the logo inside the mobile menu
      const allWhitepineLinks = screen.getAllByText('Whitepine');
      // The mobile menu logo should be one of them
      const mobileLogoLink = allWhitepineLinks[allWhitepineLinks.length - 1].closest('a');
      expect(mobileLogoLink).toBeInTheDocument();
      fireEvent.click(mobileLogoLink!);

      await waitFor(() => {
        const content = document.querySelector('[data-state]');
        if (content) {
          expect(content.getAttribute('data-state')).not.toBe('open');
        }
      }, { timeout: 2000 });
    });

    it('closes mobile menu when authenticated user clicks Nodes link', async () => {
      mockSession.mockReturnValue({
        data: {
          user: { name: 'Test User', email: 'test@example.com' },
        },
        status: 'authenticated',
      });

      render(<Navigation />);

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /navigation menu/i, hidden: true })).toBeInTheDocument();
      });

      // Click on Nodes link
      const allNodesLinks = screen.getAllByRole('link', { name: 'Nodes' });
      const mobileNodesLink = allNodesLinks[allNodesLinks.length - 1];
      fireEvent.click(mobileNodesLink);

      await waitFor(() => {
        const content = document.querySelector('[data-state]');
        if (content) {
          expect(content.getAttribute('data-state')).not.toBe('open');
        }
      }, { timeout: 2000 });
    });

    it('closes mobile menu when authenticated user clicks Tree link', async () => {
      mockSession.mockReturnValue({
        data: {
          user: { name: 'Test User', email: 'test@example.com' },
        },
        status: 'authenticated',
      });

      render(<Navigation />);

      // Open the menu
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /navigation menu/i, hidden: true })).toBeInTheDocument();
      });

      // Click on Tree link
      const allTreeLinks = screen.getAllByRole('link', { name: 'Tree' });
      const mobileTreeLink = allTreeLinks[allTreeLinks.length - 1];
      fireEvent.click(mobileTreeLink);

      await waitFor(() => {
        const content = document.querySelector('[data-state]');
        if (content) {
          expect(content.getAttribute('data-state')).not.toBe('open');
        }
      }, { timeout: 2000 });
    });

    it('can reopen mobile menu after closing it', async () => {
      render(<Navigation />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });

      // Open menu
      fireEvent.click(menuButton);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /navigation menu/i, hidden: true })).toBeInTheDocument();
      });

      // Close by clicking a link
      const allHomeLinks = screen.getAllByRole('link', { name: 'Home' });
      const mobileHomeLink = allHomeLinks[allHomeLinks.length - 1];
      fireEvent.click(mobileHomeLink);

      // Wait for close
      await waitFor(() => {
        const content = document.querySelector('[data-state]');
        if (content) {
          expect(content.getAttribute('data-state')).not.toBe('open');
        }
      }, { timeout: 2000 });

      // Reopen menu
      fireEvent.click(menuButton);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /navigation menu/i, hidden: true })).toBeInTheDocument();
      });
    });

    it('maintains mobile menu state correctly across multiple open/close cycles', async () => {
      render(<Navigation />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });

      // First cycle
      fireEvent.click(menuButton);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /navigation menu/i, hidden: true })).toBeInTheDocument();
      });

      const allAboutLinks = screen.getAllByRole('link', { name: 'About' });
      fireEvent.click(allAboutLinks[allAboutLinks.length - 1]);

      await waitFor(() => {
        const content = document.querySelector('[data-state]');
        if (content) {
          expect(content.getAttribute('data-state')).not.toBe('open');
        }
      }, { timeout: 2000 });

      // Second cycle
      fireEvent.click(menuButton);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /navigation menu/i, hidden: true })).toBeInTheDocument();
      });

      const allHomeLinks = screen.getAllByRole('link', { name: 'Home' });
      fireEvent.click(allHomeLinks[allHomeLinks.length - 1]);

      await waitFor(() => {
        const content = document.querySelector('[data-state]');
        if (content) {
          expect(content.getAttribute('data-state')).not.toBe('open');
        }
      }, { timeout: 2000 });
    });
  });

  describe('Navigation Links', () => {
    it('renders correct href for Home', () => {
      render(<Navigation />);

      const homeLinks = screen.getAllByRole('link', { name: 'Home' });
      homeLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/');
      });
    });

    it('renders correct href for About', () => {
      render(<Navigation />);

      const aboutLinks = screen.getAllByRole('link', { name: 'About' });
      aboutLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/marketing/about-us');
      });
    });

    it('renders correct href for Nodes when authenticated', () => {
      mockSession.mockReturnValue({
        data: {
          user: { name: 'Test User', email: 'test@example.com' },
        },
        status: 'authenticated',
      });

      render(<Navigation />);

      const nodesLinks = screen.getAllByRole('link', { name: 'Nodes' });
      nodesLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/demo-nodes');
      });
    });

    it('renders correct href for Tree when authenticated', () => {
      mockSession.mockReturnValue({
        data: {
          user: { name: 'Test User', email: 'test@example.com' },
        },
        status: 'authenticated',
      });

      render(<Navigation />);

      const treeLinks = screen.getAllByRole('link', { name: 'Tree' });
      treeLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/demo-tree');
      });
    });
  });

  describe('Session State Changes', () => {
    it('updates navigation items when user logs in', () => {
      const { rerender } = render(<Navigation />);

      // Initially not authenticated
      expect(screen.queryByRole('link', { name: 'Nodes' })).not.toBeInTheDocument();

      // User logs in
      mockSession.mockReturnValue({
        data: {
          user: { name: 'Test User', email: 'test@example.com' },
        },
        status: 'authenticated',
      });

      rerender(<Navigation />);

      // Demo links should now appear
      expect(screen.getAllByRole('link', { name: 'Nodes' }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: 'Tree' }).length).toBeGreaterThan(0);
    });

    it('removes demo links when user logs out', () => {
      mockSession.mockReturnValue({
        data: {
          user: { name: 'Test User', email: 'test@example.com' },
        },
        status: 'authenticated',
      });

      const { rerender } = render(<Navigation />);

      // Demo links should be present
      expect(screen.getAllByRole('link', { name: 'Nodes' }).length).toBeGreaterThan(0);

      // User logs out
      mockSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      rerender(<Navigation />);

      // Demo links should no longer be present
      expect(screen.queryByRole('link', { name: 'Nodes' })).not.toBeInTheDocument();
    });
  });

  describe('Active Route Highlighting', () => {
    it('highlights Home when on root path', () => {
      mockPathname.mockReturnValue('/');

      render(<Navigation />);

      const homeLinks = screen.getAllByRole('link', { name: 'Home' });
      const activeHomeLink = homeLinks.find(link =>
        link.className.includes('text-foreground') &&
        !link.className.includes('text-foreground/60')
      );
      expect(activeHomeLink).toBeDefined();
    });

    it('highlights About when on about page', () => {
      mockPathname.mockReturnValue('/marketing/about-us');

      render(<Navigation />);

      const aboutLinks = screen.getAllByRole('link', { name: 'About' });
      const activeAboutLink = aboutLinks.find(link =>
        link.className.includes('text-foreground') &&
        !link.className.includes('text-foreground/60')
      );
      expect(activeAboutLink).toBeDefined();
    });

    it('highlights Nodes when on demo-nodes page', () => {
      mockSession.mockReturnValue({
        data: {
          user: { name: 'Test User', email: 'test@example.com' },
        },
        status: 'authenticated',
      });
      mockPathname.mockReturnValue('/demo-nodes');

      render(<Navigation />);

      const nodesLinks = screen.getAllByRole('link', { name: 'Nodes' });
      const activeNodesLink = nodesLinks.find(link =>
        link.className.includes('text-foreground') &&
        !link.className.includes('text-foreground/60')
      );
      expect(activeNodesLink).toBeDefined();
    });

    it('highlights Tree when on demo-tree page', () => {
      mockSession.mockReturnValue({
        data: {
          user: { name: 'Test User', email: 'test@example.com' },
        },
        status: 'authenticated',
      });
      mockPathname.mockReturnValue('/demo-tree');

      render(<Navigation />);

      const treeLinks = screen.getAllByRole('link', { name: 'Tree' });
      const activeTreeLink = treeLinks.find(link =>
        link.className.includes('text-foreground') &&
        !link.className.includes('text-foreground/60')
      );
      expect(activeTreeLink).toBeDefined();
    });

    it('does not highlight any link when on different page', () => {
      mockPathname.mockReturnValue('/some-other-page');

      render(<Navigation />);

      const homeLinks = screen.getAllByRole('link', { name: 'Home' });
      homeLinks.forEach(link => {
        expect(link.className).toContain('text-foreground/60');
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible menu button with sr-only text', () => {
      render(<Navigation />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(within(menuButton).getByText(/toggle menu/i)).toHaveClass('sr-only');
    });

    it('has accessible sheet title with sr-only class', async () => {
      render(<Navigation />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        const title = screen.getByRole('heading', { name: /navigation menu/i, hidden: true });
        expect(title).toHaveClass('sr-only');
      });
    });

    it('all navigation links are keyboard accessible', () => {
      render(<Navigation />);

      const allLinks = screen.getAllByRole('link');
      allLinks.forEach(link => {
        expect(link).toBeInTheDocument();
        // Links should be naturally keyboard accessible
        expect(link.tagName).toBe('A');
      });
    });

    it('mobile menu button is keyboard accessible', () => {
      render(<Navigation />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      
      menuButton.focus();
      expect(menuButton).toHaveFocus();
    });
  });

  describe('Layout and Styling', () => {
    it('renders sticky header', () => {
      const { container } = render(<Navigation />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
    });

    it('has proper z-index for overlay', () => {
      const { container } = render(<Navigation />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('z-50');
    });

    it('applies backdrop blur effect', () => {
      const { container } = render(<Navigation />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('backdrop-blur');
    });
  });
});

