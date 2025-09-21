/**
 * Dynamic schema generator for any node type
 */
export const generateNodeSchema = (node: any, isEditing: boolean = false, mode: 'view' | 'edit' | 'create' = 'view') => {
  if (!node && mode !== 'create') return { type: 'object', properties: {} };

  const properties: Record<string, any> = {};
  const uiSchema: Record<string, any> = {};

  // Helper function to format field names
  const formatFieldName = (key: string): string => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  // Helper function to generate description
  const generateDescription = (key: string, value: any): string => {
    const commonDescriptions: Record<string, string> = {
      _id: 'Unique identifier for this node',
      kind: 'The type of node',
      createdAt: 'When this node was first created',
      updatedAt: 'When this node was last modified',
      deletedAt: 'When this node was deleted (if applicable)',
      // Note: All relationships are now handled via SynapseNode connections
      email: 'Email address',
      name: 'Display name',
      avatar: 'Profile picture URL',
      bio: 'Biography or description',
      isActive: 'Whether this node is active',
      lastLoginAt: 'When the user last logged in',
      preferences: 'User preferences and settings'
    };

    return commonDescriptions[key] || `Value for ${formatFieldName(key)}`;
  };

  // Helper function to detect data type
  const detectType = (value: any): { type: string; format?: string; items?: any; properties?: any } => {
    if (value === null || value === undefined) {
      return { type: 'string' };
    }

    if (typeof value === 'boolean') {
      return { type: 'boolean' };
    }

    if (typeof value === 'number') {
      return { type: 'number' };
    }

    if (typeof value === 'string') {
      // Check if it's a date string
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (dateRegex.test(value)) {
        return { type: 'string', format: 'date-time' };
      }
      
      // Check if it's an email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        return { type: 'string', format: 'email' };
      }
      
      // Check if it's a URL
      try {
        new URL(value);
        return { type: 'string', format: 'uri' };
      } catch {
        // Not a URL
      }
      
      return { type: 'string' };
    }

    if (Array.isArray(value)) {
      // Check if it's an array of objects
      if (value.length > 0 && typeof value[0] === 'object') {
        return { type: 'array', items: { type: 'object' } };
      }
      return { type: 'array' };
    }

    if (typeof value === 'object') {
      // Check if it's a simple object with properties
      const keys = Object.keys(value);
      if (keys.length > 0) {
        return { type: 'object', properties: keys.reduce((acc, key) => {
          acc[key] = { type: 'string' }; // Default to string for nested properties
          return acc;
        }, {} as Record<string, any>) };
      }
      return { type: 'object' };
    }

    return { type: 'string' };
  };

  // Process each property in the node
  // For create mode, provide default properties if no node exists
  const safeNode = node ? { ...node } : (mode === 'create' ? { kind: 'post' } : {});
  
  // Use Object.keys to avoid potential enumeration issues with Object.entries
  Object.keys(safeNode).forEach((key) => {
    // Skip internal MongoDB fields and any potential Next.js params-like properties
    if (key === '__v' || key === 'params' || key === 'searchParams') return;
    
    const value = safeNode[key];

    const fieldName = formatFieldName(key);
    const typeInfo = detectType(value);
    const description = generateDescription(key, value);

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
