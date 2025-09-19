import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

/**
 * Helper function to render node IDs as clickable links
 */
export const renderNodeId = (nodeId: string | any, className: string = '') => {
  if (!nodeId) return null;
  
  const idString = nodeId.toString();
  const shortId = idString.substring(0, 8) + '...';
  
  return (
    <Link 
      href={`/demo-nodes/${idString}`}
      className={`inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
    >
      <code className="bg-blue-50 px-2 py-1 rounded text-xs font-mono">
        {shortId}
      </code>
      <ExternalLink className="w-3 h-3 ml-1" />
    </Link>
  );
};
