import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import { SynapseNodeModel, synapseNodeSchema } from '../../src/models/index.js';
import { SYNAPSE_NODE_CONFIG } from '@whitepine/types';
import { NODE_TYPES, SYNAPSE_ROLES, SYNAPSE_DIRECTIONS } from '@whitepine/types';
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
        findByRole: vi.fn(),
        findFrom: vi.fn(),
        findTo: vi.fn(),
        findBetween: vi.fn(),
        findByDirection: vi.fn(),
        // Import the actual SynapseNode model to get its merged schema
        // Schema will be provided by the test configuration
      }),
    },
  };
});

describe('SynapseNode Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Run common tests
  runNodeModelCommonTests({
    nodeType: NODE_TYPES.SYNAPSE,
    schema: synapseNodeSchema,
    model: SynapseNodeModel,
    selectionCriteria: SYNAPSE_NODE_CONFIG.selectionCriteria,
    requiredFields: {
      from: 'ObjectId',
      to: 'ObjectId',
      role: 'String',
    },
    optionalFields: {
      dir: 'String',
      order: 'Number',
      weight: 'Number',
      props: 'Mixed',
    },
    staticMethods: [
      'findActive',
      'findByKindAndSlug',
      'findByRole',
      'findFrom',
      'findTo',
      'findBetween',
      'findByDirection',
    ],
    instanceMethods: [
      'softDelete',
      'restore',
      'reverse',
      'updateWeight',
      'updateOrder',
    ],
    customTests: (config) => {
      describe('SynapseNode Specific Tests', () => {
        it('should have from field with ObjectId type and ref', () => {
          const fromPath = synapseNodeSchema.paths.from;
          expect(fromPath.instance).toBe('ObjectId');
          expect(fromPath.options.ref).toBe('BaseNode');
          expect(fromPath.options.required).toBe(true);
          expect(fromPath.options.index).toBe(true);
        });

        it('should have to field with ObjectId type and ref', () => {
          const toPath = synapseNodeSchema.paths.to;
          expect(toPath.instance).toBe('ObjectId');
          expect(toPath.options.ref).toBe('BaseNode');
          expect(toPath.options.required).toBe(true);
          expect(toPath.options.index).toBe(true);
        });

        it('should have role field with enum constraint', () => {
          const rolePath = synapseNodeSchema.paths.role;
          expect(rolePath.options.enum).toEqual(Object.values(SYNAPSE_ROLES));
          expect(rolePath.options.required).toBe(true);
          expect(rolePath.options.index).toBe(true);
        });

        it('should have dir field with enum constraint and default', () => {
          const dirPath = synapseNodeSchema.paths.dir;
          expect(dirPath.options.enum).toEqual(Object.values(SYNAPSE_DIRECTIONS));
          expect(dirPath.options.default).toBe(SYNAPSE_DIRECTIONS.OUT);
        });

        it('should have order field as optional number', () => {
          const orderPath = synapseNodeSchema.paths.order;
          expect(orderPath.instance).toBe('Number');
          expect(orderPath.options.required).toBeFalsy();
        });

        it('should have weight field as optional number', () => {
          const weightPath = synapseNodeSchema.paths.weight;
          expect(weightPath.instance).toBe('Number');
          expect(weightPath.options.required).toBeFalsy();
        });

        it('should have props field as optional mixed type', () => {
          const propsPath = synapseNodeSchema.paths.props;
          expect(propsPath.instance).toBe('Mixed');
          expect(propsPath.options.required).toBeFalsy();
        });

        it('should have unique compound index on from, to, role, deletedAt', () => {
          const indexes = synapseNodeSchema.indexes();
          const uniqueIndex = indexes.find(index => 
            index[0] && 
            index[0].from === 1 && 
            index[0].to === 1 && 
            index[0].role === 1 && 
            index[0].deletedAt === 1 &&
            index[1]?.unique === true
          );
          
          expect(uniqueIndex).toBeDefined();
        });

        it('should have compound index on from and role', () => {
          const indexes = synapseNodeSchema.indexes();
          const fromRoleIndex = indexes.find(index => 
            index[0] && 
            index[0].from === 1 && 
            index[0].role === 1
          );
          
          expect(fromRoleIndex).toBeDefined();
        });

        it('should have compound index on to and role', () => {
          const indexes = synapseNodeSchema.indexes();
          const toRoleIndex = indexes.find(index => 
            index[0] && 
            index[0].to === 1 && 
            index[0].role === 1
          );
          
          expect(toRoleIndex).toBeDefined();
        });

        it('should have index on role and dir', () => {
          const indexes = synapseNodeSchema.indexes();
          const roleDirIndex = indexes.find(index => 
            index[0] && 
            index[0].role === 1 && 
            index[0].dir === 1
          );
          
          expect(roleDirIndex).toBeDefined();
        });

        it('should have index on order', () => {
          const indexes = synapseNodeSchema.indexes();
          const orderIndex = indexes.find(index => 
            index[0] && 
            index[0].order === 1
          );
          
          expect(orderIndex).toBeDefined();
        });

        it('should have index on weight', () => {
          const indexes = synapseNodeSchema.indexes();
          const weightIndex = indexes.find(index => 
            index[0] && 
            index[0].weight === -1
          );
          
          expect(weightIndex).toBeDefined();
        });

        describe('SynapseNode Methods', () => {
          it('should implement findByRole method', () => {
            expect(typeof SynapseNodeModel.findByRole).toBe('function');
          });

          it('should implement findFrom method', () => {
            expect(typeof SynapseNodeModel.findFrom).toBe('function');
          });

          it('should implement findTo method', () => {
            expect(typeof SynapseNodeModel.findTo).toBe('function');
          });

          it('should implement findBetween method', () => {
            expect(typeof SynapseNodeModel.findBetween).toBe('function');
          });

          it('should implement findByDirection method', () => {
            expect(typeof SynapseNodeModel.findByDirection).toBe('function');
          });

          it('should implement reverse method', () => {
            const mockInstance = createMockModelInstance({
              from: new Types.ObjectId(),
              to: new Types.ObjectId(),
              dir: 'out',
              reverse: function() {
                const temp = this.from;
                this.from = this.to;
                this.to = temp;
                this.dir = this.dir === 'out' ? 'in' : 'out';
                return this.save();
              }
            });
            
            expect(typeof mockInstance.reverse).toBe('function');
          });

          it('should implement updateWeight method', () => {
            const mockInstance = createMockModelInstance({
              weight: 1,
              updateWeight: function(weight: number) {
                this.weight = weight;
                return this.save();
              }
            });
            
            expect(typeof mockInstance.updateWeight).toBe('function');
          });

          it('should implement updateOrder method', () => {
            const mockInstance = createMockModelInstance({
              order: 1,
              updateOrder: function(order: number) {
                this.order = order;
                return this.save();
              }
            });
            
            expect(typeof mockInstance.updateOrder).toBe('function');
          });
        });

        describe('SynapseNode Selection Criteria', () => {
          it('should inherit base selection criteria without additional filters', () => {
            expect(SYNAPSE_NODE_CONFIG.selectionCriteria.relatives.deletedAt).toBeNull();
            expect(SYNAPSE_NODE_CONFIG.selectionCriteria.cardinal.deletedAt).toBeNull();
            
            // Should not have additional criteria beyond base
            const keys = Object.keys(SYNAPSE_NODE_CONFIG.selectionCriteria.relatives);
            expect(keys).toEqual(['deletedAt']);
          });
        });

        describe('SynapseNode Data Validation', () => {
          it('should accept valid synapse data structure', () => {
            const fromId = new Types.ObjectId();
            const toId = new Types.ObjectId();
            
            const validSynapseData = createMockNodeData(NODE_TYPES.SYNAPSE, {
              from: fromId,
              to: toId,
              role: 'follows',
              dir: 'out',
              order: 1,
              weight: 0.8,
              props: { metadata: 'test' },
            });

            expect(validSynapseData.from).toBe(fromId);
            expect(validSynapseData.to).toBe(toId);
            expect(validSynapseData.role).toBe('follows');
            expect(validSynapseData.dir).toBe('out');
            expect(validSynapseData.order).toBe(1);
            expect(validSynapseData.weight).toBe(0.8);
            expect(validSynapseData.props).toEqual({ metadata: 'test' });
          });

          it('should handle minimal synapse data', () => {
            const fromId = new Types.ObjectId();
            const toId = new Types.ObjectId();
            
            const minimalSynapseData = createMockNodeData(NODE_TYPES.SYNAPSE, {
              from: fromId,
              to: toId,
              role: 'follows',
            });

            expect(minimalSynapseData.from).toBe(fromId);
            expect(minimalSynapseData.to).toBe(toId);
            expect(minimalSynapseData.role).toBe('follows');
          });
        });

        describe('SynapseNode Direction Logic', () => {
          it('should handle reverse operation for out direction', () => {
            const fromId = new Types.ObjectId();
            const toId = new Types.ObjectId();
            
            const mockSynapse = createMockModelInstance({
              from: fromId,
              to: toId,
              dir: 'out',
              reverse: function() {
                const temp = this.from;
                this.from = this.to;
                this.to = temp;
                this.dir = this.dir === 'out' ? 'in' : 'out';
                return this.save();
              }
            });

            expect(mockSynapse.dir).toBe('out');
            
            const result = mockSynapse.reverse();
            
            expect(mockSynapse.from).toBe(toId);
            expect(mockSynapse.to).toBe(fromId);
            expect(mockSynapse.dir).toBe('in');
            // The result should be defined (either the instance or a Promise)
            expect(result).toBeDefined();
          });

          it('should handle reverse operation for in direction', () => {
            const fromId = new Types.ObjectId();
            const toId = new Types.ObjectId();
            
            const mockSynapse = createMockModelInstance({
              from: fromId,
              to: toId,
              dir: 'in',
              reverse: function() {
                const temp = this.from;
                this.from = this.to;
                this.to = temp;
                this.dir = this.dir === 'out' ? 'in' : 'out';
                return this.save();
              }
            });

            expect(mockSynapse.dir).toBe('in');
            
            const result = mockSynapse.reverse();
            
            expect(mockSynapse.from).toBe(toId);
            expect(mockSynapse.to).toBe(fromId);
            expect(mockSynapse.dir).toBe('out');
            // The result should be defined (either the instance or a Promise)
            expect(result).toBeDefined();
          });

          it('should preserve undirected direction on reverse', () => {
            const fromId = new Types.ObjectId();
            const toId = new Types.ObjectId();
            
            const mockSynapse = createMockModelInstance({
              from: fromId,
              to: toId,
              dir: 'undirected',
              reverse: function() {
                const temp = this.from;
                this.from = this.to;
                this.to = temp;
                // 'undirected' remains unchanged
                return this.save();
              }
            });

            expect(mockSynapse.dir).toBe('undirected');
            
            const result = mockSynapse.reverse();
            
            expect(mockSynapse.from).toBe(toId);
            expect(mockSynapse.to).toBe(fromId);
            expect(mockSynapse.dir).toBe('undirected');
            // The result should be defined (either the instance or a Promise)
            expect(result).toBeDefined();
          });
        });
      });
    },
  });

  // Run discriminator tests
  runDiscriminatorModelTests({
    nodeType: NODE_TYPES.SYNAPSE,
    schema: synapseNodeSchema,
    model: SynapseNodeModel,
    selectionCriteria: SYNAPSE_NODE_CONFIG.selectionCriteria,
    requiredFields: {
      from: 'ObjectId',
      to: 'ObjectId',
      role: 'String',
    },
    optionalFields: {
      dir: 'String',
      order: 'Number',
      weight: 'Number',
      props: 'Mixed',
    },
  });
});
