"use client"

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { CategorizedUSAMap } from './CategorizedUSAMap'
import { DirectDemocracyTimeline } from './DirectDemocracyTimeline'
import type { USAStateAbbreviation } from './usa-map'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TimelineItem {
  state: string
  stateAbbr: string
  event: string
  type: string
  instrumentType: string
  date_range: string
  summary: string
  challenges_overcome: string
}

interface DirectDemocracySlide {
  id: string
  title: string
  description: string
  states: USAStateAbbreviation[]
  color: string
  count: number
}

interface DirectDemocracyCarouselProps {
  timelineData: TimelineItem[]
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

const slides: DirectDemocracySlide[] = [
  {
    id: 'direct-initiative',
    title: 'Direct Initiative',
    description: 'Citizens draft a proposed law, collect signatures, and if they gather enough, the measure goes directly on the ballot. Voters decide. No legislative involvement required.',
    states: [
      'AK', 'AZ', 'AR', 'CA', 'CO', 'FL', 'ID', 'IL', 'ME', 'MA',
      'MI', 'MS', 'MO', 'MT', 'NE', 'NV', 'ND', 'OH', 'OK', 'OR',
      'SD', 'UT', 'WA', 'WY'
    ],
    color: '#3b82f6', // blue
    count: 24
  },
  {
    id: 'indirect-initiative',
    title: 'Indirect Initiative',
    description: 'Similar to direct initiative, but after signatures are gathered, the measure first goes to the legislature. If the legislature doesn\'t act or modifies it, then it goes to the ballot.',
    states: ['ME', 'MA', 'MI', 'NV', 'OH', 'UT', 'WA', 'WY'],
    color: '#10b981', // green
    count: 8
  },
  {
    id: 'popular-referendum',
    title: 'Popular Referendum',
    description: 'After the legislature passes a law, citizens can collect signatures to force a vote on whether to keep or repeal it. This is a direct check on legislative power.',
    states: [
      'AK', 'AZ', 'AR', 'CA', 'CO', 'ID', 'ME', 'MD', 'MA', 'MI', 
      'MN', 'MO', 'MT', 'NE', 'NV', 'NM', 'ND', 'OH', 'OK', 'OR',
      'SD', 'UT', 'WA', 'WY'
    ],
    color: '#f59e0b', // amber
    count: 24
  },
  {
    id: 'legislative-referendum',
    title: 'Legislative Referendum',
    description: 'The legislature itself refers a question to voters—either because it\'s required (like constitutional amendments in most states) or because lawmakers want voter input on a controversial issue.',
    states: [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ],
    color: '#8b5cf6', // purple
    count: 50
  }
]

export function DirectDemocracyCarousel({ timelineData }: DirectDemocracyCarouselProps) {
  const [autoplayPlugin] = useState(() => 
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
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
    // Clear selected state when changing slides
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

  const currentSlide = slides[selectedIndex]

  // Check if selected state allows this instrument
  const stateAllowsInstrument = !selectedState || currentSlide.states.includes(selectedState)

  // Get states with historical data for current instrument type
  const statesWithData = Array.from(
    new Set(
      timelineData
        .filter(item => item.instrumentType === currentSlide.id)
        .map(item => item.stateAbbr as USAStateAbbreviation)
    )
  )

  // Filter timeline data by current instrument type and selected state
  const filteredTimeline = timelineData.filter(item => {
    const matchesInstrument = item.instrumentType === currentSlide.id
    const matchesState = !selectedState || item.stateAbbr === selectedState
    return matchesInstrument && matchesState
  })

  // Calculate summary info for filtered timeline
  const timelineSummary = useMemo(() => {
    if (filteredTimeline.length === 0) return null

    const uniqueStates = Array.from(new Set(filteredTimeline.map(item => item.stateAbbr)))
    
    // Parse years from date_range fields
    const years: number[] = []
    filteredTimeline.forEach(item => {
      const matches = item.date_range.match(/\d{4}/g)
      if (matches) {
        matches.forEach(year => years.push(parseInt(year)))
      }
    })
    
    const earliestYear = Math.min(...years)
    const latestYear = Math.max(...years)
    
    // Format states list with proper grammar
    let statesText = ''
    if (uniqueStates.length === 1) {
      statesText = uniqueStates[0]
    } else if (uniqueStates.length === 2) {
      statesText = `${uniqueStates[0]} and ${uniqueStates[1]}`
    } else {
      const lastState = uniqueStates[uniqueStates.length - 1]
      const otherStates = uniqueStates.slice(0, -1).join(', ')
      statesText = `${otherStates}, and ${lastState}`
    }
    
    return {
      count: filteredTimeline.length,
      states: statesText,
      yearRange: earliestYear === latestYear ? `${earliestYear}` : `${earliestYear} to ${latestYear}`
    }
  }, [filteredTimeline])

  const handleStateClick = (state: USAStateAbbreviation | null) => {
    setSelectedState(state)
  }

  return (
    <div className="my-8">
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0">
              <div className="px-4">
                {/* Title with theme color */}
                <h3 
                  className="text-2xl font-bold mb-2 text-center"
                  style={{ color: slide.color }}
                >
                  {slide.title}
                </h3>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Available in {slide.count} state{slide.count !== 1 ? 's' : ''}
                </p>
                
                {/* Map with navigation arrows anchored to it */}
                <div className="relative mb-6">
                  <CategorizedUSAMap
                    highlightedStates={{
                      [slide.id]: slide.states
                    }}
                    colors={{
                      [slide.id]: slide.color
                    }}
                    legend={{
                      [slide.id]: slide.title
                    }}
                    showTooltips={true}
                    legendPosition="bottom"
                    onStateClick={handleStateClick}
                    selectedState={selectedState}
                    onlyHighlightedClickable={false}
                    statesWithData={statesWithData}
                  />
                  
                  {/* Navigation Arrows - positioned relative to map */}
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
                  
                  {/* Selected state indicator */}
                  {selectedState && stateAllowsInstrument && (
                    <div className="text-center mb-4">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
                        <span className="font-medium">
                          Showing events from {STATE_NAMES[selectedState] || selectedState}
                        </span>
                        <button
                          onClick={() => setSelectedState(null)}
                          className="ml-1 hover:text-foreground transition-colors"
                          aria-label="Clear state filter"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  )}
                  
                  {/* State doesn't allow this instrument */}
                  {selectedState && !stateAllowsInstrument && (
                    <div className="mt-8 mb-6 text-center">
                      <h4 
                        className="text-xl font-semibold mb-2"
                        style={{ color: slide.color }}
                      >
                        {STATE_NAMES[selectedState] || selectedState} does not yet allow {slide.title}.
                      </h4>
                      <button
                        onClick={() => setSelectedState(null)}
                        className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
                      >
                        Clear selection
                      </button>
                    </div>
                  )}
                  
                  {/* Timeline Section - only show if state allows this instrument */}
                  {stateAllowsInstrument && timelineSummary && (
                    <div className="mt-8 mb-6">
                      <h4 
                        className="text-xl font-semibold mb-4 text-center"
                        style={{ color: slide.color }}
                      >
                        {selectedState ? (
                          <>
                            {STATE_NAMES[selectedState] || selectedState} has used this {timelineSummary.count} time{timelineSummary.count !== 1 ? 's' : ''}, from {timelineSummary.yearRange}.
                          </>
                        ) : (
                          <>
                            We've used this {timelineSummary.count} time{timelineSummary.count !== 1 ? 's' : ''}, in {timelineSummary.states} from {timelineSummary.yearRange}.
                          </>
                        )}
                      </h4>
                      <DirectDemocracyTimeline 
                        data={filteredTimeline}
                        hideControls={true}
                      />
                    </div>
                  )}
                  
                  {/* No events message - only show if state allows this instrument */}
                  {stateAllowsInstrument && !timelineSummary && (
                    <div className="mt-8 mb-6 text-center">
                      <h4 
                        className="text-xl font-semibold mb-2"
                        style={{ color: slide.color }}
                      >
                        {selectedState ? (
                          <>
                            {STATE_NAMES[selectedState] || selectedState} has never used this.
                          </>
                        ) : (
                          <>
                            We've never used this.
                          </>
                        )}
                      </h4>
                    </div>
                  )}
                  
                  {/* Description */}
                  <div className="max-w-3xl mx-auto mt-8">
                    <p className="text-base text-foreground/90 leading-relaxed">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => scrollTo(index)}
            className={`transition-all rounded-full ${
              index === selectedIndex
                ? 'w-8 h-3'
                : 'w-3 h-3 hover:opacity-80'
            }`}
            style={{
              backgroundColor: index === selectedIndex ? slide.color : '#d1d5db'
            }}
            aria-label={`Go to slide ${index + 1}: ${slide.title}`}
          />
        ))}
        </div>

        {/* Optional: Legend showing current slide */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          {selectedIndex + 1} / {slides.length}
        </div>
      </div>
    )
  }
