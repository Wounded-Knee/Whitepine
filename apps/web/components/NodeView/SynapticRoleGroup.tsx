'use client';

import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@web/components/ui/collapsible';
import { Button } from '@web/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';

interface CollapsibleGroupProps {
  title: string;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  groupBy?: (item: any) => string;
  groupByLabel?: (groupKey: string, items: any[]) => string;
  defaultOpen?: boolean;
  maxOpenItems?: number;
  className?: string;
  itemClassName?: string;
  showGroupCounts?: boolean;
  showItemCounts?: boolean;
}

/**
 * General purpose collapsible group component that can group items by any criteria
 */
export const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({
  title,
  items,
  renderItem,
  groupBy,
  groupByLabel,
  defaultOpen,
  maxOpenItems = 3,
  className = "mb-4",
  itemClassName = "bg-white border border-gray-200 rounded-lg p-4",
  showGroupCounts = true,
  showItemCounts = true
}) => {
  // Determine if should start open based on item count or explicit default
  const shouldStartOpen = defaultOpen !== undefined ? defaultOpen : items.length <= maxOpenItems;
  const [isOpen, setIsOpen] = useState(shouldStartOpen);

  // Group items if groupBy function is provided
  const groupedItems = groupBy 
    ? items.reduce((acc, item) => {
        const groupKey = groupBy(item);
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
      }, {} as Record<string, any[]>)
    : { 'all': items };

  const totalItems = items.length;
  const titleDisplayName = title.charAt(0).toUpperCase() + title.slice(1);

  // Generate group label
  const getGroupLabel = (groupKey: string, groupItems: any[]) => {
    if (groupByLabel) {
      return groupByLabel(groupKey, groupItems);
    }
    return groupKey;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild className="px-0">
        <Button 
          variant="ghost" 
          className="w-full justify-between h-auto border-none hover:bg-gray-50 p-4"
        >
          <div className="flex flex-col items-start">
            <span className="font-medium text-gray-900">{titleDisplayName}</span>
            <span className="text-sm text-gray-500 mt-1">
              {showItemCounts && `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
              {groupBy && Object.keys(groupedItems).length > 1 && showGroupCounts && (
                <span className="ml-2">
                  ({Object.entries(groupedItems).map(([groupKey, groupItems]: [string, any]) => 
                    `${(groupItems as any[]).length} ${getGroupLabel(groupKey, groupItems)}${(groupItems as any[]).length === 1 ? '' : 's'}`
                  ).join(', ')})
                </span>
              )}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-0 pb-3">
        <div className="space-y-3 pt-2 border-t border-gray-100">
          {Object.entries(groupedItems).map(([groupKey, groupItems]: [string, any]) => (
            <div key={groupKey} className="space-y-2">
              {groupBy && Object.keys(groupedItems).length > 1 && (
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {getGroupLabel(groupKey, groupItems)} ({(groupItems as any[]).length})
                </div>
              )}
              {(groupItems as any[]).map((item: any, index: number) => (
                <div key={item._id || item.id || index} className={itemClassName}>
                  {renderItem(item, index)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Convenience wrapper for synaptic role grouping
interface SynapticRoleGroupProps {
  role: string;
  nodes: any[];
  renderNodeId: (nodeId: string | any, className?: string) => React.ReactNode;
}

export const SynapticRoleGroup: React.FC<SynapticRoleGroupProps> = ({
  role,
  nodes,
  renderNodeId
}) => {
  return (
    <CollapsibleGroup
      title={role}
      items={nodes}
      renderItem={(node, index) => (
        <div key={node._id || index}>
          {/* This would need to be imported from RelativeNodeView */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="font-medium text-gray-800">{node.kind || 'Unknown'}</div>
            <div className="text-sm text-gray-600">
              {node.name && <span>{node.name}</span>}
              {node.content && <span>{node.content.slice(0, 100)}...</span>}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {node._id?.toString().slice(-8)}
            </div>
          </div>
        </div>
      )}
      groupBy={(node) => node.kind || 'unknown'}
      groupByLabel={(type, items) => type}
      maxOpenItems={3}
    />
  );
};

export default CollapsibleGroup;
