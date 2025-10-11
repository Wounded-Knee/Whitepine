/**
 * USA Map Component
 * 
 * A flexible wrapper around @mirawision/usa-map-react that provides:
 * - Interactive state selection
 * - Hover effects
 * - Custom state colors
 * - Tooltips and labels
 * - Ability to hide states
 * 
 * @example
 * ```tsx
 * import { USAMapWrapper } from "@/components/usa-map"
 * 
 * function MyMap() {
 *   return (
 *     <USAMapWrapper
 *       enableHover
 *       enableSelection
 *       showLabels
 *     />
 *   )
 * }
 * ```
 */

export { USAMapWrapper, StateAbbreviations } from "../usa-map"
export type { 
  USAMapWrapperProps,
  StateCustomization,
  USAStateAbbreviation,
  StateAbbreviation
} from "../usa-map"

