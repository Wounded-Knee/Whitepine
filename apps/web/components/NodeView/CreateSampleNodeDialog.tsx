'use client';

import React, { useState, useEffect } from 'react';
import ModalDialog from '@web/components/ui/modal-dialog';
import UserNodeView from './UserNodeView';
import PostNodeView from './PostNodeView';
import BaseNodeView from './BaseNode';

export type NodeType = 'BaseNode' | 'UserNode' | 'PostNode';

export interface CreateSampleNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodeType: NodeType;
  onSuccess?: (nodeId: string) => void;
  onError?: (error: string) => void;
}

const CreateSampleNodeDialog: React.FC<CreateSampleNodeDialogProps> = ({
  isOpen,
  onClose,
  nodeType,
  onSuccess,
  onError,
}) => {
  const [createdNodeId, setCreatedNodeId] = useState<string | null>(null);

  // Reset state when dialog opens/closes or node type changes
  useEffect(() => {
    if (isOpen) {
      setCreatedNodeId(null);
    }
  }, [isOpen, nodeType]);

  // We'll need to listen for successful creation in the NodeView components
  // For now, let's use a simpler approach with the existing success callback
  const handleNodeCreated = (nodeId: string) => {
    setCreatedNodeId(nodeId);
    onSuccess?.(nodeId);
    // Close the dialog after a brief delay to show success
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const getNodeTypeDisplayName = (type: NodeType): string => {
    switch (type) {
      case 'UserNode': return 'User';
      case 'PostNode': return 'Post';
      case 'BaseNode': return 'Base';
      default: return 'Node';
    }
  };

  const renderNodeView = () => {
    switch (nodeType) {
      case 'UserNode':
        return (
          <div className="space-y-4">
            {/* Success message */}
            {createdNodeId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-medium">✅ Node Created Successfully!</h3>
                <p className="text-green-700 text-sm mt-1">
                  New node ID: <code className="bg-green-100 px-2 py-1 rounded text-xs">{createdNodeId}</code>
                </p>
              </div>
            )}
            
            {/* Use the UserNodeView in create mode */}
            <UserNodeView mode="create" onSuccess={handleNodeCreated} />
          </div>
        );

      case 'PostNode':
        return (
          <div className="space-y-4">
            {/* Success message */}
            {createdNodeId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-medium">✅ Node Created Successfully!</h3>
                <p className="text-green-700 text-sm mt-1">
                  New node ID: <code className="bg-green-100 px-2 py-1 rounded text-xs">{createdNodeId}</code>
                </p>
              </div>
            )}
            
            {/* Use the PostNodeView in create mode */}
            <PostNodeView mode="create" onSuccess={handleNodeCreated} />
          </div>
        );

      case 'BaseNode':
      default:
        return (
          <div className="space-y-4">
            {/* Success message */}
            {createdNodeId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-medium">✅ Node Created Successfully!</h3>
                <p className="text-green-700 text-sm mt-1">
                  New node ID: <code className="bg-green-100 px-2 py-1 rounded text-xs">{createdNodeId}</code>
                </p>
              </div>
            )}
            
            {/* Use the BaseNodeView in create mode */}
            <BaseNodeView mode="create" onSuccess={handleNodeCreated} />
          </div>
        );
    }
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Create ${getNodeTypeDisplayName(nodeType)} Node`}
      description={`Fill in the details below to create a new ${getNodeTypeDisplayName(nodeType).toLowerCase()} node.`}
      size="lg"
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      {renderNodeView()}
    </ModalDialog>
  );
};

export default CreateSampleNodeDialog;
