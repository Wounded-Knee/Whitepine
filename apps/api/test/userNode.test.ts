import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import { NodeService } from '../src/services/nodeService.js';
import { NODE_TYPES } from '@whitepine/types';
import type { UserNode, PostNode, SynapseNode } from '@whitepine/types';

// Mock the config first to avoid environment variable issues
vi.mock('../src/config/index.js', () => ({
  config: {
    nodeEnv: 'test',
    port: 4000,
    logLevel: 'error',
    mongoUri: 'mongodb://localhost:27017/test',
    corsOrigins: ['http://localhost:3000'],
    jwtSecret: 'test-secret',
    googleClientId: 'test-client-id',
    googleClientSecret: 'test-client-secret',
    sessionSecret: 'test-session-secret'
  }
}));

// Mock the models and services
vi.mock('../src/models/index.js', () => ({
  BaseNodeModel: {
    findById: vi.fn(),
    find: vi.fn(),
    startSession: vi.fn(() => ({
      withTransaction: vi.fn((callback) => callback()),
      endSession: vi.fn()
    }))
  },
  UserNodeModel: {
    create: vi.fn(),
    findById: vi.fn(),
    find: vi.fn()
  },
  PostNodeModel: {
    create: vi.fn(),
    findById: vi.fn(),
    find: vi.fn()
  },
  SynapseNodeModel: {
    create: vi.fn(),
    findById: vi.fn(),
    find: vi.fn(),
    distinct: vi.fn()
  }
}));

vi.mock('../src/services/synapseService.js', () => ({
  SynapseService: {
    getNodeSynapses: vi.fn(),
    createMultipleSynapses: vi.fn(),
    updateSynapse: vi.fn(),
    bulkDeleteSynapses: vi.fn()
  }
}));

vi.mock('../src/middleware/datePermissions.js', () => ({
  isWritePermitted: vi.fn(() => true)
}));

