import type { BaseNode, UserNode } from '@whitepine/types';
import { getSession } from 'next-auth/react';

// API client for node operations
class ApiClient {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private ongoingRequests: Map<string, Promise<any>> = new Map();

  constructor(baseUrl?: string) {
    // Use provided baseUrl, or default to local API server
    this.baseUrl = baseUrl || (typeof window !== 'undefined' 
      ? 'http://localhost:4000/api'  // Browser environment
      : 'http://localhost:4000/api'  // Server environment
    );
  }

  private getCacheKey(url: string): string {
    return `api:${url}`;
  }

  private getCachedData(url: string): any | null {
    const cacheKey = this.getCacheKey(url);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    
    // Remove expired cache entry
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  private setCachedData(url: string, data: any): void {
    const cacheKey = this.getCacheKey(url);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  private invalidateCache(pattern?: string): void {
    if (pattern) {
      // Invalidate specific cache entries matching pattern
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.user?.id) {
      // Include the user ID in a custom header for the API server
      headers['X-User-ID'] = session.user.id;
    }

    return headers;
  }

  /**
   * Fetch a single node by ID with automatically included relatives
   */
  async getNode(nodeId: string): Promise<{
    node: BaseNode | UserNode;
    allRelatives: any[];
    allRelativeIds: string[];
    relativesByRole: Record<string, Record<string, string[]>>;
  }> {
    const url = `${this.baseUrl}/nodes/${nodeId}`;
    
    // Check cache first
    const cachedData = this.getCachedData(url);
    if (cachedData) {
      return cachedData;
    }

    // Check if request is already ongoing
    if (this.ongoingRequests.has(url)) {
      return this.ongoingRequests.get(url)!;
    }
    
    // Create the request promise
    const requestPromise = this.makeHttpRequest(url);
    
    // Track the ongoing request
    this.ongoingRequests.set(url, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up the ongoing request
      this.ongoingRequests.delete(url);
    }
  }

  /**
   * Make the actual HTTP request
   */
  private async makeHttpRequest(url: string): Promise<{
    node: BaseNode | UserNode;
    allRelatives: any[];
    allRelativeIds: string[];
    relativesByRole: Record<string, Record<string, string[]>>;
  }> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch node: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.data;
    
    // Cache the result
    this.setCachedData(url, result);
    
    return result;
  }

  /**
   * Fetch multiple nodes with optional filtering
   */
  async getNodes(params?: {
    kind?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ nodes: (BaseNode | UserNode)[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params?.kind) searchParams.append('kind', params.kind);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('skip', params.offset.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `${this.baseUrl}/nodes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch nodes: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      nodes: data.data,
      pagination: data.pagination,
    };
  }

  /**
   * Create a new node
   */
  async createNode(nodeData: Partial<BaseNode | UserNode>): Promise<BaseNode | UserNode> {
    const response = await fetch(`${this.baseUrl}/nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nodeData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create node: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Update an existing node
   */
  async updateNode(nodeId: string, updates: Partial<BaseNode | UserNode>): Promise<BaseNode | UserNode> {
    const response = await fetch(`${this.baseUrl}/nodes/${nodeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update node: ${response.statusText}`);
    }

    const data = await response.json();
    const nodeData = data.data;
    
    // Invalidate cache for this specific node
    this.invalidateCache(`/nodes/${nodeId}`);
    
    return nodeData;
  }

  /**
   * Delete a node (soft delete)
   */
  async deleteNode(nodeId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/nodes/${nodeId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete node: ${response.statusText}`);
    }
    
    // Invalidate cache for this specific node
    this.invalidateCache(`/nodes/${nodeId}`);
  }

  /**
   * Get isolated PostNodes (PostNodes without synapses)
   */
  async getIsolatedPostNodes(): Promise<any[]> {
    const url = `${this.baseUrl}/nodes/isolated-posts`;
    
    // Check cache first
    const cached = this.getCachedData(url);
    if (cached) {
      return cached;
    }

    // Check if request is already in progress
    if (this.ongoingRequests.has(url)) {
      return this.ongoingRequests.get(url)!;
    }

    const request = this.makeHttpRequest(url);
    this.ongoingRequests.set(url, request);

    try {
      const response = await request;
      this.setCachedData(url, response);
      return response;
    } finally {
      this.ongoingRequests.delete(url);
    }
  }

  /**
   * Create a new PostNode
   */
  async createPostNode(content: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/nodes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        kind: 'post',
        content: content,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Failed to create post: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Invalidate cache for isolated posts since we just created a new one
    this.invalidateCache('/nodes/isolated-posts');
    
    return result.data;
  }

  /**
   * Create a new node with a relationship (synapse) to an existing node
   */
  async createNodeWithRelationship(nodeData: any, synapseData: any): Promise<{
    node: BaseNode | UserNode;
    synapse: any;
  }> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/nodes/with-relationship`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        node: nodeData,
        synapse: synapseData
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create node with relationship: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Invalidate relevant caches
    this.invalidateCache('/nodes/isolated-posts');
    
    return result.data;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export { ApiClient };
