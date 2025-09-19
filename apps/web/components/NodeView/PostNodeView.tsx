'use client';

import React, { useEffect, useState } from 'react';
import { BaseNodeView } from './BaseNode';
import type { BaseNodeViewProps, EditProps } from './types/BaseNodeView.types';
import { Button } from '@web/components/ui/button';
import { Edit, Save, X, Calendar, User } from 'lucide-react';
import { Avatar } from '../avatar';
import type { PostNode, UserNode, BaseNode } from '@whitepine/types';
import { NODE_TYPES } from '@shared/nodeTypes';
import { useNodeById, useAppDispatch } from '@web/store/hooks';
import { useNodeRequest } from '@web/hooks/useNodeRequest';
import { fetchNodeById } from '@web/store/slices/nodesSlice';
import { RelationshipSuggestions, type RelationshipSuggestion } from './RelationshipSuggestions';
import CreateRelatedNode from './CreateRelatedNode';

export interface PostNodeViewProps extends Omit<BaseNodeViewProps, 'children'> {
  children?: (node: PostNode | null, isLoading: boolean, error: string | null, editProps: EditProps, relatives: any[], getRelatives: (selector: any) => any[], relationshipConfigs: any[]) => React.ReactNode;
  showAuthor?: boolean; // Whether to show author info (default: true)
  compact?: boolean; // Whether to use compact layout (default: false)
}

/**
 * Component to fetch and display author information using synaptic relationships
 * Looks for author nodes connected via 'authored' synapses
 */
const AuthorInfo: React.FC<{
  getRelatives: (selector: any) => any[];
  postNode: PostNode;
  compact?: boolean;
}> = ({ getRelatives, postNode, compact = false }) => {
  // Look for author nodes connected via authored synapses
  const authorNode = getRelatives({ 
    kind: NODE_TYPES.USER,
    synaptic: { role: 'authored', direction: 'out' }
  })[0];

  // If found, use it
  if (authorNode) {
    return (
      <div className="flex-shrink-0">
        <Avatar
          avatarUrl={authorNode.avatar}
          name={authorNode.name}
          size={compact ? 'sm' : 'md'}
        />
      </div>
    );
  }

  // If no author found, show unknown
  return (
    <div className="flex-shrink-0">
      <Avatar
        avatarUrl={null}
        name="Unknown"
        size={compact ? 'sm' : 'md'}
      />
    </div>
  );
};

/**
 * Component to display author name using synaptic relationships
 * Looks for author nodes connected via 'authored' synapses
 */
const AuthorName: React.FC<{
  getRelatives: (selector: any) => any[];
  postNode: PostNode;
  compact?: boolean;
}> = ({ getRelatives, postNode, compact = false }) => {
  // Look for author nodes connected via authored synapses
  const authorNode = getRelatives({ 
    kind: NODE_TYPES.USER,
    synaptic: { role: 'authored', direction: 'out' }
  })[0];

  // If found, use it
  if (authorNode) {
    return (
      <span className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'} flex-shrink-0`}>
        {authorNode.name || 'Anonymous'}
      </span>
    );
  }

  // If no author found, show unknown
  return (
    <span className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'} flex-shrink-0`}>
      Unknown Author
    </span>
  );
};

/**
 * PostNodeView component for displaying PostNode instances in IRC-style chat layout.
 * 
 * This component extends BaseNodeView to specifically handle PostNode schemas.
 * It displays posts in a thin horizontal band format ideal for chat conversations.
 * 
 * @param nodeId - The ID of the post node to fetch and display
 * @param className - Optional CSS class name for styling
 * @param showAuthor - Whether to display author information (default: true)
 * @param compact - Whether to use compact layout (default: false)
 * @param children - Render prop function that receives (node, isLoading, error)
 */
