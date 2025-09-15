import { useAppDispatch, useAppSelector, type RootState } from './index';

// Re-export the typed hooks
export { useAppDispatch, useAppSelector };

// Selector hooks for common use cases
export const useNodes = () => useAppSelector((state: RootState) => state.nodes);
export const useUI = () => useAppSelector((state: RootState) => state.ui);
export const useCache = () => useAppSelector((state: RootState) => state.cache);

// Node selectors
export const useNodeById = (id: string) => 
  useAppSelector((state: RootState) => state.nodes.byId[id]);

export const useAllNodes = () => 
  useAppSelector((state: RootState) => 
    state.nodes.allIds.map(id => state.nodes.byId[id])
  );

export const useNodeIds = () => 
  useAppSelector((state: RootState) => state.nodes.allIds);

// UI selectors
export const useSelectedNodes = () => 
  useAppSelector((state: RootState) => state.ui.selectedNodeIds);

export const useFilters = () => 
  useAppSelector((state: RootState) => state.ui.filters);

export const useSortOptions = () => 
  useAppSelector((state: RootState) => state.ui.sortOptions);

export const useLoading = () => 
  useAppSelector((state: RootState) => state.ui.loading);

export const useError = () => 
  useAppSelector((state: RootState) => state.ui.error);

export const useViewMode = () => 
  useAppSelector((state: RootState) => state.ui.viewMode);

// Cache selectors
export const useLastFetched = (key: string) => 
  useAppSelector((state: RootState) => state.cache.lastFetched[key]);

export const useCacheKey = (key: string) => 
  useAppSelector((state: RootState) => state.cache.cacheKeys[key]);

export const useCacheMetadata = (key: string) => 
  useAppSelector((state: RootState) => state.cache.metadata[key]);

// Computed selectors
export const useFilteredNodes = () => 
  useAppSelector((state: RootState) => {
    const { nodes, ui } = state;
    let filteredNodes = nodes.allIds.map(id => nodes.byId[id]);

    // Apply filters
    if (ui.filters.type) {
      filteredNodes = filteredNodes.filter(node => node.type === ui.filters.type);
    }
    
    if (ui.filters.status) {
      filteredNodes = filteredNodes.filter(node => node.status === ui.filters.status);
    }
    
    if (ui.filters.search) {
      const searchTerm = ui.filters.search.toLowerCase();
      filteredNodes = filteredNodes.filter(node => 
        node.name?.toLowerCase().includes(searchTerm) ||
        node.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    const { field, direction } = ui.sortOptions;
    filteredNodes.sort((a, b) => {
      const aValue = a[field as keyof typeof a];
      const bValue = b[field as keyof typeof b];
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredNodes;
  });

export const useSelectedNodesData = () => 
  useAppSelector((state: RootState) => 
    state.ui.selectedNodeIds.map(id => state.nodes.byId[id]).filter(Boolean)
  );
