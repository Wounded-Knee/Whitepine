'use client';

import React, { useEffect } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useNodeRequest } from '@web/hooks/useNodeRequest';
import { useAppSelector } from '@web/store/hooks';
import { Button } from '@web/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import { RelativeNodeView } from './RelativeNodeView';
import { GroupedRelativesView } from './GroupedRelativesView';
import type { BaseNode } from '@whitepine/types/client';
import type { RelationshipConfig } from '@whitepine/types/client';

// Import extracted components
import { generateNodeSchema } from './schema/generateNodeSchema';
import { CollapsibleObjectFieldTemplate } from './schema/fieldTemplates';
import { renderNodeId } from './utils/renderNodeId';
import { useNodeEditing } from './hooks/useNodeEditing';
import { useNodeRelationships } from './hooks/useNodeRelationships';
import type { BaseNodeViewProps, EditProps } from './types/BaseNodeView.types';

/**
 * BaseNodeView component for displaying BaseNode instances.
 * 
 * This component handles fetching a node from Redux store, cache, or API.
 * It supports only the BaseNode schema and can be extended by other views
 * like UserNodeView to support polymorphic derivative node schemas.
 * 
 * @param nodeId - The ID of the node to fetch and display (optional for create mode)
 * @param mode - The mode of operation: 'view' (read-only), 'edit' (editing existing), 'create' (new node)
 * @param className - Optional CSS class name for styling
 * @param children - Render prop function that receives (node, isLoading, error)
 */
const BaseNodeView: React.FC<BaseNodeViewProps> = ({
  nodeId,
  mode = 'view',
  className,
  onSuccess,
  children
}) => {
  // Use the custom hook for request management with deduplication
  const { node, isLoading, error, fetchNode, relatives, relativesByRole, getRelatives } = useNodeRequest(nodeId, mode);
  
  // Get all nodes for debug information
  const allNodes = useAppSelector((state) => state.nodes.byId);

  // Use extracted hooks
  const editProps = useNodeEditing(node, fetchNode, mode, onSuccess);
  const { relationshipConfigs } = useNodeRelationships(node, relatives);

  useEffect(() => {
    const loadNodeData = async () => {
      // Only fetch node data if not in create mode and nodeId is provided
      if (mode !== 'create' && nodeId) {
        try {
          await fetchNode();
          // The fetchNode will now automatically populate the Redux store with
          // the main node, synapses, and connected nodes
        } catch (err) {
          console.error('Error fetching node:', err);
        }
      }
    };
    
    loadNodeData();
  }, [nodeId, fetchNode, mode]);

  // If children render prop is provided, use it
  if (children) {
    return (
      <div className={className}>
        {children(node, isLoading, error, editProps, relatives, getRelatives, relationshipConfigs)}
      </div>
    );
  }

  // Default rendering
  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading node</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!node && mode !== 'create') {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-800 font-medium">Node not found</h3>
          <p className="text-gray-700 text-sm mt-1">The requested node could not be found.</p>
        </div>
      </div>
    );
  }

  // Generate dynamic schema and transform data
  const { schema: dynamicSchema, uiSchema: dynamicUiSchema } = generateNodeSchema(node, editProps.isEditing, mode);
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Node Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Node' : 
             node?.kind ? `${node.kind.charAt(0).toUpperCase() + node.kind.slice(1)} Node` : 'Node'}
          </h1>
          {mode !== 'create' && node && (
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-500">ID:</span>
              {renderNodeId(node._id)}
            </div>
          )}
        </div>
        
        {/* Edit/Save/Cancel buttons */}
        <div className="flex items-center justify-end space-x-2">
          {!editProps.isEditing ? (
            mode === 'create' ? (
              <Button
                onClick={() => editProps.handleEdit()}
                size="sm"
                className="flex items-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Start Creating</span>
              </Button>
            ) : (
              !(node as any)?.readOnly && (
                <Button
                  onClick={editProps.handleEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
              )
            )
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                onClick={editProps.handleSave}
                disabled={editProps.isSaving}
                size="sm"
                className="flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span>{editProps.isSaving ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create' : 'Save')}</span>
              </Button>
              <Button
                onClick={editProps.handleCancel}
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
      </div>

      {/* Save Error */}
      {editProps.saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Save Error</h3>
          <p className="text-red-700 text-sm mt-1">{editProps.saveError}</p>
        </div>
      )}

      {/* Node Form */}
      <Form
        schema={dynamicSchema}
        uiSchema={dynamicUiSchema}
        formData={editProps.isEditing ? (editProps.editData || editProps.formData) : editProps.formData}
        validator={validator}
        readonly={!editProps.isEditing}
        showErrorList={false}
        liveValidate={false}
        noHtml5Validate={true}
        className={`rjsf-form space-y-4 ${!editProps.isEditing ? 'read-only' : ''}`}
        templates={{
          ObjectFieldTemplate: CollapsibleObjectFieldTemplate
        }}
        onChange={editProps.isEditing ? editProps.handleFormChange : undefined}
      >
        {/* Empty children since we're using readonly mode */}
      </Form>

      {/* Related Nodes Section - Only show in view/edit modes */}
      {mode !== 'create' && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Nodes</h2>
          
          <div className="text-sm text-gray-600">
            <p>
              This node has {relatives.length} related elements (synapses and attribute-referenced nodes). 
              Use the getRelatives() function to filter by relationship type.
            </p>
            
            <div className="mt-4">
              <GroupedRelativesView 
                relatives={relatives}
                relativesByRole={relativesByRole || undefined}
                renderNodeId={renderNodeId}
              />
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export { BaseNodeView };
export default BaseNodeView;
