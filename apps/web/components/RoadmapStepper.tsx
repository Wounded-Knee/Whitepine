import React from 'react';

type StageId = 'q1-concept' | 'q2-design' | 'q3-prototype' | 'q4-pilot';

interface RoadmapStage {
  id: StageId;
  name: string;
  description: string;
  timeline: string;
  trl: string;
  funding: string;
}

const ROADMAP_STAGES: RoadmapStage[] = [
  {
    id: 'q1-concept',
    name: 'Q1: Concept Validation',
    description: 'Concept paper publication, citizen interview synthesis, and crowdfunding campaign. Demonstrate public validation and establish fiscal sponsorship.',
    timeline: 'Months 0–3',
    trl: 'TRL 1 → TRL 2',
    funding: '$25k raised (crowdfunding)'
  },
  {
    id: 'q2-design',
    name: 'Q2: Design & Research',
    description: 'Schema architecture design, UI/UX mockups, comprehensive research report, and first institutional micro-grant. Demonstrate institutional validation.',
    timeline: 'Months 3–6',
    trl: 'TRL 2 → TRL 3',
    funding: '$45k in grants'
  },
  {
    id: 'q3-prototype',
    name: 'Q3: Functional Prototype',
    description: 'Deploy functional prototype with core features. Establish ODI or Knight Foundation partnership. Demonstrate technical feasibility and strategic partnerships.',
    timeline: 'Months 6–9',
    trl: 'TRL 3 → TRL 4',
    funding: '$50k strategic partnerships'
  },
  {
    id: 'q4-pilot',
    name: 'Q4: Pilot Preparation',
    description: 'Submit pilot proposal, publish annual impact report, and build pipeline for next funding round. Position for scaled nonprofit funding and first implementation.',
    timeline: 'Months 9–12',
    trl: 'TRL 4 consolidation',
    funding: 'Series A positioning'
  }
];

// Hardcoded current step
const CURRENT_STEP_ID: StageId = 'q4-pilot';

export function RoadmapStepper() {
  const currentIndex = ROADMAP_STAGES.findIndex(s => s.id === CURRENT_STEP_ID);

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">12-Month Development Roadmap</h2>
        <p className="text-muted-foreground">
          Our quarterly progression from concept to pilot-ready platform
        </p>
      </div>

      {/* Vertical Stepper */}
      <nav aria-label="Roadmap progress">
        <ol className="relative border-s border-border ms-5">
          {ROADMAP_STAGES.map((stage, index) => {
            const isActive = currentIndex === index;
            const isCompleted = index < currentIndex;
            const isFuture = index > currentIndex;
            const isLast = index === ROADMAP_STAGES.length - 1;

            return (
              <li 
                key={stage.name} 
                className={`ms-8 ${!isLast ? 'mb-10' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Circle with number or checkmark */}
                <span 
                  className={`absolute flex items-center justify-center w-10 h-10 rounded-full -start-5 ring-4 ring-background transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground scale-110' 
                      : isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </span>

                {/* Step title */}
                <h3 
                  className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
                    isActive 
                      ? 'text-foreground' 
                      : isFuture 
                      ? 'text-muted-foreground' 
                      : 'text-foreground'
                  }`}
                >
                  {stage.name}
                </h3>

                {/* Step description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stage.description}
                </p>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Stage Details */}
      <div className="mt-8 text-sm text-muted-foreground text-center">
        Step {currentIndex + 1} of {ROADMAP_STAGES.length}
      </div>
    </div>
  );
}
