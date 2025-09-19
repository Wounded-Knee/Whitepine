import React from 'react';
import type { BaseNode } from '@whitepine/types';
import type { RelationshipConfig } from '@whitepine/types';

export interface BaseNodeViewProps {
  nodeId: string;
  className?: string;
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
}
