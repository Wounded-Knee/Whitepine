'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useNodeRequest } from '@web/hooks/useNodeRequest';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';
import { updateNode } from '@web/store/slices/nodesSlice';
import { apiClient } from '@web/lib/api-client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@web/components/ui/collapsible';
import { Button } from '@web/components/ui/button';
import { ChevronsUpDown, Edit, Save, X, ExternalLink } from 'lucide-react';
import type { BaseNode } from '@whitepine/types';

// Helper function to render node IDs as clickable links
const renderNodeId = (nodeId: string | any, className: string = '') => {
  if (!nodeId) return null;
  
  const idString = nodeId.toString();
  const shortId = idString.substring(0, 8) + '...';
  
  return (
    <Link 
      href={`/demo-nodes/${idString}`}
      className={`inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
    >
      <code className="bg-blue-50 px-2 py-1 rounded text-xs font-mono">
        {shortId}
      </code>
      <ExternalLink className="w-3 h-3 ml-1" />
    </Link>
  );
};

// Error Boundary Component
class NodeErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NodeErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="text-red-800 font-medium">Error loading node</h3>
          <p className="text-red-600 mt-1">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Dynamic schema generator for any node type
const generateNodeSchema = (node: any, isEditing: boolean = false) => {
  if (!node) return { type: 'object', properties: {} };

  const properties: Record<string, any> = {};
  const uiSchema: Record<string, any> = {};

  // Helper function to format field names
  const formatFieldName = (key: string): string => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  // Helper function to generate description
  const generateDescription = (key: string, value: any): string => {
    const commonDescriptions: Record<string, string> = {
      _id: 'Unique identifier for this node',
      kind: 'The type of node',
      createdAt: 'When this node was first created',
      updatedAt: 'When this node was last modified',
      deletedAt: 'When this node was deleted (if applicable)',
      createdBy: 'User ID of who created this node',
      updatedBy: 'User ID of who last updated this node',
      ownerId: 'User ID of the owner of this node',
      email: 'Email address',
      name: 'Display name',
      avatar: 'Profile picture URL',
      bio: 'Biography or description',
      isActive: 'Whether this node is active',
      lastLoginAt: 'When the user last logged in',
      preferences: 'User preferences and settings'
    };

    return commonDescriptions[key] || `Value for ${formatFieldName(key)}`;
  };

  // Helper function to detect data type
  const detectType = (value: any): { type: string; format?: string; items?: any; properties?: any } => {
    if (value === null || value === undefined) {
      return { type: 'string' };
    }

    if (typeof value === 'boolean') {
      return { type: 'boolean' };
    }

    if (typeof value === 'number') {
      return { type: 'number' };
    }

    if (typeof value === 'string') {
      // Check if it's a date string
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (dateRegex.test(value)) {
        return { type: 'string', format: 'date-time' };
      }
      
      // Check if it's an email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        return { type: 'string', format: 'email' };
      }
      
      // Check if it's a URL
      try {
        new URL(value);
        return { type: 'string', format: 'uri' };
      } catch {
        // Not a URL
      }
      
      return { type: 'string' };
    }

    if (Array.isArray(value)) {
      // Check if it's an array of objects
      if (value.length > 0 && typeof value[0] === 'object') {
        return { type: 'array', items: { type: 'object' } };
      }
      return { type: 'array' };
    }

    if (typeof value === 'object') {
      // Check if it's a simple object with properties
      const keys = Object.keys(value);
      if (keys.length > 0) {
        return { type: 'object', properties: keys.reduce((acc, key) => {
          acc[key] = { type: 'string' }; // Default to string for nested properties
          return acc;
        }, {} as Record<string, any>) };
      }
      return { type: 'object' };
    }

    return { type: 'string' };
  };

  // Process each property in the node
  // Create a safe copy of the node object to avoid enumeration issues
  const safeNode = { ...node };
  
  // Use Object.keys to avoid potential enumeration issues with Object.entries
  Object.keys(safeNode).forEach((key) => {
    // Skip internal MongoDB fields and any potential Next.js params-like properties
    if (key === '__v' || key === 'params' || key === 'searchParams') return;
    
    const value = safeNode[key];

    const fieldName = formatFieldName(key);
    const typeInfo = detectType(value);
    const description = generateDescription(key, value);

    // Determine if this field should be read-only
    const isFieldReadOnly = !isEditing || key === '_id' || key === 'kind' || key === 'createdAt' || key === 'updatedAt' || key === 'deletedAt' || key === 'createdBy' || key === 'updatedBy' || key === 'ownerId' || key === 'readOnly';

    // Generate schema property
    properties[key] = {
      type: typeInfo.type,
      title: fieldName,
      description: description,
      readOnly: isFieldReadOnly,
      ...(typeInfo.format && { format: typeInfo.format }),
      ...(typeInfo.items && { items: typeInfo.items }),
      ...(typeInfo.properties && { properties: typeInfo.properties })
    };

    // Generate UI schema
    uiSchema[key] = {
      'ui:options': {
        'ui:readonly': isFieldReadOnly
      }
    };

    // Special handling for specific field types
    if (key === '_id' || key === 'kind') {
      uiSchema[key]['ui:widget'] = 'hidden';
    } else if (typeInfo.format === 'date-time') {
      uiSchema[key]['ui:widget'] = 'datetime';
    } else if (typeInfo.type === 'boolean') {
      uiSchema[key]['ui:widget'] = 'checkbox';
    } else if (typeInfo.type === 'array') {
      uiSchema[key]['ui:widget'] = 'select';
    } else if (typeInfo.type === 'object') {
      uiSchema[key]['ui:widget'] = 'textarea';
    }
  });

  return {
    schema: {
      type: 'object',
      title: `${node.kind || 'Node'} Information`,
      description: `Complete information about this ${node.kind || 'node'}`,
      properties
    },
    uiSchema
  };
};

// Custom ObjectFieldTemplate for collapsible nested objects
const CollapsibleObjectFieldTemplate = (props: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Don't make the root object collapsible, only nested objects
  if (!props.idSchema || props.idSchema.$id === 'root') {
    return (
      <div className="space-y-4">
        {props.properties.map((element: any) => element.content)}
      </div>
    );
  }

  const hasNestedContent = props.properties && props.properties.length > 0;
  const title = props.title || 'Object';
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
        <CollapsibleTrigger asChild className="px-0">
          <Button 
            variant="ghost" 
            className="w-full justify-between h-auto border-none hover:bg-gray-50"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium text-gray-900">{title}</span>
              {hasNestedContent && (
                <span className="text-xs text-gray-500 mt-1">
                  {props.properties.length} {props.properties.length === 1 ? 'property' : 'properties'}
                </span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
          </Button>
        </CollapsibleTrigger>
        {hasNestedContent && (
          <CollapsibleContent className="px-0 pb-3">
            <div className="space-y-3 pt-2 border-t border-gray-100">
              {props.properties.map((element: any) => element.content)}
            </div>
          </CollapsibleContent>
        )}
    </Collapsible>
  );
};

export interface BaseNodeViewProps {
  nodeId: string;
  className?: string;
  children?: (node: BaseNode | null, isLoading: boolean, error: string | null, editProps: EditProps, relatives: any[], getRelatives: (selector: any) => any[]) => React.ReactNode;
}

export interface EditProps {
  isEditing: boolean;
  isSaving: boolean;
  saveError: string | null;
  handleEdit: () => void;
  handleCancel: () => void;
  handleSave: () => Promise<void>;
  handleFormChange: (data: any) => void;
  editData: any;
  formData: any;
}

/**
 * BaseNodeView component for displaying BaseNode instances.
 * 
 * This component handles fetching a node from Redux store, cache, or API.
 * It supports only the BaseNode schema and can be extended by other views
 * like UserNodeView to support polymorphic derivative node schemas.
 * 
 * @param nodeId - The ID of the node to fetch and display
 * @param className - Optional CSS class name for styling
 * @param children - Render prop function that receives (node, isLoading, error)
 */
const BaseNodeViewInner: React.FC<BaseNodeViewProps> = ({
  nodeId,
  className,
  children
}) => {
  // Use the custom hook for request management with deduplication
  const { node, isLoading, error, fetchNode, relatives, getRelatives } = useNodeRequest(nodeId);
  const dispatch = useAppDispatch();
  
  // Get all nodes for debug information
  const allNodes = useAppSelector((state) => state.nodes.byId);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [synapses, setSynapses] = useState<any[]>([]); // This is an array of synapse nodeIDs which are connected directly to this node.
  const [connectedNodes, setConnectedNodes] = useState<any[]>([]); // Connected nodes from the API response
  
  useEffect(() => {
    const loadNodeData = async () => {
      try {
        await fetchNode();
        // The fetchNode will now automatically populate the Redux store with
        // the main node, synapses, and connected nodes
      } catch (err) {
        console.error('Error fetching node:', err);
      }
    };
    
    loadNodeData();
  }, [nodeId, fetchNode]);
  
  // Reset edit state when node changes
  useEffect(() => {
    if (node) {
      setEditData(null);
      setIsEditing(false);
      setSaveError(null);
    }
  }, [node]);
  
  // Edit functions
  const handleEdit = () => {
    if (node) {
      setEditData(formData);
      setIsEditing(true);
      setSaveError(null);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
    setSaveError(null);
  };
  
  const handleSave = async () => {
    if (!node || !editData) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Filter out fields that shouldn't be updated
      const { _id, kind, createdAt, updatedAt, deletedAt, createdBy, updatedBy, ownerId, readOnly, ...updateableData } = editData;
      
      // Parse stringified objects back to objects
      const parsedData = Object.fromEntries(
        Object.entries(updateableData).map(([key, value]) => {
          // If the value is a string that looks like JSON, try to parse it
          if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            try {
              return [key, JSON.parse(value)];
            } catch {
              // If parsing fails, return the original value
              return [key, value];
            }
          }
          return [key, value];
        })
      );
      
      // Debug: Log the data being sent
      console.log('Sending update data:', parsedData);
      
      // Update the node via API
      const updatedNode = await apiClient.updateNode(node._id.toString(), parsedData);
      
      // Update Redux store with fresh data
      dispatch(updateNode.fulfilled(updatedNode, '', node._id.toString()));
      
      // Refresh the node data
      await fetchNode();
      
      setIsEditing(false);
      setEditData(null);
    } catch (error) {
      console.error('Error saving node:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save node');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleFormChange = (data: any) => {
    setEditData(data.formData);
  };
  
  // Transform node data for RJSF form (only if node exists)
  const formData = node ? Object.fromEntries(
    Object.keys({ ...node }).map((key) => {
      // Skip internal MongoDB fields and any potential Next.js params-like properties
      if (key === '__v' || key === 'params' || key === 'searchParams') return [key, undefined];
      
      const value = node[key as keyof typeof node];
      
      // Handle different data types
      if (value instanceof Date) {
        return [key, value.toISOString()];
      }
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle ObjectId or other objects
        if (value.toString && typeof value.toString === 'function') {
          const str = value.toString();
          // Check if it's likely an ObjectId (24-character hex string)
          if (str.length === 24 && /^[0-9a-fA-F]+$/.test(str)) {
            return [key, str];
          }
        }
        // For complex objects, stringify them
        return [key, JSON.stringify(value, null, 2)];
      }
      
      if (Array.isArray(value)) {
        return [key, value];
      }
      
      return [key, value];
    }).filter(([_, value]) => value !== undefined)
  ) : {};
  
  // If children is provided as a render prop, use it
  if (children) {
    const editProps: EditProps = {
      isEditing,
      isSaving,
      saveError,
      handleEdit,
      handleCancel,
      handleSave,
      handleFormChange,
      editData,
      formData
    };
    
    return (
      <div className={className}>
        {children(node, isLoading, error, editProps, relatives, getRelatives)}
      </div>
    );
  }
  
  // Default rendering for BaseNode
  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse bg-gray-200 rounded h-20 w-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={className}>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">Error loading node: {error}</p>
        </div>
      </div>
    );
  }
  
  if (!node) {
    return (
      <div className={className}>
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <p className="text-gray-600">Node not found</p>
        </div>
      </div>
    );
  }
  
  // Ensure we're dealing with a BaseNode (not a derived type)
  if (node.kind !== 'BaseNode' && !node.kind) {
    return (
      <div className={className}>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-yellow-600">
            This component only supports BaseNode instances. 
            Node type: {node.kind || 'unknown'}
          </p>
        </div>
      </div>
    );
  }
  
  // Generate dynamic schema and transform data
  const { schema: dynamicSchema, uiSchema: dynamicUiSchema } = node ? generateNodeSchema(node, isEditing) : { schema: {}, uiSchema: {} };
  
  return (
    <div className={className}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-900">
              {node?.kind || 'Base Node'}
          </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">ID</span>
            <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {node?._id?.toString() || 'Unknown'}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mb-6"></div>
        
        {node ? (
          <div className="space-y-4">
            {/* Edit/Save/Cancel buttons */}
            <div className="flex items-center justify-end space-x-2">
              {!isEditing ? (
                !(node as any).readOnly && (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                )
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                </div>
              )}
            </div>
            
            {/* Save error display */}
            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-600 text-sm">{saveError}</p>
              </div>
            )}
            
            <Form
              schema={dynamicSchema}
              uiSchema={dynamicUiSchema}
              formData={isEditing ? (editData || formData) : formData}
              validator={validator}
              readonly={!isEditing}
              showErrorList={false}
              liveValidate={false}
              noHtml5Validate={true}
              className={`rjsf-form space-y-4 ${!isEditing ? 'read-only' : ''}`}
              templates={{
                ObjectFieldTemplate: CollapsibleObjectFieldTemplate
              }}
              onChange={isEditing ? handleFormChange : undefined}
            >
              {/* Empty children since we're using readonly mode */}
              <div></div>
            </Form>
            
            {/* Connected Relatives Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Related Elements</h4>
              <div className="text-sm text-gray-600">
                <p>
                  This node has {relatives.length} related elements (synapses and attribute-referenced nodes). 
                  Use the getRelatives() function to filter by relationship type.
                </p>
                
                {relatives.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="font-medium text-gray-800">Available Relatives:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {relatives.map((relative, index) => (
                        <div key={relative._id || index} className="p-2 bg-gray-50 border rounded text-xs">
                          <div className="font-medium">{relative.kind || 'Unknown'}</div>
                          <div className="text-gray-600">
                            {relative._relationshipType === 'attribute' && `Referenced by: ${relative._attribute}`}
                            {relative._relationshipType === 'synaptic' && `Synaptic connection`}
                            {relative.role && ` | Role: ${relative.role}`}
                            {relative.dir && ` | Dir: ${relative.dir}`}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {renderNodeId(relative._id)}
                          </div>
                          {relative.name && (
                            <div className="text-gray-700 text-xs mt-1">
                              {relative.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">Enhanced API with getRelatives()</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Use getRelatives() to filter by synaptic properties, attributes, or custom criteria.
                    Example: getRelatives({`{synaptic: {role: 'author'}}`})
                  </p>
                </div>
                
                {/* Debug information */}
                <details className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Debug Information
                  </summary>
                  <div className="mt-2 text-xs text-gray-600 space-y-2">
                    <div>
                      <strong>Node ID:</strong> {renderNodeId(node?._id, 'ml-2')}
                    </div>
                    <div>
                      <strong>Node CreatedBy:</strong> {renderNodeId(node?.createdBy, 'ml-2')}
                    </div>
                    <div>
                      <strong>Relatives Count:</strong> {relatives.length}
                    </div>
                    <div>
                      <strong>All Nodes Count:</strong> {Object.keys(allNodes).length}
                    </div>
                    {relatives.length > 0 && (
                      <div>
                        <strong>Relatives Details:</strong>
                        <div className="mt-1 p-2 bg-white border rounded text-xs overflow-auto space-y-1">
                          {relatives.map((r, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{r.kind}</span>
                                {r.name && <span className="ml-2 text-gray-600">({r.name})</span>}
                                <span className="ml-2 text-gray-500">- {r._relationshipType}</span>
                                {r._attribute && <span className="ml-2 text-blue-600">via {r._attribute}</span>}
                              </div>
                              {renderNodeId(r._id)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No node data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component with error boundary
const BaseNodeView: React.FC<BaseNodeViewProps> = (props) => {
  return (
    <NodeErrorBoundary>
      <BaseNodeViewInner {...props} />
    </NodeErrorBoundary>
  );
};

export { BaseNodeView };

export default BaseNodeView;
