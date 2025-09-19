import { useState, useEffect } from 'react';
import { useAppDispatch } from '@web/store/hooks';
import { updateNode } from '@web/store/slices/nodesSlice';
import { apiClient } from '@web/lib/api-client';
import type { BaseNode } from '@whitepine/types';
import type { EditProps } from '../types/BaseNodeView.types';

export const useNodeEditing = (node: BaseNode | null, fetchNode: () => Promise<void>) => {
  const dispatch = useAppDispatch();
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reset edit state when node changes
  useEffect(() => {
    if (node) {
      setEditData(null);
      setIsEditing(false);
      setSaveError(null);
    }
  }, [node]);

  // Transform node data for RJSF form (only if node exists)
  const formData = node ? Object.fromEntries(
    Object.keys({ ...node }).map((key) => {
      // Skip internal MongoDB fields and any potential Next.js params-like properties
      if (key === '__v' || key === 'params' || key === 'searchParams') return [key, undefined];
      
      const value = node[key as keyof typeof node];
      
      // Handle different data types
      if (value instanceof Date) {
        return [key, value.toISOString()];
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Convert objects to JSON strings for form display
        return [key, JSON.stringify(value, null, 2)];
      } else if (Array.isArray(value)) {
        // Convert arrays to JSON strings for form display
        return [key, JSON.stringify(value, null, 2)];
      } else {
        return [key, value];
      }
    }).filter(([_, value]) => value !== undefined)
  ) : {};

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
      const { _id, kind, createdAt, updatedAt, deletedAt, readOnly, ...updateableData } = editData;
      
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
      dispatch(updateNode.fulfilled(updatedNode, '', { id: node._id.toString(), updates: parsedData }));
      
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

  return editProps;
};
