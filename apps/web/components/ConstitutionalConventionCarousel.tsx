"use client"

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { D3CategorizedUSAMap as CategorizedUSAMap } from './maps/D3CategorizedUSAMap'
import { DirectDemocracyTimeline } from './DirectDemocracyTimeline'
import type { USAStateAbbreviation } from './maps'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ConventionTimelineEvent {
  date: string
  event: string
  type: string
  summary: string
}

interface ConventionAttempt {
  id: string
  title: string
  date_range: { start: string; end: string }
  reason: string
  mechanism: string
  participating_states: string[] | null
  state_count: number | string
  key_figures?: string[]
  outcome: string
  notes: string
  sources: string[]
  timeline_events: ConventionTimelineEvent[]
  summary: string
}

interface ConstitutionalConventionCarouselProps {
  attempts: ConventionAttempt[]
}

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

// Map full state names to abbreviations
const STATE_NAME_TO_ABBR: Record<string, USAStateAbbreviation> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
  "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
  "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
  "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
  "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
  "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
  "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
  "District of Columbia": "DC"
}

const CONVENTION_COLOR = '#8b5cf6' // purple

export function ConstitutionalConventionCarousel({ attempts }: ConstitutionalConventionCarouselProps) {
  const [autoplayPlugin] = useState(() => 
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  )
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'center',
    },
    [autoplayPlugin]
  )
  
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedState, setSelectedState] = useState<USAStateAbbreviation | null>(null)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setSelectedState(null)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const currentAttempt = attempts[selectedIndex]

  // Convert state names to abbreviations
  const getStateAbbreviations = (stateNames: string[] | null): USAStateAbbreviation[] => {
    if (!stateNames) return []
    return stateNames
      .map(name => STATE_NAME_TO_ABBR[name])
      .filter(Boolean) as USAStateAbbreviation[]
  }

  const currentStates = getStateAbbreviations(currentAttempt?.participating_states)
  const hasSpecificStates = currentStates.length > 0

  // Format timeline data for DirectDemocracyTimeline component
  const timelineData = currentAttempt?.timeline_events?.map(event => ({
    state: "National",
    stateAbbr: "US",
    event: event.event,
    type: event.type,
    date_range: event.date,
    summary: event.summary,
    challenges_overcome: "",
  })) || []

  const handleStateClick = (state: USAStateAbbreviation | null) => {
    if (!hasSpecificStates) return
    setSelectedState(state)
  }

  // Filter timeline by selected state if applicable
  const filteredTimeline = useMemo(() => {
    if (!selectedState || !hasSpecificStates) return timelineData
    // For now, don't filter since events are national-level
    return timelineData
  }, [selectedState, hasSpecificStates, timelineData])

  const formatStateCount = (count: number | string): string => {
    if (typeof count === 'number') return count.toString()
    return count
  }

  return (
    <div className="my-8">
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {attempts.map((attempt) => {
            const states = getStateAbbreviations(attempt.participating_states)
            const hasStates = states.length > 0
            
            return (
              <div key={attempt.id} className="flex-[0_0_100%] min-w-0">
                <div className="px-4">
                  {/* Title */}
                  <h3 
                    className="text-2xl font-bold mb-2 text-center"
                    style={{ color: CONVENTION_COLOR }}
                  >
                    {attempt.title}
                  </h3>
                  <p className="text-center text-sm text-muted-foreground mb-1">
                    {attempt.date_range.start.split('-')[0]} – {attempt.date_range.end.split('-')[0]}
                  </p>
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    {hasStates 
                      ? `${states.length} state${states.length !== 1 ? 's' : ''} participated`
                      : `${formatStateCount(attempt.state_count)} state${typeof attempt.state_count === 'number' && attempt.state_count === 1 ? '' : 's'}`
                    }
                  </p>
                  
                  {/* Map with navigation arrows */}
                  <div className="relative mb-6">
                    {hasStates ? (
                      <CategorizedUSAMap
                        highlightedStates={{
                          convention: states
                        }}
                        colors={{
                          convention: CONVENTION_COLOR
                        }}
                        legend={{
                          convention: 'Participating States'
                        }}
                        showTooltips={true}
                        legendPosition="bottom"
                        onStateClick={handleStateClick}
                        selectedState={selectedState}
                        onlyHighlightedClickable={false}
                        statesWithData={states}
                      />
                    ) : (
                      <div className="relative">
                        <CategorizedUSAMap
                          highlightedStates={{}}
                          colors={{}}
                          showTooltips={false}
                          legendPosition="bottom"
                          defaultColor="#e5e7eb"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-white/95 dark:bg-gray-900/95 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-6 shadow-xl max-w-md">
                            <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                              <strong className="block mb-2 text-base">
                                {formatStateCount(attempt.state_count)} state{typeof attempt.state_count === 'number' && attempt.state_count === 1 ? '' : 's'}
                              </strong>
                              Specific state participation data incomplete in historical record
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Navigation Arrows */}
                    <button
                      onClick={scrollPrev}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-background/80 hover:bg-background border border-border rounded-full p-2 shadow-lg transition-all hover:scale-110 backdrop-blur-sm z-10"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    
                    <button
                      onClick={scrollNext}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-background/80 hover:bg-background border border-border rounded-full p-2 shadow-lg transition-all hover:scale-110 backdrop-blur-sm z-10"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>

                  {/* Summary Section */}
                  <div className="max-w-3xl mx-auto mb-6">
                    <h4 
                      className="text-xl font-semibold mb-3 text-center"
                      style={{ color: CONVENTION_COLOR }}
                    >
                      {attempt.reason}
                    </h4>
                    <p className="text-base text-foreground/90 leading-relaxed mb-4">
                      {attempt.summary}
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      <strong>Outcome:</strong> {attempt.outcome}
                    </p>
                  </div>
                  
                  {/* Timeline Section */}
                  {filteredTimeline.length > 0 && (
                    <div className="mt-8 mb-6">
                      <h4 
                        className="text-xl font-semibold mb-4 text-center"
                        style={{ color: CONVENTION_COLOR }}
                      >
                        Timeline of Events
                      </h4>
                      <DirectDemocracyTimeline 
                        data={filteredTimeline}
                        hideControls={true}
                      />
                    </div>
                  )}
                  
                  {/* Additional Notes */}
                  {attempt.notes && (
                    <div className="max-w-3xl mx-auto mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-foreground/80">
                        <strong>Note:</strong> {attempt.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {attempts.map((attempt, index) => (
          <button
            key={attempt.id}
            onClick={() => scrollTo(index)}
            className={`transition-all rounded-full ${
              index === selectedIndex
                ? 'w-8 h-3'
                : 'w-3 h-3 hover:opacity-80'
            }`}
            style={{
              backgroundColor: index === selectedIndex ? CONVENTION_COLOR : '#d1d5db'
            }}
            aria-label={`Go to slide ${index + 1}: ${attempt.title}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="text-center mt-4 text-sm text-muted-foreground">
        {selectedIndex + 1} / {attempts.length}
      </div>
    </div>
  )
}

