import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import NodeTreeVisualization from '@web/components/NodeTreeVisualization';
import { apiClient } from '@web/lib/api-client';

// Mock all external dependencies
vi.mock('@web/lib/api-client', () => ({
  apiClient: {
    getNodes: vi.fn(),
  },
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  getSession: vi.fn(() => Promise.resolve(null)),
}));

// Mock the NodeView components
vi.mock('@web/components/NodeView', () => ({
  BaseNodeView: ({ nodeId }: { nodeId: string }) => (
    <div data-testid={`node-view-${nodeId}`}>Node View for {nodeId}</div>
  ),
}));

// Mock D3 with a simpler approach
const createMockChain = () => ({
  attr: vi.fn(() => createMockChain()),
  style: vi.fn(() => createMockChain()),
  text: vi.fn(() => createMockChain()),
  on: vi.fn(() => createMockChain()),
  append: vi.fn(() => createMockChain()),
  selectAll: vi.fn(() => createMockChain()),
});

vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({
      data: vi.fn(() => ({
        enter: vi.fn(() => createMockChain())
      }))
    })),
    append: vi.fn(() => createMockChain()),
    attr: vi.fn(() => createMockChain()),
    call: vi.fn(() => createMockChain()),
  })),
  tree: vi.fn(() => ({
    size: vi.fn(() => ({
      separation: vi.fn(() => ({}))
    }))
  })),
  hierarchy: vi.fn(() => ({})),
  linkRadial: vi.fn(() => ({
    angle: vi.fn(() => ({
      radius: vi.fn(() => ({}))
    }))
  })),
  zoom: vi.fn(() => ({
    scaleExtent: vi.fn(() => ({
      on: vi.fn(() => ({}))
    }))
  }))
}));

describe('NodeTreeVisualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<NodeTreeVisualization />);
    expect(screen.getByText('Loading node tree...')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    const mockError = new Error('API Error');
    vi.mocked(apiClient.getNodes).mockRejectedValue(mockError);

    render(<NodeTreeVisualization />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading visualization: API Error/)).toBeInTheDocument();
    });
  });

  it('renders tree visualization with nodes', async () => {
    const mockNodes = [
      {
        _id: 'wp_test1',
        kind: 'post',
        content: 'Test post content',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      },
      {
        _id: 'wp_test2',
        kind: 'User',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }
    ];

    vi.mocked(apiClient.getNodes).mockResolvedValue({
      nodes: mockNodes,
      pagination: { total: 2, page: 1, limit: 1000, totalPages: 1 }
    });

    render(<NodeTreeVisualization />);

    await waitFor(() => {
      // Should not show loading or error
      expect(screen.queryByText('Loading node tree...')).not.toBeInTheDocument();
      expect(screen.queryByText(/Error loading visualization/)).not.toBeInTheDocument();
    });
  });

  it('renders empty state when no nodes found', async () => {
    vi.mocked(apiClient.getNodes).mockResolvedValue({
      nodes: [],
      pagination: { total: 0, page: 1, limit: 1000, totalPages: 0 }
    });

    render(<NodeTreeVisualization />);

    await waitFor(() => {
      expect(screen.getByText(/No nodes found in the database/)).toBeInTheDocument();
    });
  });
});
