import {
  BASE_NODE_CONFIG,
  USER_NODE_CONFIG,
  POST_NODE_CONFIG,
  SYNAPSE_NODE_CONFIG,
  NODE_TYPES
} from '@whitepine/types';

/**
 * Get viewSchema configuration for a specific node kind and field
 */
const getViewSchemaForField = (nodeKind: string, fieldKey: string) => {
  // Map node kinds to their configurations
  const nodeConfigs = {
    [NODE_TYPES.BASE]: BASE_NODE_CONFIG,
    [NODE_TYPES.USER]: USER_NODE_CONFIG,
    [NODE_TYPES.POST]: POST_NODE_CONFIG,
    [NODE_TYPES.SYNAPSE]: SYNAPSE_NODE_CONFIG
  };

  const config = nodeConfigs[nodeKind as keyof typeof nodeConfigs];
  if (!config) {
    return null;
  }

  // Type assertion to access viewSchema property
  const configWithViewSchema = config as any;
  if (!configWithViewSchema.viewSchema) {
    return null;
  }

  return configWithViewSchema.viewSchema[fieldKey] || null;
};

/**
 * Dynamic schema generator for any node type
 */
export const generateNodeSchema = (node: any, isEditing: boolean = false, mode: 'view' | 'edit' | 'create' = 'view') => {
  if (!node && mode !== 'create') return { type: 'object', properties: {} };

  const properties: Record<string, any> = {};
  const uiSchema: Record<string, any> = {};

  // Unified helper function to get field configuration from viewSchema
  const getFieldConfig = (key: string, nodeKind: string, value: any, configType: 'name' | 'description' | 'type') => {
    const viewSchema = getViewSchemaForField(nodeKind, key);
    if (viewSchema?.[configType]) {
      const configValue = viewSchema[configType];
      
      // Debug logging for content field
      if (key === 'content' && configType === 'type') {
        console.log('getFieldConfig debug:', { key, nodeKind, value, configType, configValue, viewSchema });
      }
      
      // Special handling for 'type' field - it should be a constructor, not a function
      if (configType === 'type') {
        return configValue; // Return the constructor directly (String, Date, etc.)
      }
      
      // Handle both string and callback function cases for name and description
      if (typeof configValue === 'function') {
        return configValue(value);
      } else {
        return configValue;
      }
    }
    return null;
  };

  // Helper function to format field names
  const formatFieldName = (key: string, nodeKind?: string, value?: any): string => {
    if (nodeKind) {
      const name = getFieldConfig(key, nodeKind, value, 'name');
      if (name) return name;
    }
    
    // Fallback to the original formatting logic
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  // Helper function to generate description
  const generateDescription = (key: string, value: any, nodeKind?: string): string => {
    if (nodeKind) {
      const description = getFieldConfig(key, nodeKind, value, 'description');
      if (description) return description;
    }

    return `Value for ${formatFieldName(key, nodeKind, value)}`;
  };

  // Helper function to detect data type
  const detectType = (value: any, key?: string, nodeKind?: string): { type: string; format?: string; items?: any; properties?: any } => {
    if (key && nodeKind) {
      const type = getFieldConfig(key, nodeKind, value, 'type');
      if (type) {
        // Handle JavaScript constructor types from viewSchema
        if (type === Date) {
          return { type: 'string', format: 'date-time' };
        } else if (type === String) {
          return { type: 'string' };
        } else if (type === Number) {
          return { type: 'number' };
        } else if (type === Boolean) {
          return { type: 'boolean' };
        } else if (type === Array) {
          return { type: 'array' };
        } else if (type === Object) {
          return { type: 'object' };
        } else {
          // If it's a string type name, use it directly
          return { type: typeof type === 'string' ? type : 'string' };
        }
      }
    }

    // Fallback to runtime type detection
    if (value === null || value === undefined) {
      return { type: 'string' }; // Default to string for null/undefined
    } else if (value instanceof Date) {
      return { type: 'string', format: 'date-time' };
    } else if (Array.isArray(value)) {
      return { type: 'array' };
    } else if (typeof value === 'object') {
      return { type: 'object' };
    } else if (typeof value === 'boolean') {
      return { type: 'boolean' };
    } else if (typeof value === 'number') {
      return { type: 'number' };
    } else if (typeof value === 'string') {
      return { type: 'string' };
    }

    return { type: 'string' }; // Default fallback to string instead of unknown
  };

  // Process each property in the node
  // For create mode, provide default properties if no node exists
  const safeNode = node ? { ...node } : (mode === 'create' ? { kind: 'post' } : {});
  const nodeKind = safeNode.kind || 'base';
  
  // Use Object.keys to avoid potential enumeration issues with Object.entries
  Object.keys(safeNode).forEach((key) => {
    // Skip internal MongoDB fields and any potential Next.js params-like properties
    if (key === '__v' || key === 'params' || key === 'searchParams') return;
    
    const value = safeNode[key];

    const fieldName = formatFieldName(key, nodeKind, value);
    const typeInfo = detectType(value, key, nodeKind);
    const description = generateDescription(key, value, nodeKind);

    // Determine if this field should be read-only
    const isFieldReadOnly = !isEditing || (mode !== 'create' && (key === '_id' || key === 'createdAt' || key === 'updatedAt' || key === 'deletedAt' || key === 'readOnly'));

    // Generate schema property
    properties[key] = {
      type: typeInfo.type,
      title: fieldName,
      description: description,
      readOnly: isFieldReadOnly,
      ...(typeInfo.format && { format: typeInfo.format }),
      ...(typeInfo.items && { items: typeInfo.items }),
      ...(typeInfo.properties && { properties: typeInfo.properties })
    };

    // Generate UI schema
    uiSchema[key] = {
      'ui:options': {
        'ui:readonly': isFieldReadOnly
      }
    };

    // Special handling for specific field types
    if (key === '_id' || (key === 'kind' && mode !== 'create')) {
      uiSchema[key]['ui:widget'] = 'hidden';
    } else if (typeInfo.format === 'date-time') {
      uiSchema[key]['ui:widget'] = 'datetime';
    } else if (typeInfo.type === 'boolean') {
      uiSchema[key]['ui:widget'] = 'checkbox';
    } else if (typeInfo.type === 'array') {
      uiSchema[key]['ui:widget'] = 'select';
    } else if (typeInfo.type === 'object') {
      uiSchema[key]['ui:widget'] = 'textarea';
    }
  });

  return {
    schema: {
      type: 'object',
      title: mode === 'create' ? 'Create New Node' : `${node?.kind || 'Node'} Information`,
      description: mode === 'create' ? 'Create a new node with the following properties' : `Complete information about this ${node?.kind || 'node'}`,
      properties
    },
    uiSchema
  };
};
