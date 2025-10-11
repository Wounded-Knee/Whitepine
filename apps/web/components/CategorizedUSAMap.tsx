"use client"

import React, { useMemo } from "react"
import { USAMapWrapper, type USAStateAbbreviation, StateAbbreviations } from "./usa-map"

export interface CategorizedUSAMapProps {
  /** Object mapping category names to arrays of state abbreviations */
  highlightedStates: Record<string, USAStateAbbreviation[]>
  
  /** Optional legend labels for each category. If not provided, uses category keys */
  legend?: Record<string, string>
  
  /** Optional custom colors for each category. Auto-generated if not provided */
  colors?: Record<string, string>
  
  /** Show state labels */
  showLabels?: boolean
  
  /** Show tooltips with category information */
  showTooltips?: boolean
  
  /** CSS class for the container */
  className?: string
  
  /** Hide specific states (e.g., ['AK', 'HI']) */
  hiddenStates?: USAStateAbbreviation[]
  
  /** Width of the map */
  width?: number | string
  
  /** Height of the map */
  height?: number | string
  
  /** Position of the legend */
  legendPosition?: "top" | "bottom" | "left" | "right"
  
  /** Default color for states not in any category */
  defaultColor?: string
  
  /** How to handle states that appear in multiple categories */
  overlapStrategy?: "first" | "last" | "stripe" | "brightest"
  
  /** Callback when a state is clicked */
  onStateClick?: (state: USAStateAbbreviation) => void
  
  /** Currently selected state */
  selectedState?: USAStateAbbreviation | null
  
  /** Allow only highlighted states to be clickable */
  onlyHighlightedClickable?: boolean
  
  /** States with historical data/precedent - will be shown with darker colors */
  statesWithData?: USAStateAbbreviation[]
}

// Default color palette - accessible and distinct
const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#6366f1", // indigo
]

// State abbreviation to full name mapping
const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia"
}

