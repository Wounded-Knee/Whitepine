import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@web/lib/api-client';
import type { Node, NormalizedNodes, AsyncThunkConfig } from '../types';

// Initial state
const initialState: NormalizedNodes = {
  byId: {},
  allIds: [],
};

// Async thunks for API operations
export const fetchNodes = createAsyncThunk<
  Node[],
  { clusterId?: string; limit?: number; offset?: number },
  AsyncThunkConfig
>(
  'nodes/fetchNodes',
  async (params, { rejectWithValue }) => {
    try {
      const { nodes } = await apiClient.getNodes({
        limit: params.limit,
        offset: params.offset,
      });
      return nodes as Node[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch nodes';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchNodeById = createAsyncThunk<
  Node,
  string,
  AsyncThunkConfig
>(
  'nodes/fetchNodeById',
  async (nodeId, { rejectWithValue }) => {
    try {
      const fetchedNode = await apiClient.getNode(nodeId);
      return fetchedNode as Node;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch node';
      return rejectWithValue(errorMessage);
    }
  },
  {
    // Use Redux Toolkit's built-in request deduplication
    condition: (nodeId, { getState }) => {
      const state = getState();
      const node = state.nodes.byId[nodeId];
      
      // Don't fetch if node already exists in store
      if (node) {
        console.log(`[fetchNodeById] Condition: Node ${nodeId} already exists, skipping fetch`);
        return false;
      }
      
      console.log(`[fetchNodeById] Condition: Node ${nodeId} needs to be fetched`);
      return true;
    }
  }
);

export const createNode = createAsyncThunk<
  Node,
  Partial<Node>,
  AsyncThunkConfig
>(
  'nodes/createNode',
  async (nodeData, { rejectWithValue }) => {
    try {
      const node = await apiClient.createNode(nodeData);
      return node as Node;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create node';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateNode = createAsyncThunk<
  Node,
  { id: string; updates: Partial<Node> },
  AsyncThunkConfig
>(
  'nodes/updateNode',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const node = await apiClient.updateNode(id, updates);
      return node as Node;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update node';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteNode = createAsyncThunk<
  string,
  string,
  AsyncThunkConfig
>(
  'nodes/deleteNode',
  async (nodeId, { rejectWithValue }) => {
    try {
      await apiClient.deleteNode(nodeId);
      return nodeId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete node';
      return rejectWithValue(errorMessage);
    }
  }
);

export const bulkUpdateNodes = createAsyncThunk<
  Node[],
  { nodeIds: string[]; updates: Partial<Node> },
  AsyncThunkConfig
>(
  'nodes/bulkUpdateNodes',
  async ({ nodeIds, updates }, { rejectWithValue }) => {
    try {
      // For now, we'll update nodes one by one since we don't have a bulk endpoint
      // In a real implementation, you might want to add a bulk update endpoint to the API
      const updatedNodes: Node[] = [];
      
      for (const nodeId of nodeIds) {
        const node = await apiClient.updateNode(nodeId, updates);
        updatedNodes.push(node as Node);
      }
      
      return updatedNodes;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk update nodes';
      return rejectWithValue(errorMessage);
    }
  }
);

// Helper function to normalize nodes array
const normalizeNodes = (nodes: Node[]): NormalizedNodes => {
  const byId: Record<string, Node> = {};
  const allIds: string[] = [];

  nodes.forEach((node) => {
    const nodeId = node._id.toString();
    byId[nodeId] = node;
    allIds.push(nodeId);
  });

  return { byId, allIds };
};

// Helper function to add nodes to existing normalized state
const addNodesToState = (state: NormalizedNodes, nodes: Node[]): NormalizedNodes => {
  const newById = { ...state.byId };
  const newAllIds = [...state.allIds];

  nodes.forEach((node) => {
    const nodeId = node._id.toString();
    if (!newById[nodeId]) {
      newAllIds.push(nodeId);
    }
    newById[nodeId] = node;
  });

  return { byId: newById, allIds: newAllIds };
};

// Slice
const nodesSlice = createSlice({
  name: 'nodes',
  initialState,
  reducers: {
    // Synchronous actions
    addNode: (state, action: PayloadAction<Node>) => {
      const node = action.payload;
      const nodeId = node._id.toString();
      if (!state.byId[nodeId]) {
        state.allIds.push(nodeId);
      }
      state.byId[nodeId] = node;
    },
    
    updateNodeLocal: (state, action: PayloadAction<{ id: string; updates: Partial<Node> }>) => {
      const { id, updates } = action.payload;
      if (state.byId[id]) {
        state.byId[id] = { ...state.byId[id], ...updates };
      }
    },
    
    removeNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      delete state.byId[nodeId];
      state.allIds = state.allIds.filter(id => id !== nodeId);
    },
    
    setNodes: (state, action: PayloadAction<Node[]>) => {
      const normalized = normalizeNodes(action.payload);
      state.byId = normalized.byId;
      state.allIds = normalized.allIds;
    },
    
    clearNodes: (state) => {
      state.byId = {};
      state.allIds = [];
    },
    
    // Bulk operations
    addNodes: (state, action: PayloadAction<Node[]>) => {
      const normalized = addNodesToState(state, action.payload);
      state.byId = normalized.byId;
      state.allIds = normalized.allIds;
    },
    
    removeNodes: (state, action: PayloadAction<string[]>) => {
      const nodeIds = action.payload;
      nodeIds.forEach(nodeId => {
        delete state.byId[nodeId];
      });
      state.allIds = state.allIds.filter(id => !nodeIds.includes(id));
    },
  },
  extraReducers: (builder) => {
    // Fetch nodes
    builder
      .addCase(fetchNodes.pending, (state) => {
        // Loading state handled in UI slice
      })
      .addCase(fetchNodes.fulfilled, (state, action) => {
        const normalized = normalizeNodes(action.payload);
        state.byId = normalized.byId;
        state.allIds = normalized.allIds;
      })
      .addCase(fetchNodes.rejected, (state, action) => {
        // Error state handled in UI slice
      });

    // Fetch single node
    builder
      .addCase(fetchNodeById.pending, (state, action) => {
        const nodeId = action.meta.arg;
        // Clear any previous error for this node
        if (state.error) {
          delete state.error[`fetchNodeById-${nodeId}`];
        }
      })
      .addCase(fetchNodeById.fulfilled, (state, action) => {
        const node = action.payload;
        const nodeId = node._id.toString();
        if (!state.byId[nodeId]) {
          state.allIds.push(nodeId);
        }
        state.byId[nodeId] = node;
        // Clear any error for this node
        if (state.error) {
          delete state.error[`fetchNodeById-${nodeId}`];
        }
      })
      .addCase(fetchNodeById.rejected, (state, action) => {
        const nodeId = action.meta.arg;
        const errorMessage = action.payload as string;
        // Store error for this specific node
        if (!state.error) state.error = {};
        state.error[`fetchNodeById-${nodeId}`] = errorMessage;
      });

    // Create node
    builder
      .addCase(createNode.fulfilled, (state, action) => {
        const node = action.payload;
        const nodeId = node._id.toString();
        state.byId[nodeId] = node;
        state.allIds.push(nodeId);
      });

    // Update node
    builder
      .addCase(updateNode.fulfilled, (state, action) => {
        const node = action.payload;
        const nodeId = node._id.toString();
        state.byId[nodeId] = node;
      });

    // Delete node
    builder
      .addCase(deleteNode.fulfilled, (state, action) => {
        const nodeId = action.payload;
        delete state.byId[nodeId];
        state.allIds = state.allIds.filter(id => id !== nodeId);
      });

    // Bulk update nodes
    builder
      .addCase(bulkUpdateNodes.fulfilled, (state, action) => {
        action.payload.forEach(node => {
          const nodeId = node._id.toString();
          state.byId[nodeId] = node;
        });
      });
  },
});

export const {
  addNode,
  updateNodeLocal,
  removeNode,
  setNodes,
  clearNodes,
  addNodes,
  removeNodes,
} = nodesSlice.actions;

export default nodesSlice.reducer;
