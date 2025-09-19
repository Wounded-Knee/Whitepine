import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@web/components/ui/collapsible';
import { Button } from '@web/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
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
