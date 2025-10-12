/**
 * D3-based Map Components
 * 
 * High-performance, feature-rich map visualizations powered by D3.js
 */

// Main components
export { D3USAMap, USAMapWrapper } from './D3USAMap';
export { D3CategorizedUSAMap } from './D3CategorizedUSAMap';
export { IsolatedStateMap } from './IsolatedStateMap';

// Types
export type { 
  USAMapProps,
  StateCustomization,
  USAStateAbbreviation
} from './types';

// Re-export utilities from geo lib
export { 
  StateAbbreviations,
  STATE_NAMES,
  FIPS_TO_ABBR,
  ABBR_TO_FIPS,
  normalizeGeographicName
} from '@/lib/geo/state-mappings';

