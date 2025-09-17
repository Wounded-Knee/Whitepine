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
  options?: Array<{ value: string; label: string }>; // For select fields
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
export function combineRelationshipConfigs(...configs: RelationshipConfig[][]): RelationshipConfig[] {
  return configs.flat();
}

/**
 * Filter relationship configurations based on applicability
 */
export function filterApplicableConfigs(
  configs: RelationshipConfig[], 
  node: any, 
  relatives: any[]
): RelationshipConfig[] {
  return configs.filter(config => {
    if (!config.isApplicable) return true;
    try {
      return config.isApplicable(node, relatives);
    } catch (error) {
      // Silently handle errors in applicability checks
      return false;
    }
  });
}
