"use client"

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getStateByAbbreviation, getStateCentroid, type StateFeature } from '@/lib/geo/us-atlas';
import { STATE_NAMES, type USAStateAbbreviation } from '@/lib/geo/state-mappings';

export interface IsolatedStateMapProps {
  /** State abbreviation to display (e.g., 'CA' for California) */
  state: USAStateAbbreviation;
  
  /** Width of the map */
  width?: number | string;
  
  /** Height of the map */
  height?: number | string;
  
  /** Fill color for the state */
  fill?: string;
  
  /** Stroke color for the state border */
  stroke?: string;
  
  /** Stroke width for the state border */
  strokeWidth?: number;
  
  /** CSS class for the container */
  className?: string;
  
  /** Show state label */
  showLabel?: boolean;
  
  /** Show state name as title */
  showTitle?: boolean;
  
  /** Padding around the state (in pixels) */
  padding?: number;
  
  /** Callback when state is clicked */
  onClick?: () => void;
}

/**
 * IsolatedStateMap - Display a single US state in perfect isolation
 * 
 * This component showcases D3's power to render individual states
 * without any surrounding geography. The state is automatically framed
 * to fill the available space.
 */
export function IsolatedStateMap({
  state,
  width = 400,
  height = 400,
  fill = "#3b82f6",
  stroke = "#1e40af",
  strokeWidth = 2,
  className = "",
  showLabel = true,
  showTitle = false,
  padding = 20,
  onClick
}: IsolatedStateMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stateData, setStateData] = useState<StateFeature | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [mounted, setMounted] = useState(false);

  // Load state data
  useEffect(() => {
    let mounted = true;
    
    getStateByAbbreviation(state).then(feature => {
      if (mounted && feature) {
        setStateData(feature);
      }
    }).catch(error => {
      console.error('Failed to load state data:', error);
    });
    
    return () => { mounted = false; };
  }, [state]);

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = typeof width === 'number' ? width : rect.width || 400;
      const h = typeof height === 'number' ? height : (height === 'auto' ? w : rect.height || 400);
      setDimensions({ width: w, height: h });
    };
    
    updateSize();
    setMounted(true);
    
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [width, height]);

  // Render isolated state
  useEffect(() => {
    if (!svgRef.current || !stateData || !mounted) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Create projection that fits ONLY this state
    const projection = d3.geoAlbersUsa()
      .fitExtent(
        [[padding, padding], [dimensions.width - padding, dimensions.height - padding]], 
        stateData as any
      );
    
    const pathGenerator = d3.geoPath().projection(projection);
    const path = pathGenerator(stateData as any);
    
    if (!path) return;
    
    const g = svg.append('g');
    
    // Draw the state
    const statePath = g.append('path')
      .attr('d', path)
      .attr('fill', fill)
      .attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
      .attr('cursor', onClick ? 'pointer' : 'default');
    
    // Add click handler
    if (onClick) {
      statePath.on('click', () => onClick());
    }
    
    // Add label if enabled
    if (showLabel) {
      const centroid = getStateCentroid(stateData);
      if (centroid) {
        const projectedCentroid = projection(centroid);
        if (projectedCentroid) {
          g.append('text')
            .attr('x', projectedCentroid[0])
            .attr('y', projectedCentroid[1])
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', Math.max(16, dimensions.width / 20))
            .attr('font-weight', 'bold')
            .attr('fill', 'white')
            .attr('stroke', '#000')
            .attr('stroke-width', 0.5)
            .attr('paint-order', 'stroke')
            .attr('pointer-events', 'none')
            .text(state);
        }
      }
    }
    
  }, [stateData, dimensions, mounted, fill, stroke, strokeWidth, padding, showLabel, state, onClick]);

  const stateName = STATE_NAMES[state];

  return (
    <div className={className}>
      {showTitle && stateName && (
        <h3 className="text-xl font-semibold text-center mb-2">{stateName}</h3>
      )}
      <div 
        ref={containerRef} 
        className="flex items-center justify-center"
        style={{ width, height: height === 'auto' ? undefined : height }}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}

