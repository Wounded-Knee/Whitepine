'use client';

import { useState } from 'react';
import { 
  useAppDispatch, 
  useNodes, 
  useUI, 
  useSelectedNodes,
  useFilteredNodes,
  useLoading,
  useError
} from '@/store/hooks';
import { 
  addNode, 
  updateNodeLocal, 
  removeNode, 
  clearNodes
} from '@/store/slices/nodesSlice';
import { 
  selectNode, 
  deselectNode, 
  clearSelection,
  setFilter,
  setSortOptions,
  setViewMode,
  setError,
  clearError
} from '@/store/slices/uiSlice';
import { NODE_TYPES } from '@whitepine/types';

// Mock node data for demo
const mockNodes = [
  {
    _id: '1' as any,
    kind: NODE_TYPES.USER,
    email: 'john@example.com',
    name: 'John Doe',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    _id: '2' as any,
    kind: NODE_TYPES.USER,
    email: 'jane@example.com',
    name: 'Jane Smith',
    isActive: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    _id: '3' as any,
    kind: 'Base',
    name: 'Base Node 1',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

export default function ReduxDemo() {
  const dispatch = useAppDispatch();
  const nodes = useNodes();
  const ui = useUI();
  const selectedNodes = useSelectedNodes();
  const filteredNodes = useFilteredNodes();
  const loading = useLoading();
  const error = useError();

  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeEmail, setNewNodeEmail] = useState('');

  const handleAddMockNodes = () => {
    mockNodes.forEach(node => {
      dispatch(addNode(node as any));
    });
  };

  const handleAddNode = () => {
    if (!newNodeName) return;
    
    const newNode = {
      _id: Date.now().toString() as any,
      kind: NODE_TYPES.USER,
      email: newNodeEmail || `${newNodeName.toLowerCase()}@example.com`,
      name: newNodeName,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    dispatch(addNode(newNode as any));
    setNewNodeName('');
    setNewNodeEmail('');
  };

  const handleUpdateNode = (nodeId: string) => {
    dispatch(updateNodeLocal({ 
      id: nodeId, 
      updates: { 
        name: `${(nodes.byId[nodeId] as any)?.name} (Updated)`,
        updatedAt: new Date()
      } 
    }));
  };

  const handleRemoveNode = (nodeId: string) => {
    dispatch(removeNode(nodeId));
  };

  const handleSelectNode = (nodeId: string) => {
    if (selectedNodes.includes(nodeId)) {
      dispatch(deselectNode(nodeId));
    } else {
      dispatch(selectNode(nodeId));
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    dispatch(setFilter({ key: filterType as any, value: value || undefined }));
  };

  const handleSortChange = (field: string) => {
    const direction = ui.sortOptions.field === field && ui.sortOptions.direction === 'asc' ? 'desc' : 'asc';
    dispatch(setSortOptions({ field, direction }));
  };

  const handleViewModeChange = (mode: 'list' | 'grid' | 'tree') => {
    dispatch(setViewMode(mode));
  };

  const handleTestError = () => {
    dispatch(setError('This is a test error message'));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Redux Store Demo</h1>
        
        {/* Store State Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Store Statistics</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Total Nodes:</strong> {nodes.allIds.length}</p>
              <p><strong>Selected Nodes:</strong> {selectedNodes.length}</p>
              <p><strong>Filtered Nodes:</strong> {filteredNodes.length}</p>
              <p><strong>View Mode:</strong> {ui.viewMode}</p>
              <p><strong>Loading:</strong> {loading.nodes ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Filters</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Type:</strong> {ui.filters.type || 'All'}</p>
              <p><strong>Status:</strong> {ui.filters.status || 'All'}</p>
              <p><strong>Search:</strong> {ui.filters.search || 'None'}</p>
              <p><strong>Sort:</strong> {ui.sortOptions.field} ({ui.sortOptions.direction})</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Actions</h3>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddMockNodes}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Mock Nodes
            </button>
            
            <button
              onClick={() => dispatch(clearNodes())}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All Nodes
            </button>
            
            <button
              onClick={() => dispatch(clearSelection())}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Selection
            </button>
            
            <button
              onClick={handleTestError}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Test Error
            </button>
            
            {error && (
              <button
                onClick={handleClearError}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Clear Error
              </button>
            )}
          </div>

          {/* Add New Node */}
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                className="border rounded px-3 py-2"
                placeholder="Node name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={newNodeEmail}
                onChange={(e) => setNewNodeEmail(e.target.value)}
                className="border rounded px-3 py-2"
                placeholder="Email (optional)"
              />
            </div>
            <button
              onClick={handleAddNode}
              disabled={!newNodeName}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              Add Node
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Filters & Controls</h3>
          
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Type</label>
              <select
                value={ui.filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">All Types</option>
                <option value="User">User</option>
                <option value="Base">Base</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={ui.filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="border rounded px-3 py-2"
                placeholder="Search nodes..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Sort by</label>
              <select
                value={ui.sortOptions.field}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="name">Name</option>
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">View Mode</label>
              <select
                value={ui.viewMode}
                onChange={(e) => handleViewModeChange(e.target.value as any)}
                className="border rounded px-3 py-2"
              >
                <option value="list">List</option>
                <option value="grid">Grid</option>
                <option value="tree">Tree</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-red-800 font-medium">Error: {error}</p>
              <button
                onClick={handleClearError}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Nodes List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Nodes ({filteredNodes.length})</h3>
          
          {filteredNodes.length === 0 ? (
            <p className="text-gray-500 italic">No nodes found. Add some mock nodes to get started!</p>
          ) : (
            <div className="space-y-2">
              {filteredNodes.map((node) => (
                <div
                  key={node._id.toString()}
                  className={`border rounded-lg p-4 ${
                    selectedNodes.includes(node._id.toString()) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedNodes.includes(node._id.toString())}
                          onChange={() => handleSelectNode(node._id.toString())}
                          className="rounded"
                        />
                        <h4 className="font-medium">{(node as any).name}</h4>
                        <span className="text-sm text-gray-500">({node.kind})</span>
                      </div>
                      {'email' in node && (
                        <p className="text-sm text-gray-600 mt-1">{node.email}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {node.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateNode(node._id.toString())}
                        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleRemoveNode(node._id.toString())}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Redux DevTools Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Redux DevTools</h4>
          <p className="text-sm text-blue-800">
            Open your browser&apos;s Redux DevTools extension to see all actions, state changes, and time-travel debugging in real-time!
          </p>
        </div>
      </div>
    </div>
  );
}
