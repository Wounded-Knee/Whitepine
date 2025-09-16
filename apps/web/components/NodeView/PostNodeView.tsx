'use client';

import React from 'react';
import { BaseNodeView } from './BaseNode';
import type { BaseNodeViewProps, EditProps } from './BaseNode';
import { Button } from '@web/components/ui/button';
import { Edit, Save, X, Calendar, User } from 'lucide-react';
import type { PostNode, UserNode } from '@whitepine/types';
import { NODE_TYPES } from '@shared/nodeTypes';

export interface PostNodeViewProps extends Omit<BaseNodeViewProps, 'children'> {
  children?: (node: PostNode | null, isLoading: boolean, error: string | null, editProps: EditProps) => React.ReactNode;
  showAuthor?: boolean; // Whether to show author info (default: true)
  compact?: boolean; // Whether to use compact layout (default: false)
}

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
  return (
    <BaseNodeView nodeId={nodeId} className={className}>
      {(node, isLoading, error, editProps) => {
        // If children is provided as a render prop, use it with typed PostNode
        if (children) {
          const postNode = node?.kind === NODE_TYPES.POST ? (node as PostNode) : null;
          return children(postNode, isLoading, error, editProps);
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

        // Get author information if available
        const author = postNode.createdBy ? {
          name: 'Unknown User', // This would typically come from a populated field
          avatar: null,
          id: postNode.createdBy
        } : null;

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
                <div className="flex-shrink-0">
                  {author?.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full object-cover`}
                    />
                  ) : (
                    <div className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-gray-300 flex items-center justify-center`}>
                      <User className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600`} />
                    </div>
                  )}
                </div>
              )}

              {/* Content Area */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-2">
                  {/* Author Name */}
                  {showAuthor && (
                    <span className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'} flex-shrink-0`}>
                      {author?.name || 'Anonymous'}
                    </span>
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

              {/* Edit Button - only show when not editing and not read-only */}
              {!editProps.isEditing && !postNode.readOnly && (
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
          </div>
        );
      }}
    </BaseNodeView>
  );
};

export default PostNodeView;
