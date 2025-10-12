'use client';

import React from 'react';
import { defineStepper } from '@stepperize/react';

type StageId = 'pilot' | 'early-adoption' | 'regional-growth' | 'national-scale';

interface RoadmapStage {
  id: StageId;
  name: string;
  description: string;
}

const ROADMAP_STAGES: RoadmapStage[] = [
  {
    id: 'pilot',
    name: 'Pilot',
    description: 'Launch initial platform with core features. Test with early adopters in select communities. Validate the cooperative model and gather feedback.'
  },
  {
    id: 'early-adoption',
    name: 'Early Adoption',
    description: 'Expand to multiple cities and counties. Build network effects through grassroots organizing. Establish proof of concept for civic engagement at scale.'
  },
  {
    id: 'regional-growth',
    name: 'Regional Growth',
    description: 'Scale to state-level adoption across multiple regions. Develop partnerships with civic organizations. Create sustainable funding model through cooperative membership.'
  },
  {
    id: 'national-scale',
    name: 'National Scale',
    description: 'Achieve nationwide presence and participation. Become the primary platform for citizen-driven democracy. Fulfill the vision of a connected, empowered citizenry.'
  }
];

const { useStepper } = defineStepper(
  { id: 'pilot' },
  { id: 'early-adoption' },
  { id: 'regional-growth' },
  { id: 'national-scale' }
);

export function RoadmapStepper() {
  const stepper = useStepper();

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Path to National Adoption</h2>
        <p className="text-muted-foreground">
          Our strategic roadmap for bringing participatory democracy to every American
        </p>
      </div>

      {/* Stepper Navigation */}
      <nav aria-label="Roadmap progress" className="mb-8">
        <ol className="flex items-center justify-between w-full">
          {ROADMAP_STAGES.map((stage, index) => {
            const currentIndex = stepper.all.findIndex(s => s.id === stepper.current.id);
            const isActive = stepper.current.id === stage.id;
            const isCompleted = index < currentIndex;
            const isFuture = index > currentIndex;

            return (
              <li key={stage.name} className="flex-1 relative">
                {/* Connector Line */}
                {index < ROADMAP_STAGES.length - 1 && (
                  <div 
                    className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 transition-colors duration-300 ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}

                {/* Step Button */}
                <button
                  onClick={() => stepper.goTo(stage.id)}
                  className="flex flex-col items-center w-full group"
                  aria-current={isActive ? 'step' : undefined}
                >
                  {/* Circle */}
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110' 
                        : isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Label */}
                  <span 
                    className={`mt-2 text-sm font-medium text-center transition-colors duration-300 ${
                      isActive 
                        ? 'text-foreground' 
                        : isFuture 
                        ? 'text-muted-foreground' 
                        : 'text-foreground/80'
                    }`}
                  >
                    {stage.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Current Step Content */}
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        {(() => {
          const currentStage = ROADMAP_STAGES.find(s => s.id === stepper.current.id);
          if (!currentStage) return null;
          return (
            <>
              <h3 className="text-xl font-semibold mb-3">
                {currentStage.name}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {currentStage.description}
              </p>
            </>
          );
        })()}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={stepper.prev}
            disabled={stepper.isFirst}
            className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={stepper.next}
            disabled={stepper.isLast}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Stage Details (Optional) */}
      <div className="mt-6 text-sm text-muted-foreground text-center">
        Step {stepper.all.findIndex(s => s.id === stepper.current.id) + 1} of {ROADMAP_STAGES.length}
      </div>
    </div>
  );
}

