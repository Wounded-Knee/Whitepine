'use client';

import React from 'react';
import { CollapsibleGroup } from './SynapticRoleGroup';
import { RelativeNodeView } from './RelativeNodeView';
import { renderNodeId } from './utils/renderNodeId';

interface GroupedRelativesViewProps {
  relatives: any[];
  renderNodeId: (nodeId: string | any, className?: string) => React.ReactNode;
}

/**
 * Component that groups relatives by their synaptic role using collapsible containers
 */
export const GroupedRelativesView: React.FC<GroupedRelativesViewProps> = ({
  relatives,
  renderNodeId
}) => {
  // Debug: Log the relatives data structure
  console.log('GroupedRelativesView - relatives data:', relatives);
  
  // Group relatives by synaptic role
  const relativesByRole = relatives.reduce((acc, relative) => {
    // Extract role from synapse data
    // For synapse nodes, the role is directly on the object
    // For connected nodes, we need to look at the synapse relationship
    let role = 'unknown';
    
    if (relative.kind === 'synapse') {
      // This is a synapse node, role is directly available
      role = relative.role || 'unknown';
    } else {
      // This is a connected node, look for role in relationship metadata
      role = relative.role || relative._role || 'connected';
    }
    
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(relative);
    return acc;
  }, {} as Record<string, any[]>);

  // If no relatives, show empty state
  if (relatives.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No related nodes found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(relativesByRole).map(([role, roleRelatives]) => (
        <div key={role} className="border border-gray-200 rounded-lg bg-white">
          {/* Synaptic Role Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Synaptic Role: {role.charAt(0).toUpperCase() + role.slice(1)}
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  {(roleRelatives as any[]).length} {(roleRelatives as any[]).length === 1 ? 'node' : 'nodes'} connected via this role
                </p>
              </div>
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {role}
              </div>
            </div>
          </div>
          
          {/* Collapsible Content */}
          <div className="p-4">
            <CollapsibleGroup
              title={`${role.charAt(0).toUpperCase() + role.slice(1)} Nodes`}
              items={roleRelatives as any[]}
              renderItem={(relative, index) => (
                <RelativeNodeView 
                  relative={relative} 
                  showRelationshipInfo={true}
                />
              )}
              groupBy={(relative) => relative.kind || 'unknown'}
              groupByLabel={(type, items) => type}
              maxOpenItems={3}
              showGroupCounts={true}
              showItemCounts={true}
              className="mb-0"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupedRelativesView;
