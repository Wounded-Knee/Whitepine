/**
 * Node Type Discriminator Constants
 *
 * Centralized constants for all node type discriminator strings used throughout
 * the Whitepine application. This ensures consistency and makes it easy to
 * maintain node type definitions across the web and API apps.
 */
/**
 * The discriminator key used for all node types
 */
export declare const DISCRIMINATOR_KEY: "kind";
/**
 * Node type discriminator strings
 */
export declare const NODE_TYPES: {
    readonly USER: "User";
    readonly POST: "post";
    readonly SYNAPSE: "synapse";
};
/**
 * Type for all valid node type discriminator strings
 */
export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];
/**
 * Array of all node type discriminator strings
 */
export declare const NODE_TYPE_VALUES: ("User" | "post" | "synapse")[];
/**
 * Type guard to check if a string is a valid node type
 */
export declare function isNodeType(value: string): value is NodeType;
/**
 * Registry of node type to model name mapping (for API usage)
 */
export declare const NODE_TYPE_MODEL_MAP: {
    readonly User: "User";
    readonly post: "post";
    readonly synapse: "synapse";
};
//# sourceMappingURL=nodeTypes.d.ts.map