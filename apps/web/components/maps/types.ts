/**
 * Type definitions for D3-based map components
 */

import type { USAStateAbbreviation } from '@/lib/geo/state-mappings';

export interface StateCustomization {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  onClick?: (state: USAStateAbbreviation) => void;
  onHover?: (state: USAStateAbbreviation) => void;
  onLeave?: (state: USAStateAbbreviation) => void;
  onFocus?: (state: USAStateAbbreviation) => void;
  onBlur?: (state: USAStateAbbreviation) => void;
  label?: {
    enabled?: boolean;
    render?: (state: USAStateAbbreviation) => React.ReactNode;
  };
  tooltip?: {
    enabled?: boolean;
    render?: (state: USAStateAbbreviation) => React.ReactNode;
  };
}

export interface USAMapProps {
  /** Custom styling and behavior for individual states */
  customStates?: Record<string, StateCustomization>;
  
  /** Default styling and behavior for all states */
  defaultState?: StateCustomization;
  
  /** States to hide from the map (e.g., ['AK', 'HI'] to hide Alaska and Hawaii) */
  hiddenStates?: USAStateAbbreviation[];
  
  /** Width of the map SVG */
  width?: number | string;
  
  /** Height of the map SVG */
  height?: number | string;
  
  /** CSS class name for the map container */
  className?: string;
  
  /** Default fill color for states */
  defaultFill?: string;
  
  /** Default stroke color for states */
  defaultStroke?: string;
  
  /** Hover fill color for states */
  hoverFill?: string;
  
  /** Hover stroke color for states */
  hoverStroke?: string;
  
  /** Selected fill color for states */
  selectedFill?: string;
  
  /** Selected stroke color for states */
  selectedStroke?: string;
  
  /** Enable interactive hover effects */
  enableHover?: boolean;
  
  /** Enable state selection on click */
  enableSelection?: boolean;
  
  /** Show state labels by default */
  showLabels?: boolean;
  
  /** Show tooltips on hover by default */
  showTooltips?: boolean;
  
  /** Callback when a state is clicked */
  onStateClick?: (state: USAStateAbbreviation) => void;
  
  /** Callback when a state is hovered */
  onStateHover?: (state: USAStateAbbreviation | null) => void;
  
  /** Controlled selected states (for external state management) */
  selectedStates?: USAStateAbbreviation[];
  
  /** Callback when selected states change (for external state management) */
  onSelectedStatesChange?: (states: USAStateAbbreviation[]) => void;
}

// Re-export for convenience
export type { USAStateAbbreviation };

