import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';
import { fetchNodeById } from '@web/store/slices/nodesSlice';
import { useApiRequest } from './useApiRequest';
import type { UseApiRequestResult } from './useApiRequest';
import type { BaseNode } from '@whitepine/types/client';
import { NODE_TYPES } from '@whitepine/types/client';
import type { NodeViewMode } from '@web/components/NodeView/types/BaseNodeView.types';

interface RelativesSelector {
  // Synaptic selectors
  synaptic?: {
    role?: string | '*';
    dir?: 'in' | 'out' | 'undirected' | '*';
  };
  // Attribute selectors
  attribute?: string;
  // Node type selectors
  kind?: string | '*';
  // Relationship type selectors
  relationshipType?: 'synaptic' | 'attribute' | '*';
  // Custom filter function
  filter?: (relative: any) => boolean;
}

interface UseNodeRequestResult extends Omit<UseApiRequestResult<BaseNode>, 'data' | 'refetch'> {
  node: BaseNode | null;
  relatives: any[];
  relativesByRole: Record<string, Record<string, string[]>> | null;
  getRelatives: (selector: RelativesSelector) => any[];
  fetchNode: () => Promise<void>;
}

/**
 * Custom hook for managing node requests with built-in deduplication
 * This prevents multiple components from making the same API request
 */
