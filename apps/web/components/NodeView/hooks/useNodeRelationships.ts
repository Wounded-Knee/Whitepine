import React from 'react';
import type { BaseNode } from '@whitepine/types';
import { 
  combineRelationshipConfigs, 
  filterApplicableConfigs,
  type RelationshipConfig 
} from '@whitepine/types';
import { POST_NODE_RELATIONSHIP_CONFIGS, USER_NODE_RELATIONSHIP_CONFIGS } from '@whitepine/types';

export const useNodeRelationships = (node: BaseNode | null, relatives: any[]) => {
  // Determine relationship configurations based on node type and context
  const relationshipConfigs = React.useMemo(() => {
    if (!node) return [];

    // Get base configurations
    let nodeTypeConfigs: RelationshipConfig[] = [];
    
    // Add node-type-specific configurations
    switch (node.kind) {
      case 'post':
        nodeTypeConfigs = POST_NODE_RELATIONSHIP_CONFIGS;
        break;
      case 'user':
        nodeTypeConfigs = USER_NODE_RELATIONSHIP_CONFIGS;
        break;
      default:
        nodeTypeConfigs = [];
    }

    // Combine all configurations
    const allConfigs = combineRelationshipConfigs(
      nodeTypeConfigs
    );

    // Filter based on applicability
    return filterApplicableConfigs(allConfigs, node, relatives);
  }, [node, relatives]);

  return {
    relationshipConfigs
  };
};
