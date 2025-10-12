"use client"

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { createPortal } from 'react-dom';
import { getStatesFeatureCollection, getStateCentroid, type StateFeature } from '@/lib/geo/us-atlas';
import { StateAbbreviations, type USAStateAbbreviation } from '@/lib/geo/state-mappings';
import type { USAMapProps, StateCustomization } from './types';

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  state: USAStateAbbreviation | null;
  content: React.ReactNode;
}

export function D3USAMap({
  customStates,
  defaultState,
  hiddenStates = [],
  width = "100%",
  height = "auto",
  className = "",
  defaultFill = "#e5e7eb",
  defaultStroke = "#9ca3af",
  hoverFill = "#dbeafe",
  hoverStroke = "#3b82f6",
  selectedFill = "#bfdbfe",
  selectedStroke = "#2563eb",
  enableHover = true,
  enableSelection = false,
  showLabels = false,
  showTooltips = true,
  onStateClick,
  onStateHover,
  selectedStates: controlledSelectedStates,
  onSelectedStatesChange,
}: USAMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [statesData, setStatesData] = useState<StateFeature[]>([]);
  const [dimensions, setDimensions] = useState({ width: 960, height: 600 });
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    state: null,
    content: null
  });
  
  // Internal state for selected states (used when not controlled)
  const [internalSelectedStates, setInternalSelectedStates] = useState<USAStateAbbreviation[]>([]);
  const [hoveredState, setHoveredState] = useState<USAStateAbbreviation | null>(null);
  
  // Use controlled or internal selected states
  const selectedStates = controlledSelectedStates ?? internalSelectedStates;
  const setSelectedStates = onSelectedStatesChange ?? setInternalSelectedStates;

  // Load geographic data
  useEffect(() => {
    let mounted = true;
    
    getStatesFeatureCollection().then(collection => {
      if (mounted) {
        setStatesData(collection.features);
      }
    }).catch(error => {
      console.error('Failed to load states data:', error);
    });
    
    return () => { mounted = false; };
  }, []);

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = typeof width === 'number' ? width : rect.width || 960;
      const h = typeof height === 'number' ? height : (height === 'auto' ? w * 0.625 : rect.height || 600);
      setDimensions({ width: w, height: h });
    };
    
    updateSize();
    setMounted(true);
    
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [width, height]);

  // Get configuration for a specific state
  const getStateConfig = useCallback((abbr: USAStateAbbreviation): StateCustomization => {
    const custom = customStates?.[abbr] || {};
    const isSelected = selectedStates.includes(abbr);
    const isHovered = enableHover && hoveredState === abbr;
    
    // Determine fill and stroke
    let fill = custom.fill;
    let stroke = custom.stroke;
    let strokeWidth = custom.strokeWidth;
    
    if (!fill) {
      if (isSelected) {
        fill = selectedFill;
      } else if (isHovered) {
        fill = hoverFill;
      } else {
        fill = defaultFill;
      }
    }
    
    if (!stroke) {
      if (isSelected) {
        stroke = selectedStroke;
      } else if (isHovered) {
        stroke = hoverStroke;
      } else {
        stroke = defaultStroke;
      }
    }
    
    if (strokeWidth === undefined) {
      strokeWidth = isSelected ? 2 : 1;
    }
    
    return {
      fill,
      stroke,
      strokeWidth,
      onClick: custom.onClick,
      onHover: custom.onHover,
      onLeave: custom.onLeave,
      onFocus: custom.onFocus,
      onBlur: custom.onBlur,
      label: custom.label || { enabled: showLabels },
      tooltip: custom.tooltip || { enabled: showTooltips }
    };
  }, [customStates, selectedStates, hoveredState, enableHover, selectedFill, selectedStroke, 
      hoverFill, hoverStroke, defaultFill, defaultStroke, showLabels, showTooltips]);

  // Render map with D3
  useEffect(() => {
    if (!svgRef.current || statesData.length === 0 || !mounted) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render
    
    // Create projection
    const filteredFeatures = statesData.filter(f => 
      f.properties.abbreviation && !hiddenStates.includes(f.properties.abbreviation)
    );
    
    const featureCollection = {
      type: 'FeatureCollection' as const,
      features: filteredFeatures
    };
    
    const projection = d3.geoAlbersUsa()
      .fitSize([dimensions.width, dimensions.height], featureCollection as any);
    
    const pathGenerator = d3.geoPath().projection(projection);
    
    // Create main group
    const g = svg.append('g');
    
    // Render states
    filteredFeatures.forEach(feature => {
      const abbr = feature.properties.abbreviation;
      if (!abbr) return;
      
      const config = getStateConfig(abbr);
      const path = pathGenerator(feature as any);
      if (!path) return;
      
      const stateGroup = g.append('g')
        .attr('data-state', abbr);
      
      // Draw state path
      const statePath = stateGroup.append('path')
        .attr('d', path)
        .attr('fill', config.fill || defaultFill)
        .attr('stroke', config.stroke || defaultStroke)
        .attr('stroke-width', config.strokeWidth || 1)
        .attr('cursor', (config.onClick || onStateClick || enableSelection) ? 'pointer' : 'default')
        .style('transition', 'fill 0.2s ease, stroke 0.2s ease');
      
      // Event handlers
      statePath.on('click', (event) => {
        event.stopPropagation();
        
        config.onClick?.(abbr);
        onStateClick?.(abbr);
        
        if (enableSelection) {
          setSelectedStates(
            selectedStates.includes(abbr)
              ? selectedStates.filter(s => s !== abbr)
              : [...selectedStates, abbr]
          );
        }
      });
      
      statePath.on('mouseenter', (event) => {
        config.onHover?.(abbr);
        onStateHover?.(abbr);
        
        if (enableHover) {
          setHoveredState(abbr);
        }
        
        // Show tooltip
        if (config.tooltip?.enabled) {
          const tooltipContent = config.tooltip.render?.(abbr) || abbr;
          setTooltip({
            show: true,
            x: event.pageX,
            y: event.pageY,
            state: abbr,
            content: tooltipContent
          });
        }
      });
      
      statePath.on('mousemove', (event) => {
        if (config.tooltip?.enabled && tooltip.show) {
          setTooltip(prev => ({
            ...prev,
            x: event.pageX,
            y: event.pageY
          }));
        }
      });
      
      statePath.on('mouseleave', () => {
        config.onLeave?.(abbr);
        onStateHover?.(null);
        
        if (enableHover) {
          setHoveredState(null);
        }
        
        setTooltip({ show: false, x: 0, y: 0, state: null, content: null });
      });
      
      statePath.on('focus', () => {
        config.onFocus?.(abbr);
      });
      
      statePath.on('blur', () => {
        config.onBlur?.(abbr);
      });
      
      // Add label if enabled
      if (config.label?.enabled) {
        const centroid = getStateCentroid(feature);
        if (centroid) {
          const projectedCentroid = projection(centroid);
          if (projectedCentroid) {
            const labelContent = config.label.render?.(abbr) || abbr;
            
            if (typeof labelContent === 'string') {
              stateGroup.append('text')
                .attr('x', projectedCentroid[0])
                .attr('y', projectedCentroid[1])
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '10px')
                .attr('font-weight', 'bold')
                .attr('fill', '#374151')
                .attr('pointer-events', 'none')
                .text(labelContent);
            }
          }
        }
      }
    });
    
  }, [statesData, dimensions, mounted, hiddenStates, getStateConfig, defaultFill, defaultStroke,
      enableHover, enableSelection, onStateClick, onStateHover, selectedStates, setSelectedStates, tooltip.show]);

  // Re-render when hover state or selection changes
  useEffect(() => {
    if (!svgRef.current || statesData.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    
    StateAbbreviations.forEach(abbr => {
      if (hiddenStates.includes(abbr)) return;
      
      const config = getStateConfig(abbr);
      const stateGroup = svg.select(`[data-state="${abbr}"]`);
      const path = stateGroup.select('path');
      
      if (!path.empty()) {
        path
          .attr('fill', config.fill || defaultFill)
          .attr('stroke', config.stroke || defaultStroke)
          .attr('stroke-width', config.strokeWidth || 1);
      }
    });
  }, [hoveredState, selectedStates, statesData, hiddenStates, getStateConfig, defaultFill, defaultStroke]);

  return (
    <>
      <div ref={containerRef} className={className} style={{ width, height: height === 'auto' ? undefined : height }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      {/* Tooltip portal */}
      {mounted && tooltip.show && typeof window !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            pointerEvents: 'none',
            zIndex: 9999
          }}
        >
          {tooltip.content}
        </div>,
        document.body
      )}
    </>
  );
}

// For backward compatibility
export { D3USAMap as USAMapWrapper };

