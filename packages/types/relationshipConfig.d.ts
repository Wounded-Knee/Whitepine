/**
 * Shared relationship configuration types
 * Used by both frontend and API for defining and validating node relationships
 */
export interface FormFieldConfig {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'email' | 'checkbox' | 'select' | 'number';
    required?: boolean;
    placeholder?: string;
    defaultValue?: any;
    validation?: {
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: string;
    };
    options?: Array<{
        value: string;
        label: string;
    }>;
}
export interface RelationshipConfig {
    id: string;
    label: string;
    description: string;
    targetNodeKind: string;
    synapseRole: string;
    synapseDirection: 'in' | 'out' | 'undirected';
    synapseProps?: Record<string, any>;
    isCommon?: boolean;
    category?: string;
    icon?: string;
    formFields?: FormFieldConfig[];
    isApplicable?: (node: any, relatives: any[]) => boolean;
}
/**
 * Utility function to combine relationship configurations from multiple sources
 */
export declare function combineRelationshipConfigs(...configs: RelationshipConfig[][]): RelationshipConfig[];
/**
 * Filter relationship configurations based on applicability
 */
export declare function filterApplicableConfigs(configs: RelationshipConfig[], node: any, relatives: any[]): RelationshipConfig[];
//# sourceMappingURL=relationshipConfig.d.ts.map