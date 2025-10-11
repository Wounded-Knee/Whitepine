"use client"

import React, { useMemo, useState } from "react"
import { USAMap, StateAbbreviations } from "@mirawision/usa-map-react"
import type { USAStateAbbreviation } from "@mirawision/usa-map-react"

export interface StateCustomization {
  fill?: string
  stroke?: string
  onClick?: (state: USAStateAbbreviation) => void
  onHover?: (state: USAStateAbbreviation) => void
  onLeave?: (state: USAStateAbbreviation) => void
  onFocus?: (state: USAStateAbbreviation) => void
  onBlur?: (state: USAStateAbbreviation) => void
  label?: {
    enabled?: boolean
    render?: (state: USAStateAbbreviation) => React.ReactNode
  }
  tooltip?: {
    enabled?: boolean
    render?: (state: USAStateAbbreviation) => React.ReactNode
  }
}

export interface USAMapWrapperProps {
  /** Custom styling and behavior for individual states */
  customStates?: Record<string, StateCustomization>
  
  /** Default styling and behavior for all states */
  defaultState?: StateCustomization
  
  /** States to hide from the map (e.g., ['AK', 'HI'] to hide Alaska and Hawaii) */
  hiddenStates?: USAStateAbbreviation[]
  
  /** Width of the map SVG */
  width?: number | string
  
  /** Height of the map SVG */
  height?: number | string
  
  /** CSS class name for the map container */
  className?: string
  
  /** Default fill color for states */
  defaultFill?: string
  
  /** Default stroke color for states */
  defaultStroke?: string
  
  /** Hover fill color for states */
  hoverFill?: string
  
  /** Hover stroke color for states */
  hoverStroke?: string
  
  /** Selected fill color for states */
  selectedFill?: string
  
  /** Selected stroke color for states */
  selectedStroke?: string
  
  /** Enable interactive hover effects */
  enableHover?: boolean
  
  /** Enable state selection on click */
  enableSelection?: boolean
  
  /** Show state labels by default */
  showLabels?: boolean
  
  /** Show tooltips on hover by default */
  showTooltips?: boolean
  
  /** Callback when a state is clicked */
  onStateClick?: (state: USAStateAbbreviation) => void
  
  /** Callback when a state is hovered */
  onStateHover?: (state: USAStateAbbreviation | null) => void
  
  /** Controlled selected states (for external state management) */
  selectedStates?: USAStateAbbreviation[]
  
  /** Callback when selected states change (for external state management) */
  onSelectedStatesChange?: (states: USAStateAbbreviation[]) => void
}

export function USAMapWrapper({
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
}: USAMapWrapperProps) {
  // Internal state for selected states (used when not controlled)
  const [internalSelectedStates, setInternalSelectedStates] = useState<USAStateAbbreviation[]>([])
  const [hoveredState, setHoveredState] = useState<USAStateAbbreviation | null>(null)
  
  // Use controlled or internal selected states
  const selectedStates = controlledSelectedStates ?? internalSelectedStates
  const setSelectedStates = onSelectedStatesChange ?? setInternalSelectedStates

  const mapSettings = useMemo(() => {
    const settings: Record<string, StateCustomization> = {}

    StateAbbreviations.forEach((state) => {
      if (hiddenStates.includes(state)) {
        return
      }

      // Check if this state has custom settings
      const customState = customStates?.[state]
      
      // Determine fill and stroke colors based on state
      let fill: string | undefined
      let stroke: string | undefined

      if (customState?.fill || customState?.stroke) {
        // Use custom colors if provided
        fill = customState.fill
        stroke = customState.stroke
      } else if (selectedStates.includes(state)) {
        // State is selected
        fill = selectedFill
        stroke = selectedStroke
      } else if (enableHover && hoveredState === state) {
        // State is hovered
        fill = hoverFill
        stroke = hoverStroke
      } else {
        // Default state
        fill = defaultFill
        stroke = defaultStroke
      }

      settings[state] = {
        fill,
        stroke,
        onClick: (clickedState: USAStateAbbreviation) => {
          // Call custom onClick if provided
          customState?.onClick?.(clickedState)
          
          // Handle selection
          if (enableSelection) {
            setSelectedStates(
              selectedStates.includes(clickedState)
                ? selectedStates.filter((s) => s !== clickedState)
                : [...selectedStates, clickedState]
            )
          }
          
          // Call global onClick callback
          onStateClick?.(clickedState)
        },
        onHover: (hoveredState: USAStateAbbreviation) => {
          // Call custom onHover if provided
          customState?.onHover?.(hoveredState)
          
          // Set internal hover state
          if (enableHover) {
            setHoveredState(hoveredState)
          }
          
          // Call global onHover callback
          onStateHover?.(hoveredState)
        },
        onLeave: (leftState: USAStateAbbreviation) => {
          // Call custom onLeave if provided
          customState?.onLeave?.(leftState)
          
          // Clear internal hover state
          if (enableHover) {
            setHoveredState(null)
          }
          
          // Call global onHover callback with null
          onStateHover?.(null)
        },
        onFocus: customState?.onFocus,
        onBlur: customState?.onBlur,
        label: {
          enabled: customState?.label?.enabled ?? showLabels,
          render: customState?.label?.render,
        },
        tooltip: {
          enabled: customState?.tooltip?.enabled ?? showTooltips,
          render: customState?.tooltip?.render,
        },
      }
    })

    return settings
  }, [
    customStates,
    hiddenStates,
    selectedStates,
    hoveredState,
    defaultFill,
    defaultStroke,
    hoverFill,
    hoverStroke,
    selectedFill,
    selectedStroke,
    enableHover,
    enableSelection,
    showLabels,
    showTooltips,
    onStateClick,
    onStateHover,
    setSelectedStates,
  ])

  return (
    <div className={className}>
      <USAMap
        customStates={mapSettings}
        defaultState={defaultState}
        hiddenStates={hiddenStates}
        mapSettings={{ width, height }}
      />
    </div>
  )
}

// Re-export types and constants for convenience
export { StateAbbreviations } from "@mirawision/usa-map-react"
export type { USAStateAbbreviation, USAStateAbbreviation as StateAbbreviation } from "@mirawision/usa-map-react"

