import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@web/components/ui/collapsible';
import { Button } from '@web/components/ui/button';
import { ChevronsUpDown, Info, Check, X } from 'lucide-react';
import {
  BASE_NODE_CONFIG,
  USER_NODE_CONFIG,
  POST_NODE_CONFIG,
  SYNAPSE_NODE_CONFIG
} from '@whitepine/types';

const FIELD_TYPES = {
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  STRING: 'string',
  ARRAY: 'array',
  OBJECT: 'object',
};

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

  const nodeConfig = nodeConfigs[nodeKind as keyof typeof nodeConfigs] as any;

  if (!nodeConfig || !nodeConfig.viewSchema) return null;

  return nodeConfig.viewSchema[fieldKey] || null;
};

/**
 * Utility function to handle focus events and update field container styling
 */
const handleFieldFocus = (event: React.FocusEvent<HTMLElement>, isFocused: boolean) => {
  const target = event.target as HTMLElement;
  const fieldContainer = target.closest('.field') as HTMLElement;
  
  if (fieldContainer) {
    if (isFocused) {
      fieldContainer.classList.add('field-focused');
    } else {
      fieldContainer.classList.remove('field-focused');
    }
  }
};

const InputWrapper = ({ children, props }: { children: React.ReactNode, props: any }) => {
  // Helper function to get transformed value using viewSchema callback
  const getTransformedValue = (fieldKey: string, value: any, nodeKind?: string) => {
    if (!nodeKind) return value;
    
    const viewSchema = getViewSchemaForField(nodeKind, fieldKey);
    if (viewSchema?.value && typeof viewSchema.value === 'function') {
      return viewSchema.value(value);
    }
    return value;
  };

  // Try to get node kind from formData or schema
  const nodeKind = props.formData?.kind || props.schema?.properties?.kind?.default || 'base';
  
  return props.readOnly ? getTransformedValue(props.name, props.value, nodeKind) : children;
};

/**
 * Custom ObjectFieldTemplate for collapsible nested objects
 */
