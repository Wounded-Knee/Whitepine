import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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
      // Insert API call logic here
      // Example: const response = await api.getNodes(params);
      // return response.data;
      
      // Placeholder return
      return [];
    } catch (error) {
      return rejectWithValue('Failed to fetch nodes');
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
      // Insert API call logic here
      // Example: const response = await api.getNode(nodeId);
      // return response.data;
      
      // Placeholder return
      throw new Error('Not implemented');
    } catch (error) {
      return rejectWithValue('Failed to fetch node');
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
      // Insert API call logic here
      // Example: const response = await api.createNode(nodeData);
      // return response.data;
      
      // Placeholder return
      throw new Error('Not implemented');
    } catch (error) {
      return rejectWithValue('Failed to create node');
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
      // Insert API call logic here
      // Example: const response = await api.updateNode(id, updates);
      // return response.data;
      
      // Placeholder return
      throw new Error('Not implemented');
    } catch (error) {
      return rejectWithValue('Failed to update node');
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
      // Insert API call logic here
      // Example: await api.deleteNode(nodeId);
      // return nodeId;
      
      // Placeholder return
      throw new Error('Not implemented');
    } catch (error) {
      return rejectWithValue('Failed to delete node');
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
      // Insert API call logic here
      // Example: const response = await api.bulkUpdateNodes(nodeIds, updates);
      // return response.data;
      
      // Placeholder return
      throw new Error('Not implemented');
    } catch (error) {
      return rejectWithValue('Failed to bulk update nodes');
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
      .addCase(fetchNodeById.fulfilled, (state, action) => {
        const node = action.payload;
        const nodeId = node._id.toString();
        if (!state.byId[nodeId]) {
          state.allIds.push(nodeId);
        }
        state.byId[nodeId] = node;
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
