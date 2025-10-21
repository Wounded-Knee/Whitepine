'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BaseNodeView, UserNodeView, PostNodeView } from '@web/components/NodeView';
import { apiClient } from '@web/lib/api-client';
import { ArrowLeft } from 'lucide-react';
import CreateSampleNodeDialog, { type NodeType } from '@web/components/NodeView/CreateSampleNodeDialog';

export default function NodeViewDemo() {
  const params = useParams();
  const router = useRouter();
  
  const nodeId = params.nodeId as string;
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType>('BaseNode');
  const [selectedMode, setSelectedMode] = useState<'view' | 'create'>('view');
  const [createdNodeId, setCreatedNodeId] = useState<string | null>(null);
  const [isLoadingNode, setIsLoadingNode] = useState(true);
  const [nodeError, setNodeError] = useState<string | null>(null);
  
  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // State for isolated PostNodes
  const [isolatedPostNodes, setIsolatedPostNodes] = useState<any[]>([]);
  const [isLoadingIsolatedPosts, setIsLoadingIsolatedPosts] = useState(false);
  const [isolatedPostsError, setIsolatedPostsError] = useState<string | null>(null);
  
  // State for creating new PostNodes
  const [newPostContent, setNewPostContent] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createPostError, setCreatePostError] = useState<string | null>(null);

  // Function to fetch isolated PostNodes
  const fetchIsolatedPostNodes = async () => {
    try {
      setIsLoadingIsolatedPosts(true);
      setIsolatedPostsError(null);
      const posts = await apiClient.getIsolatedPostNodes();
      setIsolatedPostNodes(posts);
    } catch (error: any) {
      setIsolatedPostsError(error.message || 'Failed to fetch isolated posts');
      console.error('Error fetching isolated posts:', error);
    } finally {
      setIsLoadingIsolatedPosts(false);
    }
  };

  // Function to create a new PostNode
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      setIsCreatingPost(true);
      setCreatePostError(null);
      
      const newPost = await apiClient.createPostNode(newPostContent.trim());
      setNewPostContent('');
      
      // Refresh the list of isolated posts
      await fetchIsolatedPostNodes();
      
      console.log('Created new post:', newPost);
    } catch (error: any) {
      setCreatePostError(error.message || 'Failed to create post');
      console.error('Error creating post:', error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Fetch isolated PostNodes on component mount
  useEffect(() => {
    fetchIsolatedPostNodes();
  }, []);

  // Validate the nodeId parameter and check if the node exists
  useEffect(() => {
    const validateNode = async () => {
      if (!nodeId) {
        setNodeError('No node ID provided');
        setIsLoadingNode(false);
        return;
      }

      try {
        setIsLoadingNode(true);
        setNodeError(null);
        
        // Try to fetch the specific node to validate it exists
        await apiClient.getNode(nodeId);
        // If successful, the node exists
      } catch (error) {
        console.error('Failed to fetch node:', error);
        setNodeError(error instanceof Error ? error.message : 'Node not found');
      } finally {
        setIsLoadingNode(false);
      }
    };

    validateNode();
  }, [nodeId]);

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setShowCreateDialog(true);
    setCreateError(null);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setCreateError(null);
  };

  const handleCreateSuccess = (newNodeId: string) => {
    setCreatedNodeId(newNodeId);
    setShowCreateDialog(false);
    setCreateError(null);
    // Navigate to the newly created node
    router.push(`/demo-nodes/${newNodeId}`);
  };

  const handleCreateError = (error: string) => {
    setCreateError(error);
  };

  // Navigate to a different node
  const navigateToNode = (newNodeId: string) => {
    router.push(`/demo-nodes/${newNodeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/demo-nodes" 
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Demo Overview
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current Node ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{nodeId}</code>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              NodeView Components Demonstration
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Inspecting node <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{nodeId}</code>. 
              Click on any node ID in the components below to navigate to that node.
            </p>
          </div>
        </div>

        {/* Node Type Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
            <div className="flex">
              {(['BaseNode', 'UserNode', 'PostNode'] as NodeType[]).map((nodeType) => (
                <button
                  key={nodeType}
                  onClick={() => setSelectedNodeType(nodeType)}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    selectedNodeType === nodeType
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {nodeType === 'BaseNode' ? 'Base Node' : 
                   nodeType === 'UserNode' ? 'User Node' : 'Post Node'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
            <div className="flex">
              {(['view', 'create'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    selectedMode === mode
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {mode === 'view' ? 'View Mode' : 'Create Mode'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleOpenCreateDialog}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
          >
            Create Sample {selectedNodeType === 'BaseNode' ? 'Base' : 
                          selectedNodeType === 'UserNode' ? 'User' : 'Post'} Node
          </button>
        </div>

        {/* Show node validation status */}
        {isLoadingNode && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
              🔍 Validating Node...
            </h3>
            <p className="text-blue-700 dark:text-blue-400">Checking if node exists in the database...</p>
          </div>
        )}

        {nodeError && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
              ❌ Node Not Found
            </h3>
            <p className="text-red-700 dark:text-red-400 mb-2">{nodeError}</p>
            <p className="text-sm text-red-600 dark:text-red-500">
              The node ID <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">{nodeId}</code> could not be found.
              <Link href="/demo-nodes" className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
                Browse available nodes →
              </Link>
            </p>
          </div>
        )}

        {!nodeError && !isLoadingNode && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              ✅ Node Found!
            </h3>
            <p className="text-green-700 dark:text-green-400">
              Viewing node ID: <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded">{nodeId}</code>
            </p>
            <p className="text-sm text-green-600 dark:text-green-500 mt-2">
              The NodeView components below are displaying this node and its relationships.
            </p>
          </div>
        )}

        {/* Show created node if available */}
        {createdNodeId && (
          <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2">
              ✅ Sample Node Created Successfully!
            </h3>
            <p className="text-purple-700 dark:text-purple-400">
              Created node ID: <code className="bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">{createdNodeId}</code>
            </p>
          </div>
        )}

        {/* Focused Node View */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedNodeType === 'BaseNode' ? 'BaseNodeView' : 
                 selectedNodeType === 'UserNode' ? 'UserNodeView' : 'PostNodeView'} Component
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedNodeType === 'BaseNode' && 'The foundational node view component that all other node types extend from.'}
                {selectedNodeType === 'UserNode' && 'Specialized view for user nodes with profile information and user-specific data.'}
                {selectedNodeType === 'PostNode' && 'View component for post nodes, displaying content, metadata, and post-specific features.'}
              </p>
            </div>

            {/* Node Display */}
            <div className="space-y-6">
              {/* Main Node from URL Parameter */}
              {!nodeError && !isLoadingNode && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                    Node from URL Parameter
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                      {nodeId}
                    </span>
                  </h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    {selectedNodeType === 'BaseNode' && <BaseNodeView nodeId={selectedMode === 'create' ? undefined : nodeId} mode={selectedMode} />}
                    {selectedNodeType === 'UserNode' && <UserNodeView nodeId={selectedMode === 'create' ? undefined : nodeId} mode={selectedMode} />}
                    {selectedNodeType === 'PostNode' && <PostNodeView nodeId={selectedMode === 'create' ? undefined : nodeId} mode={selectedMode} />}
                  </div>
                </div>
              )}

              {/* Created Node (for comparison) */}
              {createdNodeId && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Recently Created Sample {selectedNodeType === 'BaseNode' ? 'Base' : 
                                           selectedNodeType === 'UserNode' ? 'User' : 'Post'} Node
                  </h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    {selectedNodeType === 'BaseNode' && <BaseNodeView nodeId={createdNodeId} mode="view" />}
                    {selectedNodeType === 'UserNode' && <UserNodeView nodeId={createdNodeId} mode="view" />}
                    {selectedNodeType === 'PostNode' && <PostNodeView nodeId={createdNodeId} mode="view" />}
                  </div>
                </div>
              )}

              {/* Error State */}
              {nodeError && !isLoadingNode && (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    {selectedNodeType === 'BaseNode' && '📦'}
                    {selectedNodeType === 'UserNode' && '👤'}
                    {selectedNodeType === 'PostNode' && '📝'}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Node Not Available</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    The requested node could not be loaded. Create a sample node above to see the component in action.
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-red-700 dark:text-red-400 text-sm">{nodeError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PostNode Management Section - Only show when PostNode is selected */}
        {selectedNodeType === 'PostNode' && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">PostNode Management</h2>
              
              {/* Create New Post Form */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create New PostNode</h3>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Post Content
                    </label>
                    <textarea
                      id="postContent"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Enter your post content here..."
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      disabled={isCreatingPost}
                    />
                  </div>
                  
                  {createPostError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-3">
                      <p className="text-red-600 dark:text-red-400 text-sm">{createPostError}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      disabled={!newPostContent.trim() || isCreatingPost}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingPost ? 'Creating...' : 'Create Post'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={fetchIsolatedPostNodes}
                      disabled={isLoadingIsolatedPosts}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingIsolatedPosts ? 'Refreshing...' : 'Refresh List'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Isolated PostNodes List */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Isolated PostNodes ({isolatedPostNodes.length})
                </h3>
                
                {isLoadingIsolatedPosts ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8 w-full"></div>
                    ))}
                  </div>
                ) : isolatedPostsError ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
                    <p className="text-red-600 dark:text-red-400">Error: {isolatedPostsError}</p>
                  </div>
                ) : isolatedPostNodes.length === 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
                    <p className="text-yellow-700 dark:text-yellow-400">No isolated PostNodes found. All PostNodes have synapses connected to them.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {isolatedPostNodes.map((post) => {
                      const postId = typeof post._id === 'string' ? post._id : post._id.toString();
                      return (
                        <PostNodeView 
                          key={postId} 
                          nodeId={post._id} 
                          mode="view"
                          compact={true}
                          className="hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Create Sample Node Dialog */}
      <CreateSampleNodeDialog
        isOpen={showCreateDialog}
        onClose={handleCloseCreateDialog}
        nodeType={selectedNodeType}
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
      />
    </div>
  );
}