describe('User Node API Tests', () => {
  let mockUser: UserNode;
  let mockPost1: PostNode;
  let mockPost2: PostNode;
  let mockUser2: UserNode;
  let mockSynapse1: SynapseNode;
  let mockSynapse2: SynapseNode;
  let mockSynapse3: SynapseNode;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Create mock data
    const userId = new Types.ObjectId();
    const userId2 = new Types.ObjectId();
    const postId1 = new Types.ObjectId();
    const postId2 = new Types.ObjectId();
    const synapseId1 = new Types.ObjectId();
    const synapseId2 = new Types.ObjectId();
    const synapseId3 = new Types.ObjectId();

    mockUser = {
      _id: userId,
      kind: NODE_TYPES.USER,
      email: 'testuser@example.com',
      name: 'Test User',
      bio: 'A test user for API testing',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: userId,
      updatedBy: userId,
      ownerId: userId,
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false
        }
      }
    } as UserNode;

    mockUser2 = {
      _id: userId2,
      kind: NODE_TYPES.USER,
      email: 'testuser2@example.com',
      name: 'Test User 2',
      bio: 'Another test user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: userId2,
      updatedBy: userId2,
      ownerId: userId2
    } as UserNode;

    mockPost1 = {
      _id: postId1,
      kind: NODE_TYPES.POST,
      content: 'This is a test post created by the test user',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: userId,
      updatedBy: userId,
      ownerId: userId
    } as PostNode;

    mockPost2 = {
      _id: postId2,
      kind: NODE_TYPES.POST,
      content: 'This is another test post',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: userId,
      updatedBy: userId,
      ownerId: userId
    } as PostNode;

    mockSynapse1 = {
      _id: synapseId1,
      kind: NODE_TYPES.SYNAPSE,
      from: userId,
      to: postId1,
      role: 'authored',
      dir: 'out',
      weight: 1.0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: userId,
      updatedBy: userId,
      ownerId: userId,
      props: {
        timestamp: new Date(),
        confidence: 0.95
      }
    } as SynapseNode;

    mockSynapse2 = {
      _id: synapseId2,
      kind: NODE_TYPES.SYNAPSE,
      from: userId,
      to: postId2,
      role: 'liked',
      dir: 'out',
      weight: 0.8,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: userId,
      updatedBy: userId,
      ownerId: userId,
      props: {
        timestamp: new Date(),
        reaction: 'like'
      }
    } as SynapseNode;

    mockSynapse3 = {
      _id: synapseId3,
      kind: NODE_TYPES.SYNAPSE,
      from: userId2,
      to: userId,
      role: 'follows',
      dir: 'out',
      weight: 0.9,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: userId2,
      updatedBy: userId2,
      ownerId: userId2,
      props: {
        timestamp: new Date(),
        notificationEnabled: true
      }
    } as SynapseNode;
  });

  describe('GET /api/nodes/:id - Fetch User Node with Synaptic Relatives', () => {
    it('should fetch a user node with all connected synapses and related nodes', async () => {
      // Import the mocked modules
      const { BaseNodeModel } = await import('../src/models/index.js');
      const { SynapseService } = await import('../src/services/synapseService.js');

      // Mock the database responses
      const mockNode = {
        ...mockUser,
        toObject: () => mockUser
      };
      
      BaseNodeModel.findById.mockResolvedValue(mockNode);
      SynapseService.getNodeSynapses.mockResolvedValue([mockSynapse1, mockSynapse2, mockSynapse3]);
      BaseNodeModel.find.mockResolvedValue([
        { ...mockPost1, toObject: () => mockPost1 },
        { ...mockPost2, toObject: () => mockPost2 },
        { ...mockUser2, toObject: () => mockUser2 }
      ]);

      // Call the NodeService method
      const result = await NodeService.getNodeById(mockUser._id.toString());

      // Verify the main node is returned
      expect(result.node).toBeDefined();
      expect(result.node._id.toString()).toBe(mockUser._id.toString());
      expect(result.node.kind).toBe(NODE_TYPES.USER);
      expect(result.node.email).toBe('testuser@example.com');
      expect(result.node.name).toBe('Test User');
      expect(result.node.bio).toBe('A test user for API testing');
      expect(result.node.isActive).toBe(true);
      expect(result.node.preferences).toEqual({
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false
        }
      });

      // Verify the relatives array contains all connected nodes and synapses
      expect(result.relatives).toBeDefined();
      expect(Array.isArray(result.relatives)).toBe(true);
      expect(result.relatives.length).toBeGreaterThan(0);

      // Extract different types of relatives
      const synapses = result.relatives.filter((rel: any) => rel.kind === NODE_TYPES.SYNAPSE);
      const posts = result.relatives.filter((rel: any) => rel.kind === NODE_TYPES.POST);
      const users = result.relatives.filter((rel: any) => rel.kind === NODE_TYPES.USER);

      // Verify synapses are included
      expect(synapses.length).toBe(3);
      
      // Find the specific synapses we created
      const authoredSynapse = synapses.find((s: any) => s.role === 'authored');
      const likedSynapse = synapses.find((s: any) => s.role === 'liked');
      const followsSynapse = synapses.find((s: any) => s.role === 'follows');

      expect(authoredSynapse).toBeDefined();
      expect(authoredSynapse.dir).toBe('out');
      expect(authoredSynapse.weight).toBe(1.0);
      expect(authoredSynapse.props.confidence).toBe(0.95);

      expect(likedSynapse).toBeDefined();
      expect(likedSynapse.dir).toBe('out');
      expect(likedSynapse.weight).toBe(0.8);
      expect(likedSynapse.props.reaction).toBe('like');

      expect(followsSynapse).toBeDefined();
      expect(followsSynapse.dir).toBe('out');
      expect(followsSynapse.weight).toBe(0.9);
      expect(followsSynapse.props.notificationEnabled).toBe(true);

      // Verify connected nodes are included
      expect(posts.length).toBe(2);
      
      const post1InRelatives = posts.find((p: any) => p._id.toString() === mockPost1._id.toString());
      const post2InRelatives = posts.find((p: any) => p._id.toString() === mockPost2._id.toString());
      
      expect(post1InRelatives).toBeDefined();
      expect(post1InRelatives.content).toBe('This is a test post created by the test user');
      expect(post1InRelatives.publishedAt).toBeDefined();

      expect(post2InRelatives).toBeDefined();
      expect(post2InRelatives.content).toBe('This is another test post');
      expect(post2InRelatives.publishedAt).toBeDefined();

      // Verify the following user is included
      expect(users.length).toBe(1);
      
      const user2InRelatives = users.find((u: any) => u._id.toString() === mockUser2._id.toString());
      expect(user2InRelatives).toBeDefined();
      expect(user2InRelatives.email).toBe('testuser2@example.com');
      expect(user2InRelatives.name).toBe('Test User 2');

      // Verify the service methods were called correctly
      expect(BaseNodeModel.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(SynapseService.getNodeSynapses).toHaveBeenCalledWith(mockUser._id.toString(), {
        includeDeleted: false
      });
    });

    it('should include readOnly field on all nodes based on write permissions', async () => {
      const { BaseNodeModel } = await import('../src/models/index.js');
      const { SynapseService } = await import('../src/services/synapseService.js');

      const mockNode = {
        ...mockUser,
        toObject: () => mockUser
      };
      
      BaseNodeModel.findById.mockResolvedValue(mockNode);
      SynapseService.getNodeSynapses.mockResolvedValue([mockSynapse1]);
      BaseNodeModel.find.mockResolvedValue([
        { ...mockPost1, toObject: () => mockPost1 }
      ]);

      const result = await NodeService.getNodeById(mockUser._id.toString());

      // Check that readOnly field is present on the main node
      expect(result.node.readOnly).toBeDefined();
      expect(typeof result.node.readOnly).toBe('boolean');

      // Check that readOnly field is present on all relatives
      result.relatives.forEach((relative: any) => {
        if (relative.kind && relative.kind !== NODE_TYPES.SYNAPSE) {
          expect(relative.readOnly).toBeDefined();
          expect(typeof relative.readOnly).toBe('boolean');
        }
      });
    });

    it('should handle user nodes with no synaptic connections', async () => {
      const { BaseNodeModel } = await import('../src/models/index.js');
      const { SynapseService } = await import('../src/services/synapseService.js');

      const isolatedUser = {
        ...mockUser,
        _id: new Types.ObjectId(),
        email: 'isolated@example.com',
        name: 'Isolated User',
        toObject: () => ({
          ...mockUser,
          _id: new Types.ObjectId(),
          email: 'isolated@example.com',
          name: 'Isolated User'
        })
      };
      
      BaseNodeModel.findById.mockResolvedValue(isolatedUser);
      SynapseService.getNodeSynapses.mockResolvedValue([]);
      BaseNodeModel.find.mockResolvedValue([]);

      const result = await NodeService.getNodeById(isolatedUser._id.toString());

      expect(result.node).toBeDefined();
      expect(result.node.email).toBe('isolated@example.com');
      
      // Should have empty relatives array or only contain synapses (which would be empty)
      const nonSynapseRelatives = result.relatives.filter((rel: any) => rel.kind !== NODE_TYPES.SYNAPSE);
      expect(nonSynapseRelatives.length).toBe(0);
    });

    it('should exclude soft-deleted nodes from relatives', async () => {
      const { BaseNodeModel } = await import('../src/models/index.js');
      const { SynapseService } = await import('../src/services/synapseService.js');

      const mockNode = {
        ...mockUser,
        toObject: () => mockUser
      };
      
      // Create a soft-deleted post
      const deletedPost = {
        ...mockPost1,
        deletedAt: new Date()
      };
      
      BaseNodeModel.findById.mockResolvedValue(mockNode);
      SynapseService.getNodeSynapses.mockResolvedValue([mockSynapse1, mockSynapse2]);
      // Only return non-deleted posts
      BaseNodeModel.find.mockResolvedValue([
        { ...mockPost2, toObject: () => mockPost2 },
        { ...mockUser2, toObject: () => mockUser2 }
      ]);

      const result = await NodeService.getNodeById(mockUser._id.toString());

      // The deleted post should not appear in relatives
      const posts = result.relatives.filter((rel: any) => rel.kind === NODE_TYPES.POST);
      const deletedPostInRelatives = posts.find((p: any) => p._id.toString() === mockPost1._id.toString());
      
      expect(deletedPostInRelatives).toBeUndefined();
      
      // But the synapse should still be there (it's not deleted)
      const synapses = result.relatives.filter((rel: any) => rel.kind === NODE_TYPES.SYNAPSE);
      const authoredSynapse = synapses.find((s: any) => s.role === 'authored');
      expect(authoredSynapse).toBeDefined();
    });

    it('should return 404 for non-existent user node', async () => {
      const { BaseNodeModel } = await import('../src/models/index.js');
      
      BaseNodeModel.findById.mockResolvedValue(null);

      const nonExistentId = new Types.ObjectId();
      
      await expect(NodeService.getNodeById(nonExistentId.toString()))
        .rejects.toThrow('Node not found');
    });

    it('should return 400 for invalid node ID format', async () => {
      await expect(NodeService.getNodeById('invalid-id'))
        .rejects.toThrow('Invalid node ID');
    });
  });

  describe('GET /api/nodes/:id/synapses - Fetch User Node with Specific Synapse Filtering', () => {
    it('should fetch user node with synapses filtered by role', async () => {
      const { BaseNodeModel } = await import('../src/models/index.js');
      const { SynapseService } = await import('../src/services/synapseService.js');

      const mockNode = {
        ...mockUser,
        toObject: () => mockUser
      };
      
      BaseNodeModel.findById.mockResolvedValue(mockNode);
      SynapseService.getNodeSynapses.mockResolvedValue([mockSynapse1]);

      const result = await NodeService.getNodeWithSynapses(mockUser._id.toString(), {
        role: 'authored',
        includeDeleted: false
      });

      expect(result.node).toBeDefined();
      expect(result.node._id.toString()).toBe(mockUser._id.toString());
      
      expect(result.synapses).toBeDefined();
      expect(Array.isArray(result.synapses)).toBe(true);
      
      // Should only include synapses with 'authored' role
      const authoredSynapses = result.synapses.filter((s: any) => s.role === 'authored');
      expect(authoredSynapses.length).toBe(1);
      expect(authoredSynapses[0].to.toString()).toBe(mockPost1._id.toString());

      // Verify the service was called with correct parameters
      expect(SynapseService.getNodeSynapses).toHaveBeenCalledWith(mockUser._id.toString(), {
        role: 'authored',
        includeDeleted: false
      });
    });

    it('should fetch user node with synapses filtered by direction', async () => {
      const { BaseNodeModel } = await import('../src/models/index.js');
      const { SynapseService } = await import('../src/services/synapseService.js');

      const mockNode = {
        ...mockUser,
        toObject: () => mockUser
      };
      
      BaseNodeModel.findById.mockResolvedValue(mockNode);
      SynapseService.getNodeSynapses.mockResolvedValue([mockSynapse1, mockSynapse2]);

      const result = await NodeService.getNodeWithSynapses(mockUser._id.toString(), {
        dir: 'out',
        includeDeleted: false
      });

      expect(result.node).toBeDefined();
      expect(result.synapses).toBeDefined();
      
      // Should only include outgoing synapses
      const outgoingSynapses = result.synapses.filter((s: any) => s.dir === 'out');
      expect(outgoingSynapses.length).toBe(2);
      
      // All synapses should be outgoing
      result.synapses.forEach((synapse: any) => {
        expect(synapse.dir).toBe('out');
      });

      // Verify the service was called with correct parameters
      expect(SynapseService.getNodeSynapses).toHaveBeenCalledWith(mockUser._id.toString(), {
        dir: 'out',
        includeDeleted: false
      });
    });

    it('should include deleted synapses when requested', async () => {
      const { BaseNodeModel } = await import('../src/models/index.js');
      const { SynapseService } = await import('../src/services/synapseService.js');

      const mockNode = {
        ...mockUser,
        toObject: () => mockUser
      };
      
      const deletedSynapse = {
        ...mockSynapse1,
        deletedAt: new Date()
      };
      
      BaseNodeModel.findById.mockResolvedValue(mockNode);
      SynapseService.getNodeSynapses
        .mockResolvedValueOnce([mockSynapse1, mockSynapse2, deletedSynapse]) // with deleted
        .mockResolvedValueOnce([mockSynapse1, mockSynapse2]); // without deleted

      const resultWithDeleted = await NodeService.getNodeWithSynapses(mockUser._id.toString(), {
        includeDeleted: true
      });

      const resultWithoutDeleted = await NodeService.getNodeWithSynapses(mockUser._id.toString(), {
        includeDeleted: false
      });

      // Should include deleted synapse when requested
      expect(resultWithDeleted.synapses.length).toBe(3);
      expect(resultWithoutDeleted.synapses.length).toBe(2);
      
      const deletedSynapseInResult = resultWithDeleted.synapses.find((s: any) => 
        s._id.toString() === mockSynapse1._id.toString() && s.deletedAt
      );
      expect(deletedSynapseInResult).toBeDefined();
      expect(deletedSynapseInResult.deletedAt).toBeDefined();
    });
  });
});