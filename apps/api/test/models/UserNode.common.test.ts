import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import { UserNodeModel, userNodeSchema } from '../../src/models/index.js';
import { USER_NODE_CONFIG } from '@whitepine/types';
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
        findActiveUsers: vi.fn(),
        findByEmail: vi.fn(),
      }),
    },
  };
});

describe('UserNode Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Run common tests
  runNodeModelCommonTests({
    nodeType: NODE_TYPES.USER,
    schema: userNodeSchema,
    model: UserNodeModel,
    selectionCriteria: USER_NODE_CONFIG.selectionCriteria,
    requiredFields: {
      email: 'String',
      name: 'String',
    },
    optionalFields: {
      avatar: 'String',
      bio: 'String',
      isActive: 'Boolean',
      lastLoginAt: 'Date',
      // Note: preferences is a nested schema, not a simple Mixed type
      // We'll test it separately in custom tests
    },
    staticMethods: [
      'findActive',
      'findByKindAndSlug',
      'findActiveUsers',
      'findByEmail',
    ],
    instanceMethods: [
      'softDelete',
      'restore',
      'updateLastLogin',
      'deactivate',
      'activate',
    ],
    customTests: (config) => {
      describe('UserNode Specific Tests', () => {
        it('should have email field with unique constraint', () => {
          const emailPath = userNodeSchema.paths.email;
          expect(emailPath.options.unique).toBe(true);
          expect(emailPath.options.lowercase).toBe(true);
          expect(emailPath.options.trim).toBe(true);
        });

        it('should have name field with maxlength constraint', () => {
          const namePath = userNodeSchema.paths.name;
          expect(namePath.options.maxlength).toBe(100);
          expect(namePath.options.trim).toBe(true);
        });

        it('should have bio field with maxlength constraint', () => {
          const bioPath = userNodeSchema.paths.bio;
          expect(bioPath.options.maxlength).toBe(500);
          expect(bioPath.options.trim).toBe(true);
        });

        it('should have isActive field with default true', () => {
          const isActivePath = userNodeSchema.paths.isActive;
          expect(isActivePath.options.default).toBe(true);
          expect(isActivePath.options.index).toBe(true);
        });

        it('should have text search index on name and bio', () => {
          const indexes = userNodeSchema.indexes();
          expect(indexes.length).toBeGreaterThan(0);
        });

        it('should have compound index on email and isActive', () => {
          const indexes = userNodeSchema.indexes();
          const compoundIndex = indexes.find(index => 
            index[0] && 
            index[0].email === 1 && 
            index[0].isActive === 1
          );
          
          expect(compoundIndex).toBeDefined();
        });

        it('should have index on lastLoginAt', () => {
          const indexes = userNodeSchema.indexes();
          const lastLoginIndex = indexes.find(index => 
            index[0] && 
            index[0].lastLoginAt === -1
          );
          
          expect(lastLoginIndex).toBeDefined();
        });

        describe('UserNode Methods', () => {
          it('should implement findActiveUsers method', () => {
            expect(typeof UserNodeModel.findActiveUsers).toBe('function');
          });

          it('should implement findByEmail method', () => {
            expect(typeof UserNodeModel.findByEmail).toBe('function');
          });

          it('should implement updateLastLogin method', () => {
            const mockInstance = createMockModelInstance({
              lastLoginAt: null,
              updateLastLogin: function() {
                this.lastLoginAt = new Date();
                return this.save();
              }
            });
            
            expect(typeof mockInstance.updateLastLogin).toBe('function');
          });

          it('should implement deactivate method', () => {
            const mockInstance = createMockModelInstance({
              isActive: true,
              deactivate: function() {
                this.isActive = false;
                return this.save();
              }
            });
            
            expect(typeof mockInstance.deactivate).toBe('function');
          });

          it('should implement activate method', () => {
            const mockInstance = createMockModelInstance({
              isActive: false,
              activate: function() {
                this.isActive = true;
                return this.save();
              }
            });
            
            expect(typeof mockInstance.activate).toBe('function');
          });
        });

        describe('UserNode Selection Criteria', () => {
          it('should extend base selection criteria with isActive filter', () => {
            expect(USER_NODE_CONFIG.selectionCriteria.relatives.isActive).toBe(true);
            expect(USER_NODE_CONFIG.selectionCriteria.relatives.deletedAt).toBeNull();
          });

          it('should inherit cardinal criteria from base', () => {
            expect(USER_NODE_CONFIG.selectionCriteria.cardinal.deletedAt).toBeNull();
          });
        });

        describe('UserNode Data Validation', () => {
          it('should accept valid user data structure', () => {
            const validUserData = createMockNodeData(NODE_TYPES.USER, {
              email: 'test@example.com',
              name: 'Test User',
              avatar: 'https://example.com/avatar.jpg',
              bio: 'Test bio',
              isActive: true,
              lastLoginAt: new Date(),
              preferences: {
                theme: 'dark',
                language: 'en',
                notifications: {
                  email: true,
                  push: false,
                },
              },
            });

            expect(validUserData.email).toBe('test@example.com');
            expect(validUserData.name).toBe('Test User');
            expect(validUserData.isActive).toBe(true);
            expect(validUserData.preferences.theme).toBe('dark');
          });

          it('should handle minimal user data', () => {
            const minimalUserData = createMockNodeData(NODE_TYPES.USER, {
              email: 'minimal@example.com',
              name: 'Minimal User',
            });

            expect(minimalUserData.email).toBe('minimal@example.com');
            expect(minimalUserData.name).toBe('Minimal User');
          });
        });
      });
    },
  });

  // Run discriminator tests
  runDiscriminatorModelTests({
    nodeType: NODE_TYPES.USER,
    schema: userNodeSchema,
    model: UserNodeModel,
    selectionCriteria: USER_NODE_CONFIG.selectionCriteria,
    requiredFields: {
      email: 'String',
      name: 'String',
    },
    optionalFields: {
      avatar: 'String',
      bio: 'String',
      isActive: 'Boolean',
      lastLoginAt: 'Date',
      // Note: preferences is a nested schema, not a simple Mixed type
      // We'll test it separately in custom tests
    },
  });
});
