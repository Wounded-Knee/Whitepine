'use client';

import React, { useEffect } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useNodeRequest } from '@web/hooks/useNodeRequest';
import { useAppSelector } from '@web/store/hooks';
import { Button } from '@web/components/ui/button';
import { Edit, Save, X, Trash2 } from 'lucide-react';
import { RelativeNodeView } from './RelativeNodeView';
import { GroupedRelativesView } from './GroupedRelativesView';
import type { BaseNode, RelationshipConfig } from '@whitepine/types';

// Import extracted components
import { generateNodeSchema } from './schema/generateNodeSchema';
import { 
  CollapsibleObjectFieldTemplate, 
  CustomFieldTemplate,
  CustomTextWidget,
  CustomTextareaWidget,
  CustomNumberWidget,
  CustomCheckboxWidget,
  CustomSelectWidget,
  CustomRadioWidget,
  CustomDateWidget,
  CustomDateTimeWidget,
  CustomEmailWidget,
  CustomURLWidget,
  CustomPasswordWidget
} from './schema/fieldTemplates';
import { renderNodeId } from './utils/renderNodeId';
import { useNodeEditing } from './hooks/useNodeEditing';
import { useNodeRelationships } from './hooks/useNodeRelationships';
import type { BaseNodeViewProps, EditProps } from './types/BaseNodeView.types';

const SimpleMessage = ({ title, message, theme = 'default' }: { title: string, message: string, theme?: 'default' | 'error' | 'warning' | 'success' }) => {
  const themeClass = {
    default: 'gray',
    error: 'red',
    warning: 'yellow',
    success: 'green',
  }[theme];

  return (
    <div className={`p-6`}>
      <div className={`bg-${themeClass}-50 border border-${themeClass}-200 rounded-lg p-4`}>
        <h3 className={`text-${themeClass}-800 font-medium`}>{ title }</h3>
        <p className={`text-${themeClass}-700 text-sm mt-1`}>{ message }</p>
      </div>
    </div>
  );
};

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

  // Generate dynamic schema and transform data
  const { schema: dynamicSchema, uiSchema: dynamicUiSchema } = generateNodeSchema(node, editProps.isEditing, mode);
  
  return (
    <div className={`space-y-6 ${className}`}>
      {(() => {
        if (children) {
          return (
            <div className={className}>
              {children(node, isLoading, error, editProps, relatives, getRelatives, relationshipConfigs)}
            </div>
          );
        } else if (isLoading) {
          return (
            <SimpleMessage title="Loading node" message="Please wait while the node is loading." theme="default" />
          );
        } else if (error) {
          return (
            <SimpleMessage title="Error loading node" message={error} theme="error" />
          );
        } else if (!node && mode !== 'create') {
          return (
            <SimpleMessage title="Node not found" message="The requested node could not be found." theme="error" />
          );
        } else {
          return (
            <>
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
                    mode === 'create' ? null : (
                      !(node as any)?.readOnly && mode !== 'create' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={editProps.handleEdit}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={editProps.handleDelete}
                            disabled={editProps.isDeleting}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className={`w-4 h-4 ${editProps.isDeleting ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
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
                <SimpleMessage title="Save Error" message={editProps.saveError} theme="error" />
              )}

              {/* Delete Error */}
              {editProps.deleteError && (
                <SimpleMessage title="Delete Error" message={editProps.deleteError} theme="error" />
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
                className={`rjsf-form space-y-4 ${!editProps.isEditing && mode !== 'create' ? 'read-only' : ''}`}
                templates={{
                  ObjectFieldTemplate: CollapsibleObjectFieldTemplate,
                  FieldTemplate: CustomFieldTemplate
                }}
                widgets={{
                  TextWidget: CustomTextWidget,
                  TextareaWidget: CustomTextareaWidget,
                  NumberWidget: CustomNumberWidget,
                  CheckboxWidget: CustomCheckboxWidget,
                  SelectWidget: CustomSelectWidget,
                  RadioWidget: CustomRadioWidget,
                  DateWidget: CustomDateWidget,
                  DateTimeWidget: CustomDateTimeWidget,
                  EmailWidget: CustomEmailWidget,
                  URLWidget: CustomURLWidget,
                  PasswordWidget: CustomPasswordWidget
                }}
                onChange={editProps.isEditing ? editProps.handleFormChange : undefined}
              >
                {/* Empty children since we're using readonly mode */}
              </Form>

              {/* Related Nodes Section - Only show in view/edit modes */}
              {mode !== 'create' && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Nodes</h2>
                  
                  <div className="mt-4">
                    <GroupedRelativesView 
                      relatives={relatives}
                      relativesByRole={relativesByRole || undefined}
                      renderNodeId={renderNodeId}
                    />
                  </div>
                </>
              )}
            </>
          );
        }
      })()}
    </div>
  );
};

export { BaseNodeView };
export default BaseNodeView;
