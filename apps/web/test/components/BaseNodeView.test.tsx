import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseNodeView } from '@web/components/NodeView';
import nodesReducer from '@web/store/slices/nodesSlice';
import uiReducer from '@web/store/slices/uiSlice';
import cacheReducer from '@web/store/slices/cacheSlice';
import type { Node } from '@web/store/types';

// Mock API client
vi.mock('@web/lib/api-client', () => ({
  apiClient: {
    getNode: vi.fn(),
    getNodes: vi.fn(),
    createNode: vi.fn(),
    updateNode: vi.fn(),
    deleteNode: vi.fn(),
  },
}));

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      nodes: nodesReducer,
      ui: uiReducer,
      cache: cacheReducer,
    },
    preloadedState: {
      nodes: {
        byId: {},
        allIds: [],
      },
      ui: {
        selectedNodeIds: [],
        filters: {
          type: undefined,
          status: undefined,
          search: undefined,
          dateRange: undefined,
        },
        sortOptions: {
          field: 'createdAt',
          direction: 'desc',
        },
        loading: {
          nodes: false,
          operations: {},
        },
        error: null,
        viewMode: 'list',
      },
      cache: {
        lastFetched: {},
        cacheKeys: {},
        invalidationRules: {
          timeBased: {},
          actionBased: {},
        },
        metadata: {},
      },
      ...initialState,
    },
  });
};

// Test data
const mockBaseNode: Node = {
  _id: '507f1f77bcf86cd799439011' as any,
  kind: 'BaseNode',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  deletedAt: null,
  createdBy: '507f1f77bcf86cd799439012' as any,
  ownerId: '507f1f77bcf86cd799439012' as any,
};

const mockUserNode: Node = {
  _id: '507f1f77bcf86cd799439021' as any,
  kind: 'User',
  email: 'test@example.com',
  name: 'Test User',
  bio: 'Test bio',
  isActive: true,
  avatar: 'https://example.com/avatar.jpg',
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: {
      email: true,
      push: false,
    },
  },
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  deletedAt: null,
  createdBy: '507f1f77bcf86cd799439012' as any,
  ownerId: '507f1f77bcf86cd799439012' as any,
};

describe('BaseNodeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when node is not in store and fetching', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <BaseNodeView nodeId="507f1f77bcf86cd799439011" />
      </Provider>
    );

    // Should show loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders node data when available in store', () => {
    const store = createTestStore({
      nodes: {
        byId: {
          '507f1f77bcf86cd799439011': mockBaseNode,
        },
        allIds: ['507f1f77bcf86cd799439011'],
      },
    });

    render(
      <Provider store={store}>
        <BaseNodeView nodeId="507f1f77bcf86cd799439011" />
      </Provider>
    );

    // Should display node information
    expect(screen.getByText('Base Node')).toBeInTheDocument();
    expect(screen.getByText('ID: 507f1f77bcf86cd799439011')).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    const { apiClient } = await import('@web/lib/api-client');
    vi.mocked(apiClient.getNode).mockRejectedValue(new Error('Network error'));

    const store = createTestStore();

    render(
      <Provider store={store}>
        <BaseNodeView nodeId="507f1f77bcf86cd799439011" />
      </Provider>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error loading node/i)).toBeInTheDocument();
    });
  });

  it('renders not found state when node is null', () => {
    const store = createTestStore({
      nodes: {
        byId: {},
        allIds: [],
      },
    });

    render(
      <Provider store={store}>
        <BaseNodeView nodeId="nonexistent-id" />
      </Provider>
    );

    // Should show not found message
    expect(screen.getByText(/node not found/i)).toBeInTheDocument();
  });

  it('uses custom render prop when provided', () => {
    const store = createTestStore({
      nodes: {
        byId: {
          '507f1f77bcf86cd799439011': mockBaseNode,
        },
        allIds: ['507f1f77bcf86cd799439011'],
      },
    });

    const customRender = (node: Node | null, isLoading: boolean, error: string | null) => {
      if (isLoading) return <div>Custom Loading</div>;
      if (error) return <div>Custom Error: {error}</div>;
      if (!node) return <div>Custom Not Found</div>;
      return <div>Custom Node: {node._id.toString()}</div>;
    };

    render(
      <Provider store={store}>
        <BaseNodeView nodeId="507f1f77bcf86cd799439011">
          {customRender}
        </BaseNodeView>
      </Provider>
    );

    // Should use custom render function
    expect(screen.getByText(/Custom Node:/)).toBeInTheDocument();
    expect(screen.getByText('Custom Node: 507f1f77bcf86cd799439011')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const store = createTestStore({
      nodes: {
        byId: {
          '507f1f77bcf86cd799439011': mockBaseNode,
        },
        allIds: ['507f1f77bcf86cd799439011'],
      },
    });

    render(
      <Provider store={store}>
        <BaseNodeView 
          nodeId="507f1f77bcf86cd799439011" 
          className="custom-class"
        />
      </Provider>
    );

    // Should apply custom className
    const container = screen.getByText('Base Node').closest('div');
    expect(container?.parentElement).toHaveClass('custom-class');
  });

  it('warns when node type is not BaseNode', () => {
    const store = createTestStore({
      nodes: {
        byId: {
          '507f1f77bcf86cd799439021': mockUserNode,
        },
        allIds: ['507f1f77bcf86cd799439021'],
      },
    });

    render(
      <Provider store={store}>
        <BaseNodeView nodeId="507f1f77bcf86cd799439021" />
      </Provider>
    );

    // Should show warning about node type
    expect(screen.getByText(/only supports BaseNode instances/i)).toBeInTheDocument();
    expect(screen.getByText(/Node type: User/)).toBeInTheDocument();
  });
});

describe('BaseNodeView Integration', () => {
  it('dispatches fetchNodeById when node is not in store', async () => {
    const { apiClient } = await import('@web/lib/api-client');
    vi.mocked(apiClient.getNode).mockResolvedValue(mockBaseNode);

    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BaseNodeView nodeId="507f1f77bcf86cd799439011" />
      </Provider>
    );

    // Should dispatch fetchNodeById
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'nodes/fetchNodeById/pending',
        })
      );
    });
  });

  it('does not fetch when node is already in store', () => {
    const store = createTestStore({
      nodes: {
        byId: {
          '507f1f77bcf86cd799439011': mockBaseNode,
        },
        allIds: ['507f1f77bcf86cd799439011'],
      },
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BaseNodeView nodeId="507f1f77bcf86cd799439011" />
      </Provider>
    );

    // Should not dispatch fetchNodeById since node is already in store
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'nodes/fetchNodeById/pending',
      })
    );
  });
});
