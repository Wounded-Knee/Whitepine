'use client';

import React, { useState } from 'react';
import { Button } from '@web/components/ui/button';
import { X, Save, Loader2 } from 'lucide-react';
import { NODE_TYPES } from '@shared/nodeTypes';
import type { BaseNode } from '@whitepine/types';
import type { RelationshipSuggestion } from './RelationshipSuggestions';
import type { RelationshipConfig, FormFieldConfig } from '@whitepine/types';
import { apiClient } from '@web/lib/api-client';

export interface CreateRelatedNodeProps {
  parentNode: BaseNode;
  suggestion: RelationshipSuggestion;
  onCancel: () => void;
  onSuccess: (newNode: BaseNode) => void;
  onError: (error: string) => void;
}

/**
 * Component for creating a new node with a relationship to an existing node
 */
export const CreateRelatedNode: React.FC<CreateRelatedNodeProps> = ({
  parentNode,
  suggestion,
  onCancel,
  onSuccess,
  onError
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Create the new node based on the suggestion
      const newNodeData = {
        kind: suggestion.targetNodeKind,
        ...getDefaultNodeData(suggestion.targetNodeKind),
        ...formData
      };

      // Create the synapse data
      // For 'out' direction: new node -> parent node (e.g., reply -> original post)
      // For 'in' direction: parent node -> new node (e.g., original post -> reply)
      const synapseData = {
        from: suggestion.synapseDirection === 'out' ? null : parentNode._id, // null means use new node ID
        to: suggestion.synapseDirection === 'out' ? parentNode._id : null,   // null means use new node ID
        role: suggestion.synapseRole,
        dir: suggestion.synapseDirection,
        props: suggestion.synapseProps || {}
      };

      // Create the node and synapse using the API client
      const result = await apiClient.createNodeWithRelationship(newNodeData, synapseData);
      onSuccess(result.node);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to create node');
    } finally {
      setIsCreating(false);
    }
  };

  const getDefaultNodeData = (nodeKind: string): Record<string, any> => {
    switch (nodeKind) {
      case NODE_TYPES.POST:
        return {
          content: '',
          publishedAt: null
        };
      case NODE_TYPES.USER:
        return {
          email: '',
          name: '',
          isActive: true
        };
      default:
        return {};
    }
  };

  const getFormFields = (suggestion: RelationshipSuggestion) => {
    if (!suggestion.formFields || suggestion.formFields.length === 0) {
      return (
        <div className="text-sm text-gray-600">
          No specific fields required for this relationship type.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {suggestion.formFields.map((field: FormFieldConfig) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                value={formData[field.name] || field.defaultValue || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder={field.placeholder}
                required={field.required}
              />
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={field.name}
                  checked={formData[field.name] || field.defaultValue || false}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor={field.name} className="text-sm text-gray-700">
                  {field.label}
                </label>
              </div>
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                value={formData[field.name] || field.defaultValue || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={field.required}
              >
                <option value="">Select an option</option>
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.name}
                value={formData[field.name] || field.defaultValue || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Create {suggestion.label}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isCreating}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-3">
              {suggestion.description}
            </div>
            {getFormFields(suggestion)}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="flex items-center space-x-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRelatedNode;
