/**
 * Synapse direction types
 */
export declare const SYNAPSE_DIRECTIONS: {
    readonly OUT: "out";
    readonly IN: "in";
    readonly UNDIRECTED: "undirected";
};
/**
 * Common synapse roles
 * These represent the types of relationships between nodes
 */
export declare const SYNAPSE_ROLES: {
    readonly AUTHOR: "author";
    readonly TAGGED: "tagged";
    readonly PARENT: "parent";
    readonly CHILD: "child";
    readonly RELATED: "related";
    readonly FOLLOWS: "follows";
    readonly FRIENDS: "friends";
    readonly COLLABORATES: "collaborates";
    readonly MEMBER: "member";
    readonly ADMIN: "admin";
    readonly OWNER: "owner";
    readonly CATEGORY: "category";
    readonly TOPIC: "topic";
    readonly SERIES: "series";
    readonly CUSTOM: "custom";
};
export type SynapseRole = typeof SYNAPSE_ROLES[keyof typeof SYNAPSE_ROLES];
/**
 * All valid synapse directions as an array
 */
export declare const SYNAPSE_DIRECTION_VALUES: ("out" | "in" | "undirected")[];
/**
 * All valid synapse roles as an array
 */
export declare const SYNAPSE_ROLE_VALUES: ("author" | "tagged" | "parent" | "child" | "related" | "follows" | "friends" | "collaborates" | "member" | "admin" | "owner" | "category" | "topic" | "series" | "custom")[];
//# sourceMappingURL=synapseTypes.d.ts.map