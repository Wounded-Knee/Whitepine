'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BaseNodeView, UserNodeView, PostNodeView } from '@web/components/NodeView';
import { useAppDispatch } from '@web/store/hooks';
import { createNode, fetchNodes } from '@web/store/slices/nodesSlice';
import { apiClient } from '@web/lib/api-client';
import { ArrowLeft, ExternalLink } from 'lucide-react';

type NodeType = 'BaseNode' | 'UserNode' | 'PostNode';

export default function NodeViewDemo() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const nodeId = params.nodeId as string;
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType>('BaseNode');
  const [createdNodeId, setCreatedNodeId] = useState<string | null>(null);
  const [isLoadingNode, setIsLoadingNode] = useState(true);
  const [nodeError, setNodeError] = useState<string | null>(null);
  
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

  // Create a sample node based on selected type
  const createSampleNode = async () => {
    try {
      let nodeData: any = {
        createdBy: '507f1f77bcf86cd799439011',
        ownerId: '507f1f77bcf86cd799439011',
      };

      switch (selectedNodeType) {
        case 'BaseNode':
          nodeData.kind = 'BaseNode';
          break;
        case 'UserNode':
          nodeData = {
            ...nodeData,
            kind: 'User',
            email: 'demo@example.com',
            name: 'Demo User',
            bio: 'This is a demo user created for testing the UserNodeView component.',
            isActive: true,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            preferences: {
              theme: 'dark',
              language: 'en',
              notifications: {
                email: true,
                push: false,
              },
            },
          };
          break;
        case 'PostNode':
          nodeData = {
            ...nodeData,
            kind: 'Post',
            content: 'This is a sample post created for testing the PostNodeView component.',
            title: 'Sample Post Title',
            tags: ['demo', 'sample', 'testing'],
          };
          break;
      }
      
      const result = await dispatch(createNode(nodeData)).unwrap();
      setCreatedNodeId(result._id.toString());
    } catch (error) {
      console.error('Failed to create sample node:', error);
    }
  };

  // Navigate to a different node
  const navigateToNode = (newNodeId: string) => {
    router.push(`/demo-nodes/${newNodeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/demo-nodes" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Demo Overview
            </Link>
            <div className="text-sm text-gray-500">
              Current Node ID: <code className="bg-gray-100 px-2 py-1 rounded">{nodeId}</code>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              NodeView Components Demonstration
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Inspecting node <code className="bg-gray-100 px-2 py-1 rounded">{nodeId}</code>. 
              Click on any node ID in the components below to navigate to that node.
            </p>
          </div>
        </div>

        {/* Node Type Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-1">
            <div className="flex">
              {(['BaseNode', 'UserNode', 'PostNode'] as NodeType[]).map((nodeType) => (
                <button
                  key={nodeType}
                  onClick={() => setSelectedNodeType(nodeType)}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    selectedNodeType === nodeType
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {nodeType === 'BaseNode' ? 'Base Node' : 
                   nodeType === 'UserNode' ? 'User Node' : 'Post Node'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={createSampleNode}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Sample {selectedNodeType === 'BaseNode' ? 'Base' : 
                          selectedNodeType === 'UserNode' ? 'User' : 'Post'} Node
          </button>
        </div>

        {/* Show node validation status */}
        {isLoadingNode && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🔍 Validating Node...
            </h3>
            <p className="text-blue-700">Checking if node exists in the database...</p>
          </div>
        )}

        {nodeError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ❌ Node Not Found
            </h3>
            <p className="text-red-700 mb-2">{nodeError}</p>
            <p className="text-sm text-red-600">
              The node ID <code className="bg-red-100 px-2 py-1 rounded">{nodeId}</code> could not be found.
              <Link href="/demo-nodes" className="ml-2 text-blue-600 hover:text-blue-800 underline">
                Browse available nodes →
              </Link>
            </p>
          </div>
        )}

        {!nodeError && !isLoadingNode && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Node Found!
            </h3>
            <p className="text-green-700">
              Viewing node ID: <code className="bg-green-100 px-2 py-1 rounded">{nodeId}</code>
            </p>
            <p className="text-sm text-green-600 mt-2">
              The NodeView components below are displaying this node and its relationships.
            </p>
          </div>
        )}

        {/* Show created node if available */}
        {createdNodeId && (
          <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              ✅ Sample Node Created Successfully!
            </h3>
            <p className="text-purple-700">
              Created node ID: <code className="bg-purple-100 px-2 py-1 rounded">{createdNodeId}</code>
            </p>
          </div>
        )}

        {/* Focused Node View */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedNodeType === 'BaseNode' ? 'BaseNodeView' : 
                 selectedNodeType === 'UserNode' ? 'UserNodeView' : 'PostNodeView'} Component
              </h2>
              <p className="text-gray-600">
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
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    Node from URL Parameter
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {nodeId}
                    </span>
                  </h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    {selectedNodeType === 'BaseNode' && <BaseNodeView nodeId={nodeId} />}
                    {selectedNodeType === 'UserNode' && <UserNodeView nodeId={nodeId} />}
                    {selectedNodeType === 'PostNode' && <PostNodeView nodeId={nodeId} />}
                  </div>
                </div>
              )}

              {/* Created Node (for comparison) */}
              {createdNodeId && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Recently Created Sample {selectedNodeType === 'BaseNode' ? 'Base' : 
                                           selectedNodeType === 'UserNode' ? 'User' : 'Post'} Node
                  </h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    {selectedNodeType === 'BaseNode' && <BaseNodeView nodeId={createdNodeId} />}
                    {selectedNodeType === 'UserNode' && <UserNodeView nodeId={createdNodeId} />}
                    {selectedNodeType === 'PostNode' && <PostNodeView nodeId={createdNodeId} />}
                  </div>
                </div>
              )}

              {/* Error State */}
              {nodeError && !isLoadingNode && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    {selectedNodeType === 'BaseNode' && '📦'}
                    {selectedNodeType === 'UserNode' && '👤'}
                    {selectedNodeType === 'PostNode' && '📝'}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Node Not Available</h3>
                  <p className="text-gray-600 mb-4">
                    The requested node could not be loaded. Create a sample node above to see the component in action.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-red-700 text-sm">{nodeError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PostNode Management Section - Only show when PostNode is selected */}
        {selectedNodeType === 'PostNode' && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">PostNode Management</h2>
              
              {/* Create New Post Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Create New PostNode</h3>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 mb-2">
                      Post Content
                    </label>
                    <textarea
                      id="postContent"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Enter your post content here..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      disabled={isCreatingPost}
                    />
                  </div>
                  
                  {createPostError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm">{createPostError}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      disabled={!newPostContent.trim() || isCreatingPost}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingPost ? 'Creating...' : 'Create Post'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={fetchIsolatedPostNodes}
                      disabled={isLoadingIsolatedPosts}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingIsolatedPosts ? 'Refreshing...' : 'Refresh List'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Isolated PostNodes List */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Isolated PostNodes ({isolatedPostNodes.length})
                </h3>
                
                {isLoadingIsolatedPosts ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-200 rounded h-8 w-full"></div>
                    ))}
                  </div>
                ) : isolatedPostsError ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600">Error: {isolatedPostsError}</p>
                  </div>
                ) : isolatedPostNodes.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-700">No isolated PostNodes found. All PostNodes have synapses connected to them.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {isolatedPostNodes.map((post) => {
                      const postId = typeof post._id === 'string' ? post._id : post._id.toString();
                      return (
                        <PostNodeView 
                          key={postId} 
                          nodeId={post._id} 
                          compact={true}
                          className="hover:bg-white/50 transition-colors"
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
    </div>
  );
}