export function useNodeRequest(nodeId: string | undefined, mode: NodeViewMode = 'view'): UseNodeRequestResult {
  const dispatch = useAppDispatch();
  
  // Use the generic API request hook for basic request management (only if not in create mode)
  const { data: node, refetch } = useApiRequest(
    'nodes',
    nodeId || '',
    {
      fetchAction: async (id) => {
        // This won't be called since we use dispatchAction
        throw new Error('fetchAction should not be called when dispatchAction is provided');
      },
      selector: (state, id) => state.nodes.byId[id] || null,
      dispatchAction: (id) => fetchNodeById(id),
      enableCache: true,
      enabled: mode !== 'create' && !!nodeId // Don't fetch in create mode
    }
  );
  
  // Get loading and error state from Redux (node-specific)
  const isLoading = useAppSelector((state) => {
    if (mode === 'create' || !nodeId) return false;
    return state.nodes.loading?.operations?.[`fetchNodeById-${nodeId}`] || false;
  });
  
  const error = useAppSelector((state) => {
    if (mode === 'create' || !nodeId) return null;
    return state.nodes.error?.[`fetchNodeById-${nodeId}`] || null;
  });
  
  // Get all nodes from Redux store to compute relationships
  const allNodes = useAppSelector((state) => state.nodes.byId);
  
  // Get relativesByRole data from Redux store
  const relativesByRole = useAppSelector((state) => state.nodes.relativesByRole?.[nodeId] || null);
  
  // Get the count of nodes to ensure relatives computation re-runs when nodes are added
  const nodeCount = useAppSelector((state) => Object.keys(state.nodes.byId).length);
  
  // Get a more specific selector that tracks when relatives might be available
  const hasRelatives = useAppSelector((state) => {
    const nodes = state.nodes.byId;
    const mainNode = nodes[nodeId];
    if (!mainNode) return false;
    
    // Check if there are any other nodes that could be relatives
    const otherNodes = Object.values(nodes).filter(node => node._id.toString() !== nodeId);
    return otherNodes.length > 0;
  });
  
  const fetchNode = useCallback(async () => {
    if (mode === 'create' || !nodeId) return;
    await refetch();
  }, [refetch, mode, nodeId]);
  
  // Get relatives from the API response (stored in Redux)
  const relatives = useMemo(() => {
    if (!node || !allNodes || mode === 'create') return [];
    
    // Check if we have any nodes that could be relatives (excluding the main node)
    const potentialRelatives = Object.values(allNodes).filter(otherNode => 
      otherNode._id.toString() !== nodeId
    );
    
    const relatedNodes: any[] = [];
    const seenNodeIds = new Set<string>();
    
    // Get all nodes that are not the main node (including synapses)
    // These are the relatives returned by the API
    Object.values(allNodes).forEach(otherNode => {
      if (otherNode._id.toString() !== nodeId) {
        if (!seenNodeIds.has(otherNode._id.toString())) {
          seenNodeIds.add(otherNode._id.toString());
          
          // Determine relationship type
          let relationshipType = 'unknown';
          let attribute = null;
          let direction = null;
          let synapse = null;
          
          // If this is a synapse, it's a synaptic relationship
          if (otherNode.kind === NODE_TYPES.SYNAPSE) {
            relationshipType = 'synaptic';
            synapse = otherNode;
            
            // Determine direction based on synapse direction
            const synapseData = otherNode as any;
            if (synapseData.from && synapseData.from.toString() === nodeId) {
              direction = 'outgoing';
            } else if (synapseData.to && synapseData.to.toString() === nodeId) {
              direction = 'incoming';
            } else {
              direction = 'undirected';
            }
          } else {
            // For non-synapse nodes, check if they're referenced by attributes
            const extractObjectIds = (obj: any, path: string = '') => {
              if (obj && typeof obj === 'object') {
                if (Array.isArray(obj)) {
                  obj.forEach((item, index) => extractObjectIds(item, `${path}[${index}]`));
                } else {
                  Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    if (value && typeof value === 'object' && value.toString && value.toString() === otherNode._id.toString()) {
                      relationshipType = 'attribute';
                      attribute = key;
                    } else {
                      extractObjectIds(value, path ? `${path}.${key}` : key);
                    }
                  });
                }
              }
            };
            
            extractObjectIds(node);
            
            // If not found as attribute reference, check if it's connected via synapse
            if (relationshipType === 'unknown') {
              Object.values(allNodes).forEach(synapseNode => {
                if (synapseNode.kind === NODE_TYPES.SYNAPSE) {
                  const synapseData = synapseNode as any;
                  if ((synapseData.from && synapseData.from.toString() === nodeId && synapseData.to.toString() === otherNode._id.toString()) ||
                      (synapseData.to && synapseData.to.toString() === nodeId && synapseData.from.toString() === otherNode._id.toString())) {
                    relationshipType = 'synaptic';
                    synapse = synapseNode;
                    
                    // Determine direction
                    if (synapseData.from && synapseData.from.toString() === nodeId) {
                      direction = 'outgoing';
                    } else {
                      direction = 'incoming';
                    }
                  }
                }
              });
            }
          }
          
          relatedNodes.push({
            ...otherNode,
            _relationshipType: relationshipType,
            _attribute: attribute,
            _direction: direction,
            _synapse: synapse
          });
        }
      }
    });
    
    return relatedNodes;
  }, [node, allNodes, nodeId, nodeCount, hasRelatives, mode, Object.keys(allNodes).length]);

  // getRelatives function implementation
  const getRelatives = useCallback((selector: RelativesSelector): any[] => {
    if (!relatives || relatives.length === 0 || mode === 'create') {
      return [];
    }
    
    return relatives.filter(relative => {
      // Custom filter function takes precedence
      if (selector.filter) {
        return selector.filter(relative);
      }
      
      // Synaptic filtering
      if (selector.synaptic) {
        if (relative._relationshipType !== 'synaptic') {
          return false; // Not a synaptic connection
        }
        
        const { role, dir } = selector.synaptic;
        const synapse = relative._synapse;
        
        // Role filtering
        if (role && role !== '*') {
          if (synapse.role !== role) {
            return false;
          }
        }
        
        // Direction filtering - map our internal direction to synapse direction
        if (dir && dir !== '*') {
          if (dir === 'in' && relative._direction !== 'incoming') {
            return false;
          }
          if (dir === 'out' && relative._direction !== 'outgoing') {
            return false;
          }
          if (dir === 'undirected' && synapse.dir !== 'undirected') {
            return false;
          }
        }
        
        return true;
      }
      
      // Attribute filtering
      if (selector.attribute) {
        if (relative._relationshipType !== 'attribute') {
          return false;
        }
        return relative._attribute === selector.attribute;
      }
      
      // Kind filtering
      if (selector.kind && selector.kind !== '*') {
        return relative.kind === selector.kind;
      }
      
      // Relationship type filtering
      if (selector.relationshipType && selector.relationshipType !== '*') {
        return relative._relationshipType === selector.relationshipType;
      }
      
      // If no specific selector, return all
      return true;
    });
  }, [relatives, mode]);
  
  return {
    node,
    relatives,
    relativesByRole,
    getRelatives,
    isLoading,
    error,
    fetchNode,
    isCached: node !== null
  };
}
