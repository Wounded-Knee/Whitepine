import React from 'react';
import NodeTreeVisualization from '@web/components/NodeTreeVisualization';

export default function DemoTreePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Node Network Visualization</h1>
            <p className="mt-2 text-gray-600">
              Interactive network visualization of all nodes and their synaptic connections, with color-coded nodes by type 
              and connections by synapse role. Drag nodes to explore the network.
            </p>
          </div>
        </div>
      </div>
      
      <NodeTreeVisualization className="h-[calc(100vh-120px)]" />
    </div>
  );
}
