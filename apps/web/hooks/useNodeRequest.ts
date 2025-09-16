import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';
import { fetchNodeById } from '@web/store/slices/nodesSlice';
import { requestManager } from '@web/lib/requestManager';
import type { BaseNode } from '@whitepine/types';

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

interface UseNodeRequestResult {
  node: BaseNode | null;
  relatives: any[];
  getRelatives: (selector: RelativesSelector) => any[];
  isLoading: boolean;
  error: string | null;
  fetchNode: () => Promise<void>;
}

/**
 * Custom hook for managing node requests with built-in deduplication
 * This prevents multiple components from making the same API request
 */
export function useNodeRequest(nodeId: string): UseNodeRequestResult {
  const dispatch = useAppDispatch();
  const node = useAppSelector((state) => state.nodes.byId[nodeId] || null);
  
  // Get all nodes from Redux store to compute relationships
  const allNodes = useAppSelector((state) => state.nodes.byId);
  
  const fetchNode = useCallback(async () => {
    // If node already exists, don't fetch
    if (node) {
      return;
    }
    
    const requestKey = `fetchNodeById-${nodeId}`;
    
    // If request is already ongoing, return the existing promise
    if (requestManager.isRequestOngoing(requestKey)) {
      const existingPromise = requestManager.getExistingPromise(requestKey);
      if (existingPromise) {
        return existingPromise;
      }
    }
    
    // Start a new request and track it globally
    const promise = dispatch(fetchNodeById(nodeId)).unwrap();
    return requestManager.startRequest(requestKey, promise);
  }, [dispatch, nodeId, node]);
  
  // Get loading state from Redux
  const isLoading = useAppSelector((state) => {
    // Check if this specific node fetch is pending
    return state.nodes.loading?.operations?.[`fetchNodeById-${nodeId}`] || false;
  });
  
  // Get error state from Redux
  const error = useAppSelector((state) => {
    // Check if there's an error for this specific node
    return state.nodes.error?.[`fetchNodeById-${nodeId}`] || null;
  });
  
  // Get relatives from the API response (stored in Redux)
  const relatives = useMemo(() => {
    if (!node || !allNodes) return [];
    
    const relatedNodes: any[] = [];
    const seenNodeIds = new Set<string>();
    
    // Get all nodes that are not the main node and not synapses
    // These are the relatives returned by the API
    Object.values(allNodes).forEach(otherNode => {
      if (otherNode._id.toString() !== nodeId && otherNode.kind !== 'synapse') {
        if (!seenNodeIds.has(otherNode._id.toString())) {
          seenNodeIds.add(otherNode._id.toString());
          
          // Determine relationship type by checking if it's referenced in the main node
          let relationshipType = 'unknown';
          let attribute = null;
          
          // Check if this node is referenced by an attribute in the main node
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
              if (synapseNode.kind === 'synapse') {
                const synapse = synapseNode as any;
                if ((synapse.from && synapse.from.toString() === nodeId && synapse.to.toString() === otherNode._id.toString()) ||
                    (synapse.to && synapse.to.toString() === nodeId && synapse.from.toString() === otherNode._id.toString())) {
                  relationshipType = 'synaptic';
                }
              }
            });
          }
          
          relatedNodes.push({
            ...otherNode,
            _relationshipType: relationshipType,
            _attribute: attribute,
            _synapse: relationshipType === 'synaptic' ? 
              Object.values(allNodes).find(n => n.kind === 'synapse' && 
                ((n as any).from?.toString() === nodeId && (n as any).to?.toString() === otherNode._id.toString()) ||
                ((n as any).to?.toString() === nodeId && (n as any).from?.toString() === otherNode._id.toString())
              ) : undefined
          });
        }
      }
    });
    
    return relatedNodes;
  }, [node, allNodes, nodeId]);

  // getRelatives function implementation
  const getRelatives = useCallback((selector: RelativesSelector): any[] => {
    if (!relatives || relatives.length === 0) {
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
  }, [relatives]);
  
  return {
    node,
    relatives,
    getRelatives,
    isLoading,
    error,
    fetchNode
  };
}
