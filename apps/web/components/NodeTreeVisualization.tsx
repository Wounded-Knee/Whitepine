'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useSelector, useDispatch } from 'react-redux';
import { NODE_TYPES, SYNAPSE_ROLES } from '@whitepine/types';
import { BaseNodeView } from './NodeView';
import { apiClient } from '@web/lib/api-client';
import type { BaseNode, SynapseNode } from '@whitepine/types';
import type { RootState } from '@web/store/types';

interface TreeNode {
  id: string;
  name: string;
  type: string;
  data: BaseNode;
  children?: TreeNode[];
  synapses?: SynapseNode[];
}

interface NodeTreeVisualizationProps {
  className?: string;
}

// Color schemes for nodes and connections
const NODE_COLORS = {
  [NODE_TYPES.USER]: '#3b82f6',      // Blue
  [NODE_TYPES.POST]: '#10b981',      // Green
  [NODE_TYPES.SYNAPSE]: '#f59e0b',   // Orange
  [NODE_TYPES.BASE]: '#6b7280',      // Gray
  'user-plugin': '#8b5cf6',          // Purple
} as const;

const SYNAPSE_ROLE_COLORS = {
  [SYNAPSE_ROLES.AUTHOR]: '#ef4444',        // Red
  [SYNAPSE_ROLES.TAGGED]: '#8b5cf6',        // Purple
  [SYNAPSE_ROLES.PARENT]: '#06b6d4',        // Cyan
  [SYNAPSE_ROLES.CHILD]: '#84cc16',         // Lime
  [SYNAPSE_ROLES.RELATED]: '#f97316',       // Orange
  [SYNAPSE_ROLES.FOLLOWS]: '#ec4899',       // Pink
  [SYNAPSE_ROLES.FRIENDS]: '#14b8a6',       // Teal
  [SYNAPSE_ROLES.COLLABORATES]: '#6366f1',  // Indigo
  [SYNAPSE_ROLES.MEMBER]: '#a855f7',        // Violet
  [SYNAPSE_ROLES.ADMIN]: '#dc2626',         // Red-600
  [SYNAPSE_ROLES.OWNER]: '#b91c1c',         // Red-700
  [SYNAPSE_ROLES.CATEGORY]: '#059669',      // Emerald-600
  [SYNAPSE_ROLES.TOPIC]: '#0d9488',         // Teal-600
  [SYNAPSE_ROLES.SERIES]: '#7c3aed',        // Violet-600
  [SYNAPSE_ROLES.CUSTOM]: '#64748b',        // Slate-500
} as const;

const getNodeColor = (nodeType: string): string => {
  return NODE_COLORS[nodeType as keyof typeof NODE_COLORS] || NODE_COLORS[NODE_TYPES.BASE];
};

const getSynapseColor = (role: string): string => {
  return SYNAPSE_ROLE_COLORS[role as keyof typeof SYNAPSE_ROLE_COLORS] || '#6b7280';
};

