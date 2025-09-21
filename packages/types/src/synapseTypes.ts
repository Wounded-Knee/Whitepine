/**
 * Synapse direction types
 */
export const SYNAPSE_DIRECTIONS = {
  OUT: 'out',
  IN: 'in',
  UNDIRECTED: 'undirected'
} as const;

type SynapseDirection = typeof SYNAPSE_DIRECTIONS[keyof typeof SYNAPSE_DIRECTIONS];

/**
 * Common synapse roles
 * These represent the types of relationships between nodes
 */
export const SYNAPSE_ROLES = {
  // Content relationships
  AUTHOR: 'author',
  TAGGED: 'tagged',
  PARENT: 'parent',
  CHILD: 'child',
  RELATED: 'related',
  
  // Social relationships
  FOLLOWS: 'follows',
  FRIENDS: 'friends',
  COLLABORATES: 'collaborates',
  
  // Organizational relationships
  MEMBER: 'member',
  ADMIN: 'admin',
  OWNER: 'owner',
  
  // Content organization
  CATEGORY: 'category',
  TOPIC: 'topic',
  SERIES: 'series',
  
  // Custom relationships
  CUSTOM: 'custom'
} as const;

export type SynapseRole = typeof SYNAPSE_ROLES[keyof typeof SYNAPSE_ROLES];

