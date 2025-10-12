/**
 * US Atlas Data Loader
 * 
 * Provides geographic data for US states using TopoJSON
 */

import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { FIPS_TO_ABBR, type USAStateAbbreviation } from './state-mappings';

// TopoJSON data structure for US Atlas
interface USTopology extends Topology {
  objects: {
    states: GeometryCollection;
  };
}

// GeoJSON Feature with state properties
export interface StateFeature {
  type: 'Feature';
  id: string; // FIPS code
  properties: {
    name: string;
    abbreviation: USAStateAbbreviation;
  };
  geometry: GeoJSON.Geometry;
}

export interface StatesFeatureCollection {
  type: 'FeatureCollection';
  features: StateFeature[];
}

// Cache for loaded atlas data
let atlasCache: USTopology | null = null;
let statesCache: StatesFeatureCollection | null = null;

/**
 * Load US Atlas TopoJSON data
 */
export async function loadUSAtlas(): Promise<USTopology> {
  if (atlasCache) {
    return atlasCache;
  }

  try {
    // Load from CDN
    const response = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json');
    if (!response.ok) {
      throw new Error(`Failed to load US Atlas: ${response.statusText}`);
    }
    
    const data = await response.json() as USTopology;
    atlasCache = data;
    return data;
  } catch (error) {
    console.error('Error loading US Atlas:', error);
    throw error;
  }
}

/**
 * Get US states as GeoJSON FeatureCollection
 */
export async function getStatesFeatureCollection(): Promise<StatesFeatureCollection> {
  if (statesCache) {
    return statesCache;
  }

  const atlas = await loadUSAtlas();
  const states = topojson.feature(atlas as any, atlas.objects.states) as unknown as StatesFeatureCollection;
  
  // Enhance features with abbreviations
  states.features = states.features.map(feature => {
    const fips = feature.id;
    const abbreviation = FIPS_TO_ABBR[fips];
    
    return {
      ...feature,
      properties: {
        ...feature.properties,
        abbreviation
      }
    } as StateFeature;
  });
  
  statesCache = states;
  return states;
}

/**
 * Get a single state feature by abbreviation
 */
export async function getStateByAbbreviation(abbr: USAStateAbbreviation): Promise<StateFeature | undefined> {
  const states = await getStatesFeatureCollection();
  return states.features.find(f => f.properties.abbreviation === abbr);
}

/**
 * Get multiple states by abbreviations
 */
export async function getStatesByAbbreviations(abbrs: USAStateAbbreviation[]): Promise<StateFeature[]> {
  const states = await getStatesFeatureCollection();
  const abbrSet = new Set(abbrs);
  return states.features.filter(f => abbrSet.has(f.properties.abbreviation));
}

/**
 * Calculate centroid of a state for label positioning
 */
export function getStateCentroid(feature: StateFeature): [number, number] | null {
  try {
    const centroid = d3.geoCentroid(feature as any);
    return centroid;
  } catch (error) {
    console.error('Error calculating centroid:', error);
    return null;
  }
}

/**
 * Calculate centroids for all states
 */
export async function getStateCentroids(): Promise<Record<USAStateAbbreviation, [number, number]>> {
  const states = await getStatesFeatureCollection();
  const centroids: Partial<Record<USAStateAbbreviation, [number, number]>> = {};
  
  states.features.forEach(feature => {
    const centroid = getStateCentroid(feature);
    if (centroid && feature.properties.abbreviation) {
      centroids[feature.properties.abbreviation] = centroid;
    }
  });
  
  return centroids as Record<USAStateAbbreviation, [number, number]>;
}

/**
 * Create a feature collection from a subset of states
 */
export async function createStateSubset(abbrs: USAStateAbbreviation[]): Promise<StatesFeatureCollection> {
  const features = await getStatesByAbbreviations(abbrs);
  return {
    type: 'FeatureCollection',
    features
  };
}

