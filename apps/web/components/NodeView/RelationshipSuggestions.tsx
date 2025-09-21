'use client';

import React, { useState } from 'react';
import { Button } from '@web/components/ui/button';
import { Plus, MessageSquare, User, FileText, Link } from 'lucide-react';
import { NODE_TYPES } from '@whitepine/types/client';
import type { BaseNode } from '@whitepine/types/client';
import type { RelationshipConfig } from '@whitepine/types/client';

export interface RelationshipSuggestion {
  id: string;
  type: 'reply' | 'mention' | 'reference' | 'follow' | 'like' | 'custom';
  label: string;
  description: string;
  icon: React.ReactNode;
  targetNodeKind: string;
  synapseRole: string;
  synapseDirection: 'out' | 'in' | 'undirected';
  synapseProps?: Record<string, any>;
  formFields?: any[]; // Include form fields from the relationship configuration
}

export interface RelationshipSuggestionsProps {
  node: BaseNode;
  relationshipConfigs: RelationshipConfig[];
  onCreateRelationship: (suggestion: RelationshipSuggestion) => void;
  className?: string;
}

/**
 * Component that suggests potential relationships for a node
 * and allows users to create related nodes with synapses
 */
export const RelationshipSuggestions: React.FC<RelationshipSuggestionsProps> = ({
  node,
  relationshipConfigs,
  onCreateRelationship,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert relationship configurations to suggestions
  const suggestions: RelationshipSuggestion[] = relationshipConfigs.map(config => ({
    id: config.id,
    type: config.category === 'communication' ? 'reply' : 
          config.category === 'social' ? 'follow' : 
          config.category === 'content' ? 'reference' : 'custom',
    label: config.label,
    description: config.description,
    icon: config.icon ? <span className="text-lg">{config.icon}</span> : <Plus className="w-4 h-4" />,
    targetNodeKind: config.targetNodeKind,
    synapseRole: config.synapseRole,
    synapseDirection: config.synapseDirection,
    synapseProps: config.synapseProps,
    formFields: config.formFields // Include form fields from the configuration
  }));

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`border-t border-gray-200 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-start text-gray-600 hover:text-gray-900"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Related Node
        {isExpanded ? ' (Hide)' : ` (${suggestions.length} options)`}
      </Button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-gray-600">
                  {suggestion.icon}
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {suggestion.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {suggestion.description}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onCreateRelationship(suggestion)}
                className="ml-2"
              >
                Create
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelationshipSuggestions;
