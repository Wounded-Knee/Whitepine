import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer, { 
  selectNode, 
  deselectNode, 
  clearSelection,
  setFilter,
  setSortOptions,
  setViewMode,
  setError,
  clearError
} from '@/store/slices/uiSlice';

describe('uiSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ui: uiReducer,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().ui;
      expect(state.selectedNodeIds).toEqual([]);
      expect(state.filters).toEqual({
        type: undefined,
        status: undefined,
        search: undefined,
        dateRange: undefined,
      });
      expect(state.sortOptions).toEqual({
        field: 'createdAt',
        direction: 'desc',
      });
      expect(state.loading.nodes).toBe(false);
      expect(state.loading.operations).toEqual({});
      expect(state.error).toBeNull();
      expect(state.viewMode).toBe('list');
    });
  });

  describe('node selection', () => {
    it('should select a node', () => {
      store.dispatch(selectNode('node1'));
      
      const state = store.getState().ui;
      expect(state.selectedNodeIds).toContain('node1');
    });

    it('should not duplicate selected nodes', () => {
      store.dispatch(selectNode('node1'));
      store.dispatch(selectNode('node1')); // Same node again
      
      const state = store.getState().ui;
      expect(state.selectedNodeIds).toEqual(['node1']);
    });

    it('should deselect a node', () => {
      store.dispatch(selectNode('node1'));
      store.dispatch(selectNode('node2'));
      store.dispatch(deselectNode('node1'));
      
      const state = store.getState().ui;
      expect(state.selectedNodeIds).not.toContain('node1');
      expect(state.selectedNodeIds).toContain('node2');
    });

    it('should clear all selections', () => {
      store.dispatch(selectNode('node1'));
      store.dispatch(selectNode('node2'));
      store.dispatch(clearSelection());
      
      const state = store.getState().ui;
      expect(state.selectedNodeIds).toEqual([]);
    });
  });

  describe('filters', () => {
    it('should set a filter', () => {
      store.dispatch(setFilter({ key: 'type', value: 'User' }));
      
      const state = store.getState().ui;
      expect(state.filters.type).toBe('User');
    });

    it('should clear a filter when value is undefined', () => {
      store.dispatch(setFilter({ key: 'type', value: 'User' }));
      store.dispatch(setFilter({ key: 'type', value: undefined }));
      
      const state = store.getState().ui;
      expect(state.filters.type).toBeUndefined();
    });
  });

  describe('sorting', () => {
    it('should set sort options', () => {
      store.dispatch(setSortOptions({ field: 'name', direction: 'asc' }));
      
      const state = store.getState().ui;
      expect(state.sortOptions.field).toBe('name');
      expect(state.sortOptions.direction).toBe('asc');
    });
  });

  describe('view mode', () => {
    it('should set view mode', () => {
      store.dispatch(setViewMode('grid'));
      
      const state = store.getState().ui;
      expect(state.viewMode).toBe('grid');
    });
  });

  describe('error handling', () => {
    it('should set an error', () => {
      store.dispatch(setError('Test error message'));
      
      const state = store.getState().ui;
      expect(state.error).toBe('Test error message');
    });

    it('should clear an error', () => {
      store.dispatch(setError('Test error message'));
      store.dispatch(clearError());
      
      const state = store.getState().ui;
      expect(state.error).toBeNull();
    });
  });
});
