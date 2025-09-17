/**
 * SynapseNode - Complete definition including types, validation, and relationships
 */

import type { RelationshipConfig } from '../../relationshipConfig';

// Re-export the main SynapseNode type (if it exists elsewhere)
export type { SynapseNode } from '../..';

/**
 * SynapseNode relationship configurations
 * Defines what relationships can be created from a SynapseNode
 * Note: Synapses typically don't create new relationships, but we can define
 * some organizational relationships if needed
 */
export const SYNAPSE_NODE_RELATIONSHIP_CONFIGS: RelationshipConfig[] = [
  // Synapses typically don't create new relationships
  // This is mostly for completeness and potential future use
  {
    id: 'create_related_synapse',
    label: 'Create Related Synapse',
    description: 'Create a synapse related to this one',
    targetNodeKind: 'synapse',
    synapseRole: 'related_to',
    synapseDirection: 'undirected',
    synapseProps: { type: 'related' },
    isCommon: false,
    category: 'organization',
    icon: '🔗',
    formFields: [
      {
        name: 'role',
        label: 'Synapse Role',
        type: 'text',
        required: true,
        placeholder: 'Enter the role for the new synapse'
      },
      {
        name: 'dir',
        label: 'Direction',
        type: 'select',
        required: true,
        defaultValue: 'out',
        options: [
          { value: 'in', label: 'Incoming' },
          { value: 'out', label: 'Outgoing' },
          { value: 'undirected', label: 'Undirected' }
        ]
      }
    ],
    isApplicable: (node, relatives) => {
      // Only show for synapse nodes
      return node?.kind === 'synapse';
    }
  }
];

/**
 * Get all relationship configurations for SynapseNode
 */
export function getSynapseNodeRelationshipConfigs(): RelationshipConfig[] {
  return SYNAPSE_NODE_RELATIONSHIP_CONFIGS;
}

/**
 * Validate if a relationship creation request is valid for SynapseNode
 */
export function validateSynapseNodeRelationship(
  nodeKind: string,
  synapseRole: string,
  synapseDirection: string
): { valid: boolean; error?: string } {
  const config = SYNAPSE_NODE_RELATIONSHIP_CONFIGS.find(
    c => c.targetNodeKind === nodeKind && 
         c.synapseRole === synapseRole && 
         c.synapseDirection === synapseDirection
  );
  
  if (!config) {
    return {
      valid: false,
      error: `Invalid relationship: ${nodeKind} with role '${synapseRole}' and direction '${synapseDirection}' is not allowed for SynapseNode`
    };
  }
  
  return { valid: true };
}
