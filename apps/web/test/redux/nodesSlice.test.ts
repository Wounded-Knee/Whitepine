import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import nodesReducer, { 
  addNode, 
  updateNodeLocal, 
  removeNode, 
  clearNodes,
  fetchNodes 
} from '@/store/slices/nodesSlice';
import type { Node } from '@/store/types';
import { NODE_TYPES } from '@whitepine/types';

// Mock node data
const mockNode: Node = {
  _id: '1' as any,
  kind: NODE_TYPES.USER,
  email: 'test@example.com',
  name: 'Test User',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockNode2: Node = {
  _id: '2' as any,
  kind: 'Base',
  name: 'Test Base Node',
  createdAt: new Date('2024-01-02'),
  updatedAt: new Date('2024-01-02'),
};

describe('nodesSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        nodes: nodesReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            ignoredPaths: ['nodes.byId.*.createdAt', 'nodes.byId.*.updatedAt'],
          },
        }),
    });
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const state = store.getState().nodes;
      expect(state.byId).toEqual({});
      expect(state.allIds).toEqual([]);
    });
  });

  describe('addNode', () => {
    it('should add a node to the store', () => {
      store.dispatch(addNode(mockNode));
      
      const state = store.getState().nodes;
      expect(state.byId['1']).toEqual(mockNode);
      expect(state.allIds).toContain('1');
    });

    it('should add multiple nodes', () => {
      store.dispatch(addNode(mockNode));
      store.dispatch(addNode(mockNode2));
      
      const state = store.getState().nodes;
      expect(Object.keys(state.byId)).toHaveLength(2);
      expect(state.allIds).toHaveLength(2);
    });

    it('should not duplicate nodes with same ID', () => {
      store.dispatch(addNode(mockNode));
      store.dispatch(addNode(mockNode)); // Same node again
      
      const state = store.getState().nodes;
      expect(Object.keys(state.byId)).toHaveLength(1);
      expect(state.allIds).toHaveLength(1);
    });
  });

  describe('updateNodeLocal', () => {
    beforeEach(() => {
      store.dispatch(addNode(mockNode));
    });

    it('should update an existing node', () => {
      const updates = { name: 'Updated Name' };
      store.dispatch(updateNodeLocal({ id: '1', updates }));
      
      const state = store.getState().nodes;
      expect(state.byId['1'].name).toBe('Updated Name');
    });

    it('should not affect other nodes', () => {
      store.dispatch(addNode(mockNode2));
      
      const updates = { name: 'Updated Name' };
      store.dispatch(updateNodeLocal({ id: '1', updates }));
      
      const state = store.getState().nodes;
      expect(state.byId['2'].name).toBe(mockNode2.name);
    });
  });

  describe('removeNode', () => {
    beforeEach(() => {
      store.dispatch(addNode(mockNode));
      store.dispatch(addNode(mockNode2));
    });

    it('should remove a node from the store', () => {
      store.dispatch(removeNode('1'));
      
      const state = store.getState().nodes;
      expect(state.byId['1']).toBeUndefined();
      expect(state.allIds).not.toContain('1');
      expect(state.allIds).toContain('2');
    });
  });

  describe('clearNodes', () => {
    beforeEach(() => {
      store.dispatch(addNode(mockNode));
      store.dispatch(addNode(mockNode2));
    });

    it('should clear all nodes', () => {
      store.dispatch(clearNodes());
      
      const state = store.getState().nodes;
      expect(state.byId).toEqual({});
      expect(state.allIds).toEqual([]);
    });
  });

  describe('fetchNodes async thunk', () => {
    it('should handle fetchNodes.pending', () => {
      store.dispatch(fetchNodes.pending('', { clusterId: 'test' }));
      // The loading state is handled in UI slice, so we just verify no error
      const state = store.getState().nodes;
      expect(state).toBeDefined();
    });

    it('should handle fetchNodes.fulfilled', () => {
      const nodes = [mockNode, mockNode2];
      store.dispatch(fetchNodes.fulfilled(nodes, '', { clusterId: 'test' }));
      
      const state = store.getState().nodes;
      expect(Object.keys(state.byId)).toHaveLength(2);
      expect(state.allIds).toHaveLength(2);
    });

    it('should handle fetchNodes.rejected', () => {
      store.dispatch(fetchNodes.rejected(new Error('Test error'), '', { clusterId: 'test' }));
      // The error state is handled in UI slice, so we just verify no error
      const state = store.getState().nodes;
      expect(state).toBeDefined();
    });
  });
});