export const PostNodeView: React.FC<PostNodeViewProps> = ({
  nodeId,
  className,
  showAuthor = true,
  compact = false,
  children
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<RelationshipSuggestion | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<BaseNode | null>(null);
  
  // Get the current node from BaseNodeView to use in dialogs
  const { node: baseNode } = useNodeRequest(nodeId);
  
  // Update currentNode when baseNode changes
  useEffect(() => {
    if (baseNode && baseNode !== currentNode) {
      setCurrentNode(baseNode);
    }
  }, [baseNode, currentNode]);

  const handleCreateRelationship = (suggestion: RelationshipSuggestion) => {
    setSelectedSuggestion(suggestion);
    setShowCreateDialog(true);
    setCreateError(null);
  };

  const handleCreateSuccess = (newNode: any) => {
    setShowCreateDialog(false);
    setSelectedSuggestion(null);
    setCreateError(null);
    // Optionally refresh the node data or show success message
    console.log('Created new node:', newNode);
  };

  const handleCreateError = (error: string) => {
    setCreateError(error);
  };

  const handleCancelCreate = () => {
    setShowCreateDialog(false);
    setSelectedSuggestion(null);
    setCreateError(null);
  };

  return (
    <>
      <BaseNodeView nodeId={nodeId} className={className}>
        {(node, isLoading, error, editProps, relatives, getRelatives, relationshipConfigs) => {

        // If children is provided as a render prop, use it with typed PostNode
        if (children) {
          const postNode = node?.kind === NODE_TYPES.POST ? (node as PostNode) : null;
          return children(postNode, isLoading, error, editProps, relatives, getRelatives, relationshipConfigs);
        }

        // Default rendering for PostNode
        if (isLoading) {
          return (
            <div className="animate-pulse bg-gray-100 rounded h-8 w-full flex items-center space-x-3 px-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <div className="flex-1 h-4 bg-gray-300 rounded"></div>
            </div>
          );
        }

        if (error) {
          return (
            <div className="bg-red-50 border-l-4 border-red-400 p-2 text-red-700 text-sm">
              Error loading post: {error}
            </div>
          );
        }

        if (!node) {
          return (
            <div className="bg-gray-50 border-l-4 border-gray-300 p-2 text-gray-600 text-sm">
              Post not found
            </div>
          );
        }

        // Type guard to ensure we have a PostNode
        if (node.kind !== NODE_TYPES.POST) {
          return (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 text-yellow-700 text-sm">
              Expected Post node, but got: {node.kind || 'unknown'}
            </div>
          );
        }

        const postNode = node as PostNode;

        const timestamp = new Date(postNode.createdAt);
        const isPublished = postNode.publishedAt !== null && postNode.publishedAt !== undefined;

        return (
          <div className={`bg-white border-l-4 ${isPublished ? 'border-green-400' : 'border-gray-300'} hover:bg-gray-50 transition-colors ${compact ? 'py-1' : 'py-2'}`}>
            {/* Edit/Save/Cancel buttons - only show when editing */}
            {editProps.isEditing && (
              <div className="flex items-center justify-end space-x-2 mb-2 px-3">
                <Button
                  onClick={editProps.handleSave}
                  disabled={editProps.isSaving}
                  size="sm"
                  className="flex items-center space-x-1 h-6 text-xs"
                >
                  <Save className="w-3 h-3" />
                  <span>{editProps.isSaving ? 'Saving...' : 'Save'}</span>
                </Button>
                <Button
                  onClick={editProps.handleCancel}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 h-6 text-xs"
                >
                  <X className="w-3 h-3" />
                  <span>Cancel</span>
                </Button>
              </div>
            )}
            
            {/* Save error display */}
            {editProps.saveError && (
              <div className="bg-red-50 border border-red-200 rounded p-2 mb-2 mx-3 text-red-600 text-xs">
                {editProps.saveError}
              </div>
            )}
            
            <div className={`flex items-start space-x-3 px-3 ${compact ? 'min-h-[2rem]' : 'min-h-[2.5rem]'}`}>
              {/* Author Avatar */}
              {showAuthor && (
                <AuthorInfo 
                  getRelatives={getRelatives}
                  postNode={postNode}
                  compact={compact} 
                />
              )}

              {/* Content Area */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-2">
                  {/* Author Name */}
                  {showAuthor && (
                    <AuthorName 
                      getRelatives={getRelatives}
                      postNode={postNode}
                      compact={compact} 
                    />
                  )}
                  
                  {/* Timestamp */}
                  <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'} flex-shrink-0`}>
                    {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {/* Published Status */}
                  {isPublished && (
                    <span className="text-green-600 text-xs flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Published</span>
                    </span>
                  )}
                </div>
                
                {/* Post Content */}
                <div className={`mt-1 ${compact ? 'text-sm' : 'text-base'} text-gray-800 leading-relaxed`}>
                  {editProps.isEditing ? (
                    <textarea
                      value={editProps.editData?.content || postNode.content || ''}
                      onChange={(e) => editProps.handleFormChange({ formData: { ...editProps.editData, content: e.target.value } })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-none"
                      rows={Math.max(1, Math.ceil((editProps.editData?.content || postNode.content || '').length / 50))}
                      placeholder="Enter post content..."
                    />
                  ) : (
                    <div className="whitespace-pre-wrap break-words">
                      {postNode.content}
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button - only show when not editing */}
              {!editProps.isEditing && (
                <div className="flex-shrink-0">
                  <Button
                    onClick={editProps.handleEdit}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Relationship Suggestions */}
            {!compact && (
              <RelationshipSuggestions
                node={postNode}
                relationshipConfigs={relationshipConfigs}
                onCreateRelationship={handleCreateRelationship}
                className="mt-2"
              />
            )}
          </div>
        );
        }}
      </BaseNodeView>

    {/* Create Related Node Dialog */}
    {showCreateDialog && selectedSuggestion && currentNode && (
      <CreateRelatedNode
        parentNode={currentNode}
        suggestion={selectedSuggestion}
        onCancel={handleCancelCreate}
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
      />
    )}

    {/* Error Display */}
    {createError && (
      <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div className="text-red-800 text-sm">
            {createError}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCreateError(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )}
  </>
  );
};

export default PostNodeView;