export const CollapsibleObjectFieldTemplate = (props: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Don't make the root object collapsible, only nested objects
  if (!props.idSchema || props.idSchema.$id === 'root') {
    return (
      <div className="space-y-4">
        {props.properties.map((element: any) => element.content)}
      </div>
    );
  }

  const hasNestedContent = props.properties && props.properties.length > 0;
  const title = props.title || 'Object';
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4 xyzzy">
        <CollapsibleTrigger asChild className="px-0">
          <Button 
            variant="ghost" 
            className="w-full justify-between h-auto border-none hover:bg-gray-50"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium text-gray-900">{title}</span>
              {hasNestedContent && (
                <span className="text-xs text-gray-500 mt-1">
                  {props.properties.length} {props.properties.length === 1 ? 'property' : 'properties'}
                </span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
          </Button>
        </CollapsibleTrigger>
        {hasNestedContent && (
          <CollapsibleContent className="px-0 pb-3">
            <div className="space-y-3 pt-2 border-t border-gray-100">
              {props.properties.map((element: any) => element.content)}
            </div>
          </CollapsibleContent>
        )}
    </Collapsible>
  );
};

/**
 * Custom FieldTemplate for better styling and layout
 */
export const CustomFieldTemplate = (props: any) => {
  const {
    id,
    classNames,
    style,
    disabled,
    readonly,
    label,
    help,
    required,
    description,
    errors,
    children,
    hidden,
    displayLabel,
    schema,
    uiSchema
  } = props;

  if (hidden) {
    return <div style={{ display: 'none' }}>{children}</div>;
  }

  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  const fieldType = schema?.type;
  const isRequired = required || schema?.required?.includes(props.name);

  return (
    <div 
      className={`field field-${fieldType} ${classNames || ''} ${isReadOnly ? 'read-only' : ''}`} 
      style={style}
      data-field-id={id}
    >
      {displayLabel && label && (
        <div className="field-label mb-2 flex items-center gap-4">
          <label 
            htmlFor={id} 
            className={`text-sm font-medium text-gray-700 ${isRequired ? 'required' : ''}`}
          >
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="h-3 w-3" />
              {description}
            </div>
          )}
        </div>
      )}

      <div className="field-content">
        {children}
      </div>

      {help && (
        <div className="field-help text-xs text-gray-500 mt-1">
          {help}
        </div>
      )}

      {errors && errors.length > 0 && (
        <div className="field-errors mt-1">
          {errors.map((error: string, index: number) => (
            <div key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Custom TextWidget for better text input styling
 */
export const CustomTextWidget = (props: any) => {
  const { value, onChange, placeholder, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <input
        type="text"
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => handleFieldFocus(e, true)}
        onBlur={(e) => handleFieldFocus(e, false)}
        placeholder={placeholder}
        disabled={disabled || isReadOnly}
        readOnly={isReadOnly}
      />
    </InputWrapper>
  );
};

/**
 * Custom TextareaWidget for better textarea styling
 */
export const CustomTextareaWidget = (props: any) => {
  const { value, onChange, placeholder, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  const rows = uiSchema?.['ui:options']?.rows || 4;
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <textarea
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
          isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => handleFieldFocus(e, true)}
        onBlur={(e) => handleFieldFocus(e, false)}
        placeholder={placeholder}
        disabled={disabled || isReadOnly}
        readOnly={isReadOnly}
        rows={rows}
      />
    </InputWrapper>
  );
};

/**
 * Custom NumberWidget for better number input styling
 */
export const CustomNumberWidget = (props: any) => {
  const { value, onChange, placeholder, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <input
        type="number"
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        onFocus={(e) => handleFieldFocus(e, true)}
        onBlur={(e) => handleFieldFocus(e, false)}
        placeholder={placeholder}
        disabled={disabled || isReadOnly}
        readOnly={isReadOnly}
        min={schema?.minimum}
        max={schema?.maximum}
        step={schema?.multipleOf || 1}
      />
    </InputWrapper>
  );
};

/**
 * Custom CheckboxWidget for better checkbox styling
 */
export const CustomCheckboxWidget = (props: any) => {
  const { value, onChange, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
            isReadOnly ? 'cursor-not-allowed opacity-50' : ''
          }`}
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          onFocus={(e) => handleFieldFocus(e, true)}
          onBlur={(e) => handleFieldFocus(e, false)}
          disabled={disabled || isReadOnly}
          readOnly={isReadOnly}
        />
        <span className={`text-sm ${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>
          {schema?.title || 'Enable'}
        </span>
      </div>
    </InputWrapper>
  );
};

/**
 * Custom SelectWidget for better select styling
 */
export const CustomSelectWidget = (props: any) => {
  const { value, onChange, options, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  const { enumOptions } = options;
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => handleFieldFocus(e, true)}
        onBlur={(e) => handleFieldFocus(e, false)}
        disabled={disabled || isReadOnly}
      >
        <option value="">Select an option...</option>
        {enumOptions?.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </InputWrapper>
  );
};

/**
 * Custom RadioWidget for better radio button styling
 */
export const CustomRadioWidget = (props: any) => {
  const { value, onChange, options, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  const { enumOptions } = options;
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <div className="space-y-2">
        {enumOptions?.map((option: any) => (
          <div key={option.value} className="flex items-center space-x-2">
            <input
              type="radio"
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                isReadOnly ? 'cursor-not-allowed opacity-50' : ''
              }`}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              onFocus={(e) => handleFieldFocus(e, true)}
              onBlur={(e) => handleFieldFocus(e, false)}
              disabled={disabled || isReadOnly}
              readOnly={isReadOnly}
            />
            <span className={`text-sm ${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>
              {option.label}
            </span>
          </div>
        ))}
      </div>
    </InputWrapper>
  );
};

/**
 * Custom DateWidget for better date input styling
 */
export const CustomDateWidget = (props: any) => {
  const { value, onChange, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <input
        type="date"
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => handleFieldFocus(e, true)}
        onBlur={(e) => handleFieldFocus(e, false)}
        disabled={disabled || isReadOnly}
        readOnly={isReadOnly}
      />
    </InputWrapper>
  );
};

/**
 * Custom DateTimeWidget for better datetime input styling
 */
export const CustomDateTimeWidget = (props: any) => {
  const { value, onChange, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <input
        type="datetime-local"
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => handleFieldFocus(e, true)}
        onBlur={(e) => handleFieldFocus(e, false)}
        disabled={disabled || isReadOnly}
        readOnly={isReadOnly}
      />
    </InputWrapper>
  );
};

/**
 * Custom EmailWidget for better email input styling
 */
export const CustomEmailWidget = (props: any) => {
  const { value, onChange, placeholder, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <input
        type="email"
        className={`w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => handleFieldFocus(e, true)}
        onBlur={(e) => handleFieldFocus(e, false)}
        placeholder={placeholder || 'Enter email address'}
        disabled={disabled || isReadOnly}
        readOnly={isReadOnly}
      />
    </InputWrapper>
  );
};

/**
 * Custom URLWidget for better URL input styling
 */
export const CustomURLWidget = (props: any) => {
  const { value, onChange, placeholder, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <input
        type="url"
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => handleFieldFocus(e, true)}
        onBlur={(e) => handleFieldFocus(e, false)}
        placeholder={placeholder || 'Enter URL'}
        disabled={disabled || isReadOnly}
        readOnly={isReadOnly}
      />
    </InputWrapper>
  );
};

/**
 * Custom PasswordWidget for better password input styling
 */
export const CustomPasswordWidget = (props: any) => {
  const { value, onChange, placeholder, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <input
        type="password"
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => handleFieldFocus(e, true)}
        onBlur={(e) => handleFieldFocus(e, false)}
        placeholder={placeholder || 'Enter password'}
        disabled={disabled || isReadOnly}
        readOnly={isReadOnly}
      />
    </InputWrapper>
  );
};

/**
 * Custom UnknownWidget for handling unknown field types
 */
export const CustomUnknownWidget = (props: any) => {
  const { value, onChange, disabled, readonly, schema, uiSchema } = props;
  const isReadOnly = readonly || uiSchema?.['ui:readonly'];
  
  return (
    <InputWrapper props={{...props, readOnly: isReadOnly}}>
      <div className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
        isReadOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {isReadOnly ? (value ? String(value) : 'No value') : 'Unknown field type'}
          </span>
          {!isReadOnly && (
            <input
              type="text"
              className="flex-1 ml-2 border-none outline-none bg-transparent"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter value..."
              disabled={disabled}
            />
          )}
        </div>
      </div>
    </InputWrapper>
  );
};
