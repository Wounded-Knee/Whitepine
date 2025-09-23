import {
  BASE_NODE_CONFIG,
  USER_NODE_CONFIG,
  POST_NODE_CONFIG,
  SYNAPSE_NODE_CONFIG
} from '@whitepine/types';

/**
 * Get viewSchema configuration for a specific node kind and field
 */
const getViewSchemaForField = (nodeKind: string, fieldKey: string) => {
  // Map node kinds to their configurations
  const nodeConfigs = {
    'base': BASE_NODE_CONFIG,
    'User': USER_NODE_CONFIG,
    'post': POST_NODE_CONFIG,
    'synapse': SYNAPSE_NODE_CONFIG
  };

  const config = nodeConfigs[nodeKind as keyof typeof nodeConfigs];
  if (!config?.handlers) {
    return null;
  }

  // Type assertion to access viewSchema property
  const handlers = config.handlers as any;
  if (!handlers.viewSchema) {
    return null;
  }

  return handlers.viewSchema[fieldKey] || null;
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
      // Handle both string and callback function cases
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
      if (type) return { type };
    }

    return { type: 'unknown' };
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
