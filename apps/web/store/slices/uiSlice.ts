import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UIState } from '../types';

// Initial state
const initialState: UIState = {
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
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Selection actions
    selectNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      if (!state.selectedNodeIds.includes(nodeId)) {
        state.selectedNodeIds.push(nodeId);
      }
    },
    
    deselectNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      state.selectedNodeIds = state.selectedNodeIds.filter(id => id !== nodeId);
    },
    
    selectNodes: (state, action: PayloadAction<string[]>) => {
      const nodeIds = action.payload;
      const newSelections = nodeIds.filter(id => !state.selectedNodeIds.includes(id));
      state.selectedNodeIds = [...state.selectedNodeIds, ...newSelections];
    },
    
    deselectNodes: (state, action: PayloadAction<string[]>) => {
      const nodeIds = action.payload;
      state.selectedNodeIds = state.selectedNodeIds.filter(id => !nodeIds.includes(id));
    },
    
    clearSelection: (state) => {
      state.selectedNodeIds = [];
    },
    
    toggleNodeSelection: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const index = state.selectedNodeIds.indexOf(nodeId);
      if (index > -1) {
        state.selectedNodeIds.splice(index, 1);
      } else {
        state.selectedNodeIds.push(nodeId);
      }
    },
    
    // Filter actions
    setFilter: (state, action: PayloadAction<{ key: keyof UIState['filters']; value: any }>) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    
    setFilters: (state, action: PayloadAction<Partial<UIState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        type: undefined,
        status: undefined,
        search: undefined,
        dateRange: undefined,
      };
    },
    
    // Sort actions
    setSortOptions: (state, action: PayloadAction<UIState['sortOptions']>) => {
      state.sortOptions = action.payload;
    },
    
    toggleSortDirection: (state) => {
      state.sortOptions.direction = state.sortOptions.direction === 'asc' ? 'desc' : 'asc';
    },
    
    // Loading actions
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      const { key, value } = action.payload;
      if (key === 'nodes') {
        state.loading.nodes = value;
      } else {
        state.loading.operations[key] = value;
      }
    },
    
    setOperationLoading: (state, action: PayloadAction<{ operation: string; loading: boolean }>) => {
      const { operation, loading } = action.payload;
      state.loading.operations[operation] = loading;
    },
    
    clearLoading: (state) => {
      state.loading = {
        nodes: false,
        operations: {},
      };
    },
    
    // Error actions
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // View mode actions
    setViewMode: (state, action: PayloadAction<UIState['viewMode']>) => {
      state.viewMode = action.payload;
    },
    
    // Reset actions
    resetUI: (state) => {
      return initialState;
    },
  },
});

export const {
  selectNode,
  deselectNode,
  selectNodes,
  deselectNodes,
  clearSelection,
  toggleNodeSelection,
  setFilter,
  setFilters,
  clearFilters,
  setSortOptions,
  toggleSortDirection,
  setLoading,
  setOperationLoading,
  clearLoading,
  setError,
  clearError,
  setViewMode,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