const NodeTreeVisualization: React.FC<NodeTreeVisualizationProps> = ({ className = '' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<BaseNode | null>(null);
  const [selectedSynapse, setSelectedSynapse] = useState<SynapseNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const hasLoadedData = useRef(false);
  const lastVisualizationData = useRef<string>('');
  const lastNodeCount = useRef<number>(0);
  
  // Redux integration
  const dispatch = useDispatch();
  const nodes = useSelector((state: RootState) => state.nodes.byId);
  const lastUpdateTime = useRef<number>(0);
  
  // Update individual node in visualization
  const updateNodeInVisualization = useCallback((updatedNode: BaseNode) => {
    if (!svgRef.current) return;
    
    // Find the node element and update its display
    const nodeElement = d3.select(svgRef.current).select(`.node[data-id="${updatedNode._id}"]`);
    
    if (nodeElement.empty()) {
      console.log(`Node ${updatedNode._id} not found in visualization, triggering refresh`);
      setRefreshTrigger(prev => prev + 1);
      return;
    }
    
    try {
      // Update node display name
      const displayName = getNodeDisplayName(updatedNode);
      nodeElement.select('text').text(displayName);
      
      // Update node color if type changed
      const nodeColor = NODE_COLORS[updatedNode.kind as keyof typeof NODE_COLORS] || '#6b7280';
      nodeElement.select('circle').attr('fill', nodeColor);
      
      // Update tooltip
      const nodeData = nodeElement.datum() as any;
      const connectionCount = nodeData?.synapses?.length || 0;
      nodeElement.select('title').text(`${displayName}\nType: ${updatedNode.kind}\nConnections: ${connectionCount}`);
      
      console.log(`Updated node ${updatedNode._id} in visualization without full refresh`);
    } catch (error) {
      console.error('Error updating node in visualization:', error);
      // Fallback to full refresh if individual update fails
      setRefreshTrigger(prev => prev + 1);
    }
  }, []);

  // Listen for node updates in Redux store - but only for actual data changes, not selection changes
  useEffect(() => {
    const nodeCount = Object.keys(nodes).length;
    const currentTime = Date.now();
    
    // Debug: Log when Redux nodes state changes
    const nodeIds = Object.keys(nodes);
    console.log(`Redux nodes state changed: count=${nodeCount}, lastCount=${lastNodeCount.current}, timeSinceLastUpdate=${currentTime - lastUpdateTime.current}ms`);
    console.log(`Current node IDs:`, nodeIds);
    console.log(`Selected node ID:`, selectedNode?._id);
    
    // Only refresh if:
    // 1. We have nodes
    // 2. The node count actually changed (new nodes added/removed)
    // 3. The node count increased (not decreased - decreases are likely temporary loading states)
    // 4. Enough time has passed since last update
    if (nodeCount > 0 && 
        nodeCount !== lastNodeCount.current && 
        nodeCount > lastNodeCount.current && // Only refresh when count increases
        currentTime - lastUpdateTime.current > 2000) {
      console.log(`Node count increased from ${lastNodeCount.current} to ${nodeCount}, triggering refresh`);
      lastNodeCount.current = nodeCount;
      lastUpdateTime.current = currentTime;
      setRefreshTrigger(prev => prev + 1);
    } else {
      console.log(`Skipping refresh: nodeCount=${nodeCount}, lastCount=${lastNodeCount.current}, timeSinceLastUpdate=${currentTime - lastUpdateTime.current}ms, countIncreased=${nodeCount > lastNodeCount.current}`);
    }
  }, [nodes]);

  // More sophisticated node update detection - but with better debouncing and content change detection
  useEffect(() => {
    // This effect runs when the nodes object changes
    // We can detect which specific nodes were updated
    const currentTime = Date.now();
    
    // Check if any nodes have been updated recently (within last 5 seconds)
    const recentlyUpdatedNodes = Object.values(nodes).filter((node: any) => {
      const updatedAt = node.updatedAt ? new Date(node.updatedAt).getTime() : 0;
      return currentTime - updatedAt < 5000; // 5 seconds
    });
    
    // Only trigger refresh if there are actual content updates, not just selection changes
    // and enough time has passed since last update
    if (recentlyUpdatedNodes.length > 0 && currentTime - lastUpdateTime.current > 3000) {
      lastUpdateTime.current = currentTime;
      
      // Try to update individual nodes first before doing a full refresh
      let allNodesUpdated = true;
      recentlyUpdatedNodes.forEach((node: any) => {
        try {
          updateNodeInVisualization(node);
        } catch (error) {
          console.error(`Failed to update node ${node._id}:`, error);
          allNodesUpdated = false;
        }
      });
      
      // Only do full refresh if individual updates failed
      if (!allNodesUpdated) {
        console.log('Individual node updates failed, triggering full refresh');
        setRefreshTrigger(prev => prev + 1);
      }
    }
  }, [nodes, updateNodeInVisualization]);

  // Fetch all nodes from the API
  const fetchAllNodes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the apiClient to fetch all nodes
      const { nodes } = await apiClient.getNodes({ limit: 1000 });
      return nodes || [];
    } catch (err) {
      console.error('Error fetching nodes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch nodes');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Transform flat node data into a network structure showing all nodes and connections
  const transformToNetwork = useCallback((nodes: BaseNode[]): { nodes: TreeNode[], links: Array<{source: TreeNode, target: TreeNode, synapse: SynapseNode}> } => {
    const nodeMap = new Map<string, BaseNode>();
    const synapseNodes: SynapseNode[] = [];
    const regularNodes: BaseNode[] = [];

    // Separate synapses from regular nodes
    nodes.forEach(node => {
      if (node.kind === NODE_TYPES.SYNAPSE || node.kind === 'synapse') {
        synapseNodes.push(node as SynapseNode);
      } else {
        regularNodes.push(node);
        nodeMap.set(node._id, node);
      }
    });

    // Create tree nodes for all regular nodes
    const treeNodes: TreeNode[] = regularNodes.map(node => ({
      id: node._id,
      name: getNodeDisplayName(node),
      type: node.kind,
      data: node,
      children: [],
      synapses: synapseNodes.filter(s => s.from === node._id || s.to === node._id)
    }));

    // Create links for all synapses, ensuring source and target reference actual nodes
    const links = synapseNodes.map(synapse => {
      const sourceNode = treeNodes.find(n => n.id === synapse.from);
      const targetNode = treeNodes.find(n => n.id === synapse.to);
      
      // Only create link if both nodes exist
      if (sourceNode && targetNode) {
        return {
          source: sourceNode,
          target: targetNode,
          synapse: synapse
        };
      }
      return null;
    }).filter(link => link !== null);


    return { nodes: treeNodes, links };
  }, []);

  // Helper function to get display name for nodes
  const getNodeDisplayName = (node: BaseNode): string => {
    if (node.kind === NODE_TYPES.USER || node.kind === 'User') {
      const userNode = node as any;
      return userNode.name || userNode.email || 'User';
    } else if (node.kind === NODE_TYPES.POST || node.kind === 'post') {
      const postNode = node as any;
      return postNode.content?.substring(0, 50) + (postNode.content?.length > 50 ? '...' : '') || 'Post';
    } else if (node.kind === NODE_TYPES.SYNAPSE || node.kind === 'synapse') {
      const synapseNode = node as SynapseNode;
      return `${synapseNode.role} connection`;
    } else if (node.kind === 'user-plugin') {
      return 'Plugin';
    }
    return node.kind || 'Node';
  };

  // Create the network visualization
  const createVisualization = useCallback((networkData: { nodes: TreeNode[], links: Array<{source: TreeNode, target: TreeNode, synapse: SynapseNode}> }) => {
    try {
      if (!svgRef.current || !containerRef.current) {
        console.error('SVG or container ref is null');
        return;
      }

      console.log('createVisualization called with:', networkData.nodes.length, 'nodes,', networkData.links.length, 'links');
      
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Clear previous visualization
      console.log('Clearing previous visualization');
      d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g");

    // Create force simulation with better parameters
    const simulation = d3.forceSimulation(networkData.nodes as any)
      .force("link", d3.forceLink(networkData.links as any)
        .id((d: any) => d.id)
        .distance(150) // Fixed distance for debugging
        .strength(0.5)) // Increased strength
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(20))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    // Create links
    g.selectAll(".link")
      .data(networkData.links)
      .enter().append("line")
      .attr("class", "link")
      .attr("stroke", (d: any) => SYNAPSE_ROLE_COLORS[d.synapse?.role as keyof typeof SYNAPSE_ROLE_COLORS] || "#999")
      .attr("stroke-width", (d: any) => {
        const role = d.synapse?.role;
        return role === "parent" || role === "child" ? 4 : 2;
      })
      .attr("stroke-opacity", 0.8)
      .style("cursor", "pointer")
      .on("click", (event, d: any) => {
        event.stopPropagation();
        setSelectedSynapse(d.synapse);
        setSelectedNode(null);
      })
      .on("mouseover", function(event, d: any) {
        d3.select(this)
          .attr("stroke-width", (d: any) => {
            const role = d.synapse?.role;
            const baseWidth = role === "parent" || role === "child" ? 4 : 2;
            return baseWidth + 2;
          });
      })
      .on("mouseout", function(event, d: any) {
        d3.select(this)
          .attr("stroke-width", (d: any) => {
            const role = d.synapse?.role;
            return role === "parent" || role === "child" ? 4 : 2;
          });
      })
      .append("title")
      .text((d: any) => `${d.synapse.role} connection\nDirection: ${d.synapse.dir}`);

    // Get reference to the created links for the tick function
    const link = g.selectAll(".link");

    // Create nodes
    const node = g.selectAll(".node")
      .data(networkData.nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("data-id", (d: any) => d.id)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        console.log(`Node clicked: ${d.data._id}, setting selectedNode`);
        setSelectedNode(d.data);
        setSelectedSynapse(null);
      })
      .call(d3.drag<any, TreeNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add circles for nodes with size based on connections
    node.append("circle")
      .attr("r", d => {
        // Size nodes based on number of connections
        const connectionCount = networkData.links.filter(link => 
          (link.source as any).id === d.id || (link.target as any).id === d.id
        ).length;
        return Math.max(6, Math.min(15, 6 + connectionCount * 0.5));
      })
      .attr("fill", d => getNodeColor(d.type))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("opacity", 0.9);

    // Add labels
    node.append("text")
      .attr("dy", "0.31em")
      .attr("dx", 12)
      .text(d => d.name)
      .style("font-size", "12px")
      .style("fill", "#333")
      .style("pointer-events", "none");

    // Add tooltips for nodes
    node.append("title")
      .text(d => {
        const connectionCount = networkData.links.filter(link => 
          (link.source as any).id === d.id || (link.target as any).id === d.id
        ).length;
        return `${d.name}\nType: ${d.type}\nConnections: ${connectionCount}`;
      });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x || 0)
        .attr("y1", (d: any) => d.source.y || 0)
        .attr("x2", (d: any) => d.target.x || 0)
        .attr("y2", (d: any) => d.target.y || 0);

      node
        .attr("transform", (d: any) => `translate(${d.x || 0},${d.y || 0})`);
    });


    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);
    
      console.log('Visualization creation complete');
      
      // Debug: Check if elements were actually created
      setTimeout(() => {
        const nodes = svgRef.current?.querySelectorAll('.node');
        const links = svgRef.current?.querySelectorAll('.link');
        console.log('After visualization creation:', {
          nodes: nodes?.length || 0,
          links: links?.length || 0
        });
      }, 100);
    } catch (error) {
      console.error('Error in createVisualization:', error);
      setError('Failed to create visualization');
    }
  }, []);

  // Memoize the network data to prevent unnecessary recalculations
  const networkData = useMemo(() => {
    if (!hasLoadedData.current) return null;
    // This will be populated when data is loaded
    return null;
  }, [refreshTrigger]);

  // Memoize the side panel content to prevent unnecessary re-renders
  const sidePanelContent = useMemo(() => {
    if (selectedNode) {
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">Selected Node</h3>
            <BaseNodeView 
              nodeId={selectedNode._id}
              mode="view"
              className="text-sm"
            />
          </div>
        </div>
      );
    }
    
    if (selectedSynapse) {
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">Selected Connection</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Role:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {selectedSynapse.role}
                </span>
              </div>
              <div>
                <span className="font-medium">Direction:</span>
                <span className="ml-2">{selectedSynapse.dir}</span>
              </div>
              {selectedSynapse.weight && (
                <div>
                  <span className="font-medium">Weight:</span>
                  <span className="ml-2">{selectedSynapse.weight}</span>
                </div>
              )}
              {selectedSynapse.order && (
                <div>
                  <span className="font-medium">Order:</span>
                  <span className="ml-2">{selectedSynapse.order}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Show connected nodes */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">Connected Nodes</h3>
            <div className="space-y-2">
              <BaseNodeView 
                nodeId={selectedSynapse.from}
                mode="view"
                className="text-sm"
              />
              <div className="text-center text-gray-500">↕</div>
              <BaseNodeView 
                nodeId={selectedSynapse.to}
                mode="view"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Click on a node or connection to view details</p>
      </div>
    );
  }, [selectedNode, selectedSynapse]);

  // Load data and create visualization
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data, refreshTrigger:', refreshTrigger, 'selectedNode:', selectedNode?._id);
        const nodes = await fetchAllNodes();
        hasLoadedData.current = true;
        
        if (nodes.length > 0) {
          console.log('Creating visualization with', nodes.length, 'nodes');
          lastNodeCount.current = nodes.length; // Set initial node count
          const networkData = transformToNetwork(nodes);
          
          // Create a hash of the data to detect if it actually changed
          const dataHash = JSON.stringify({
            nodeCount: networkData.nodes.length,
            linkCount: networkData.links.length,
            nodeIds: networkData.nodes.map(n => n.id).sort(),
            linkIds: networkData.links.map(l => `${(l.source as any).id}-${(l.target as any).id}`).sort()
          });
          
          // Only recreate visualization if data actually changed
          if (dataHash !== lastVisualizationData.current) {
            console.log('Network data changed, recreating visualization');
            lastVisualizationData.current = dataHash;
            console.log('Network data created:', networkData);
            
            // Wait for refs to be available
            if (!svgRef.current || !containerRef.current) {
              console.log('Refs not available, waiting...');
              setTimeout(() => {
                if (svgRef.current && containerRef.current) {
                  createVisualization(networkData);
                  console.log('createVisualization call completed (delayed)');
                } else {
                  console.error('Refs still not available after delay');
                  setError('Failed to create visualization - DOM not ready');
                }
              }, 100);
            } else {
              createVisualization(networkData);
              console.log('createVisualization call completed');
            }
          } else {
            console.log('Network data unchanged, skipping visualization recreation');
          }
        } else {
          // Handle case where no nodes are returned
          setError('No nodes found in the database');
        }
      } catch (error) {
        console.error('Error in loadData:', error);
        setError('Failed to load data');
      }
    };

    loadData();
  }, [refreshTrigger, createVisualization, transformToNetwork]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const networkData = d3.select(svgRef.current).datum() as any;
      if (networkData) {
        createVisualization(networkData);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [createVisualization]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading node tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <p className="text-red-600">Error loading visualization: {error}</p>
          <button 
            onClick={() => {
              setError(null);
              setRefreshTrigger(prev => prev + 1);
            }} 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${className}`}>
      {/* Tree Visualization */}
      <div ref={containerRef} className="flex-1 relative">
        <svg ref={svgRef} className="w-full h-full"></svg>
        
        {/* Controls */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => {
              setError(null);
              setRefreshTrigger(prev => prev + 1);
            }}
            className="px-3 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>
        
        {/* Legend */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold mb-2">Legend</h3>
          
          {/* Debug info */}
          <div className="mb-3 p-2 bg-gray-100 rounded text-xs">
            <div>Nodes: {Array.from(svgRef.current?.querySelectorAll('.node') || []).length}</div>
            <div>Links: {Array.from(svgRef.current?.querySelectorAll('.link') || []).length}</div>
          </div>
          
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Node Types:</h4>
            <div className="space-y-1">
              {Object.entries(NODE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                  <span className="text-xs text-gray-600">{type}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Connection Types:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Object.entries(SYNAPSE_ROLE_COLORS).slice(0, 8).map(([role, color]) => (
                <div key={role} className="flex items-center space-x-2">
                  <div className="w-3 h-1" style={{ backgroundColor: color }}></div>
                  <span className="text-xs text-gray-600">{role}</span>
                </div>
              ))}
              {Object.keys(SYNAPSE_ROLE_COLORS).length > 8 && (
                <div className="text-xs text-gray-500">...and more</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Node Details</h2>
          {sidePanelContent}
        </div>
      </div>
    </div>
  );
};

export default NodeTreeVisualization;