export function CategorizedUSAMap({
  highlightedStates,
  legend,
  colors,
  showLabels = false,
  showTooltips = true,
  className = "",
  hiddenStates = [],
  width = "100%",
  height = "auto",
  legendPosition = "bottom",
  defaultColor = "#e5e7eb",
  overlapStrategy = "last",
  onStateClick,
  selectedState = null,
  onlyHighlightedClickable = false,
  statesWithData = [],
}: CategorizedUSAMapProps) {
  
  const categoryKeys = Object.keys(highlightedStates)
  
  // Generate colors for categories if not provided
  const categoryColors = useMemo(() => {
    if (colors) return colors
    
    const generated: Record<string, string> = {}
    categoryKeys.forEach((key, index) => {
      generated[key] = DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    })
    return generated
  }, [colors, categoryKeys])
  
  // Create a map of state -> categories it belongs to
  const stateCategories = useMemo(() => {
    const map: Record<string, string[]> = {}
    
    Object.entries(highlightedStates).forEach(([category, states]) => {
      states.forEach((state) => {
        if (!map[state]) map[state] = []
        map[state].push(category)
      })
    })
    
    return map
  }, [highlightedStates])
  
  // Determine color for each state based on overlap strategy
  const getStateColor = (state: string): string => {
    const categories = stateCategories[state]
    if (!categories || categories.length === 0) return defaultColor
    
    if (categories.length === 1) {
      return categoryColors[categories[0]]
    }
    
    // Handle overlapping states
    switch (overlapStrategy) {
      case "first":
        return categoryColors[categories[0]]
      case "last":
        return categoryColors[categories[categories.length - 1]]
      case "brightest":
        // Return the first category color (could be enhanced with actual brightness calculation)
        return categoryColors[categories[0]]
      case "stripe":
        // For now, just use the first color (stripe pattern would require custom SVG)
        return categoryColors[categories[0]]
      default:
        return categoryColors[categories[0]]
    }
  }
  
  // Build custom states configuration
  const customStates = useMemo(() => {
    const config: Record<string, any> = {}
    
    StateAbbreviations.forEach((state) => {
      const categories = stateCategories[state] || []
      const baseColor = getStateColor(state)
      const isHighlighted = categories.length > 0
      const isSelected = selectedState === state
      const isClickable = onStateClick && (!onlyHighlightedClickable || isHighlighted)
      const hasData = statesWithData.includes(state)
      
      // If state is highlighted but has no data, lighten the color
      const color = isHighlighted && !hasData ? lightenColor(baseColor, 40) : baseColor
      
      config[state] = {
        fill: color,
        stroke: isSelected 
          ? "#000000" // Black border for selected state
          : isHighlighted 
            ? darkenColor(color, 20) 
            : "#9ca3af",
        strokeWidth: isSelected ? 3 : 1.5,
        cursor: isClickable ? "pointer" : "default",
        onClick: isClickable ? () => {
          // Toggle: if already selected, deselect; otherwise select
          onStateClick(isSelected ? null as any : state)
        } : undefined,
        tooltip: showTooltips ? {
          enabled: true,
          render: () => (
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-md p-3 shadow-xl text-sm">
              <strong className="text-gray-900 dark:text-gray-100 text-base">
                {STATE_NAMES[state] || state}
              </strong>
              {categories.length > 0 && (
                <>
                  <div className="mt-2 space-y-1">
                    {categories.map((cat) => (
                      <div key={cat} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-400 dark:border-gray-500 flex-shrink-0" 
                          style={{ backgroundColor: categoryColors[cat] }}
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {legend?.[cat] || cat}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {isClickable && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {isSelected ? "Click to deselect" : isHighlighted ? "Click to filter timeline" : "Click to see availability"}
                  </span>
                </div>
              )}
            </div>
          ),
        } : undefined,
      }
    })
    
    return config
  }, [stateCategories, categoryColors, legend, showTooltips, onStateClick, selectedState, onlyHighlightedClickable, statesWithData])
  
  const legendElement = (
    <div className="flex flex-wrap gap-4 text-sm">
      {categoryKeys.map((category) => (
        <div key={category} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundColor: categoryColors[category] }}
          />
          <span>{legend?.[category] || category}</span>
        </div>
      ))}
    </div>
  )
  
  const isVertical = legendPosition === "left" || legendPosition === "right"
  const legendBefore = legendPosition === "top" || legendPosition === "left"
  
  return (
    <div className={`${className} ${isVertical ? 'flex gap-6' : ''}`}>
      {legendBefore && (
        <div className={`${legendPosition === "top" ? "mb-4" : ""} ${legendPosition === "left" ? "flex-shrink-0" : ""}`}>
          {legendElement}
        </div>
      )}
      
      <div className="flex-grow">
        <USAMapWrapper
          customStates={customStates}
          showLabels={showLabels}
          showTooltips={showTooltips}
          hiddenStates={hiddenStates}
          width={width}
          height={height}
          enableHover={false} // Disable default hover since we're using custom tooltips
        />
      </div>
      
      {!legendBefore && (
        <div className={`${legendPosition === "bottom" ? "mt-4" : ""} ${legendPosition === "right" ? "flex-shrink-0" : ""}`}>
          {legendElement}
        </div>
      )}
    </div>
  )
}

// Utility function to darken a hex color
function darkenColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace("#", "")
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Darken
  const factor = 1 - percent / 100
  const newR = Math.round(r * factor)
  const newG = Math.round(g * factor)
  const newB = Math.round(b * factor)
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
}

// Utility function to lighten a hex color
function lightenColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace("#", "")
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Lighten by moving towards white (255)
  const factor = percent / 100
  const newR = Math.round(r + (255 - r) * factor)
  const newG = Math.round(g + (255 - g) * factor)
  const newB = Math.round(b + (255 - b) * factor)
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
}

