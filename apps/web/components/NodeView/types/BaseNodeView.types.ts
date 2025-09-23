import React from 'react';
import type { BaseNode, RelationshipConfig } from '@whitepine/types';

export type NodeViewMode = 'view' | 'edit' | 'create';

export interface BaseNodeViewProps {
  nodeId?: string; // Optional for create mode
  mode?: NodeViewMode; // Default to 'view' if not specified
  className?: string;
  onSuccess?: (nodeId: string) => void; // Callback for successful creation/update
  children?: (node: BaseNode | null, isLoading: boolean, error: string | null, editProps: EditProps, relatives: any[], getRelatives: (selector: any) => any[], relationshipConfigs: RelationshipConfig[]) => React.ReactNode;
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
  // Delete functionality
  isDeleting: boolean;
  deleteError: string | null;
  handleDelete: () => Promise<void>;
}
