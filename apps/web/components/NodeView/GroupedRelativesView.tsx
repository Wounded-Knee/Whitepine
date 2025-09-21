'use client';

import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@web/components/ui/collapsible';
import { Button } from '@web/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { RelativeNodeView } from './RelativeNodeView';

interface GroupedRelativesViewProps {
  relatives: any[];
  relativesByRole?: Record<string, Record<string, string[]>>;
  renderNodeId: (nodeId: string | any, className?: string) => React.ReactNode;
}

/**
 * Component that groups relatives by their synaptic role using collapsible containers
 * Each group shows a summary of its contents and is collapsible
 */
export const GroupedRelativesView: React.FC<GroupedRelativesViewProps> = ({
  relatives,
  relativesByRole,
  renderNodeId
}) => {
  // Debug: Log the relatives data structure
  console.log('GroupedRelativesView - relatives data:', relatives);
  console.log('GroupedRelativesView - relativesByRole data:', relativesByRole);
  
  // Create a lookup map for relatives by ID for quick access
  const relativesById = relatives.reduce((acc, relative) => {
    const id = relative._id?.toString();
    if (id) {
      acc[id] = relative;
    }
    return acc;
  }, {} as Record<string, any>);

  // If no relatives, show empty state
  if (relatives.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No related nodes found.
      </div>
    );
  }

  // If we have relativesByRole data, use it for proper grouping
  if (relativesByRole && Object.keys(relativesByRole).length > 0) {
    return (
      <div className="space-y-3">
        {Object.entries(relativesByRole).map(([role, directions]) => (
          <RoleGroup
            key={role}
            role={role}
            directions={directions}
            relativesById={relativesById}
            renderNodeId={renderNodeId}
          />
        ))}
      </div>
    );
  }

  // Fallback: Group by synaptic role from relatives data
  const relativesByRoleFallback = relatives.reduce((acc, relative) => {
    let role = 'unknown';
    
    if (relative.kind === 'synapse') {
      role = relative.role || 'unknown';
    } else {
      role = relative.role || relative._role || 'connected';
    }
    
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(relative);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-3">
      {Object.entries(relativesByRoleFallback).map(([role, roleRelatives]) => (
        <FallbackRoleGroup
          key={role}
          role={role}
          relatives={roleRelatives as any[]}
          renderNodeId={renderNodeId}
        />
      ))}
    </div>
  );
};

/**
 * Component for a single role group with direction-based sub-grouping
 */
const RoleGroup: React.FC<{
  role: string;
  directions: Record<string, string[]>;
  relativesById: Record<string, any>;
  renderNodeId: (nodeId: string | any, className?: string) => React.ReactNode;
}> = ({ role, directions, relativesById, renderNodeId }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Calculate total nodes across all directions
  const totalNodes = Object.values(directions).reduce((sum, nodeIds) => sum + nodeIds.length, 0);
  const directionCounts = Object.entries(directions).map(([dir, nodeIds]) => ({
    direction: dir,
    count: nodeIds.length
  }));

  // Create summary text
  const summaryText = directionCounts
    .filter(d => d.count > 0)
    .map(d => `${d.count} ${d.direction}`)
    .join(', ');

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between h-auto border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
        >
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 capitalize">
                {role.replace(/_/g, ' ')}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {totalNodes} {totalNodes === 1 ? 'node' : 'nodes'}
              </span>
            </div>
            <span className="text-sm text-gray-500 mt-1">
              {summaryText}
            </span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2">
        <div className="space-y-3 pl-4 border-l-2 border-gray-100">
          {Object.entries(directions).map(([direction, nodeIds]) => {
            if (nodeIds.length === 0) return null;
            
            return (
              <div key={direction} className="space-y-2">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {direction} ({nodeIds.length})
                </div>
                <div className="space-y-2">
                  {nodeIds.map((nodeId) => {
                    const relative = relativesById[nodeId];
                    if (!relative) return null;
                    
                    return (
                      <div key={nodeId} className="bg-white border border-gray-200 rounded-lg p-3">
                        <RelativeNodeView 
                          relative={relative} 
                          compact={false}
                          showRelationshipInfo={false}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

/**
 * Fallback component for when we don't have relativesByRole data
 */
const FallbackRoleGroup: React.FC<{
  role: string;
  relatives: any[];
  renderNodeId: (nodeId: string | any, className?: string) => React.ReactNode;
}> = ({ role, relatives, renderNodeId }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between h-auto border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
        >
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 capitalize">
                {role.replace(/_/g, ' ')}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {relatives.length} {relatives.length === 1 ? 'node' : 'nodes'}
              </span>
            </div>
            <span className="text-sm text-gray-500 mt-1">
              Connected via this relationship
            </span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2">
        <div className="space-y-2 pl-4 border-l-2 border-gray-100">
          {relatives.map((relative, index) => (
            <div key={relative._id || index} className="bg-white border border-gray-200 rounded-lg p-3">
              <RelativeNodeView 
                relative={relative} 
                compact={false}
                showRelationshipInfo={false}
              />
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default GroupedRelativesView;
