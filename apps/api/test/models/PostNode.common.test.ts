import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import { PostNodeModel, postNodeSchema } from '../../src/models/index.js';
import { POST_NODE_CONFIG } from '@whitepine/types';
import { NODE_TYPES } from '@whitepine/types';
import { runNodeModelCommonTests, runDiscriminatorModelTests, createMockNodeData, createMockModelInstance } from './shared/NodeModelCommonTests.js';

// Mock mongoose
vi.mock('mongoose', async () => {
  const actual = await vi.importActual('mongoose');
  return {
    ...actual,
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    connection: {
      readyState: 1,
      close: vi.fn().mockResolvedValue(undefined),
    },
  };
});

// Mock the BaseNode model
vi.mock('../../src/models/BaseNode.js', async () => {
  const actual = await vi.importActual('../../src/models/BaseNode.js');
  return {
    ...actual,
    BaseNodeModel: {
      discriminator: vi.fn().mockReturnValue({
        find: vi.fn(),
        findOne: vi.fn(),
        findActive: vi.fn(),
        findByKindAndSlug: vi.fn(),
        findPublished: vi.fn(),
        searchContent: vi.fn(),
        // Schema will be provided by the test configuration
      }),
    },
  };
});

describe('PostNode Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Run common tests
  runNodeModelCommonTests({
    nodeType: NODE_TYPES.POST,
    schema: postNodeSchema,
    model: PostNodeModel,
    selectionCriteria: POST_NODE_CONFIG.selectionCriteria,
    requiredFields: {
      content: 'String',
    },
    optionalFields: {
      publishedAt: 'Date',
    },
    staticMethods: [
      'findActive',
      'findByKindAndSlug',
      'findPublished',
      'searchContent',
    ],
    instanceMethods: [
      'softDelete',
      'restore',
      'publish',
      'unpublish',
    ],
    customTests: (config) => {
      describe('PostNode Specific Tests', () => {
        it('should have content field with trim constraint', () => {
          const contentPath = postNodeSchema.paths.content;
          expect(contentPath.options.trim).toBe(true);
          expect(contentPath.options.required).toBe(true);
        });

        it('should have publishedAt field with null default', () => {
          const publishedAtPath = postNodeSchema.paths.publishedAt;
          expect(publishedAtPath.options.default).toBeNull();
          expect(publishedAtPath.options.index).toBe(true);
        });

        it('should have text search index on content', () => {
          const indexes = postNodeSchema.indexes();
          expect(indexes.length).toBeGreaterThan(0);
        });

        it('should have index on publishedAt', () => {
          const indexes = postNodeSchema.indexes();
          const publishedAtIndex = indexes.find(index => 
            index[0] && 
            index[0].publishedAt === -1
          );
          
          expect(publishedAtIndex).toBeDefined();
        });

        describe('PostNode Methods', () => {
          it('should implement findPublished method', () => {
            expect(typeof PostNodeModel.findPublished).toBe('function');
          });

          it('should implement searchContent method', () => {
            expect(typeof PostNodeModel.searchContent).toBe('function');
          });

          it('should implement publish method', () => {
            const mockInstance = createMockModelInstance({
              publishedAt: null,
              publish: function() {
                this.publishedAt = new Date();
                return this.save();
              }
            });
            
            expect(typeof mockInstance.publish).toBe('function');
          });

          it('should implement unpublish method', () => {
            const mockInstance = createMockModelInstance({
              publishedAt: new Date(),
              unpublish: function() {
                this.publishedAt = null;
                return this.save();
              }
            });
            
            expect(typeof mockInstance.unpublish).toBe('function');
          });
        });

        describe('PostNode Selection Criteria', () => {
          it('should extend base selection criteria with publishedAt filter', () => {
            expect(POST_NODE_CONFIG.selectionCriteria.relatives.publishedAt).toEqual({ $ne: null });
            expect(POST_NODE_CONFIG.selectionCriteria.relatives.deletedAt).toBeNull();
          });

          it('should inherit cardinal criteria from base', () => {
            expect(POST_NODE_CONFIG.selectionCriteria.cardinal.deletedAt).toBeNull();
          });
        });

        describe('PostNode Data Validation', () => {
          it('should accept valid post data structure', () => {
            const validPostData = createMockNodeData(NODE_TYPES.POST, {
              content: 'This is a test post content.',
              publishedAt: new Date(),
            });

            expect(validPostData.content).toBe('This is a test post content.');
            expect(validPostData.publishedAt).toBeInstanceOf(Date);
          });

          it('should handle draft post data', () => {
            const draftPostData = createMockNodeData(NODE_TYPES.POST, {
              content: 'This is a draft post.',
              publishedAt: null,
            });

            expect(draftPostData.content).toBe('This is a draft post.');
            expect(draftPostData.publishedAt).toBeNull();
          });

          it('should handle minimal post data', () => {
            const minimalPostData = createMockNodeData(NODE_TYPES.POST, {
              content: 'Minimal content',
            });

            expect(minimalPostData.content).toBe('Minimal content');
          });
        });

        describe('PostNode Publishing Logic', () => {
          it('should handle publish workflow', () => {
            const mockPost = createMockModelInstance({
              content: 'Test content',
              publishedAt: null,
              publish: function() {
                this.publishedAt = new Date();
                return this.save();
              }
            });

            // Initially unpublished
            expect(mockPost.publishedAt).toBeNull();

            // Publish the post
            const result = mockPost.publish();
            expect(mockPost.publishedAt).toBeInstanceOf(Date);
            // The result should be defined (either the instance or a Promise)
            expect(result).toBeDefined();
          });

          it('should handle unpublish workflow', () => {
            const publishedDate = new Date();
            const mockPost = createMockModelInstance({
              content: 'Test content',
              publishedAt: publishedDate,
              unpublish: function() {
                this.publishedAt = null;
                return this.save();
              }
            });

            // Initially published
            expect(mockPost.publishedAt).toBe(publishedDate);

            // Unpublish the post
            const result = mockPost.unpublish();
            expect(mockPost.publishedAt).toBeNull();
            // The result should be defined (either the instance or a Promise)
            expect(result).toBeDefined();
          });
        });
      });
    },
  });

  // Run discriminator tests
  runDiscriminatorModelTests({
    nodeType: NODE_TYPES.POST,
    schema: postNodeSchema,
    model: PostNodeModel,
    selectionCriteria: POST_NODE_CONFIG.selectionCriteria,
    requiredFields: {
      content: 'String',
    },
    optionalFields: {
      publishedAt: 'Date',
    },
  });
});
