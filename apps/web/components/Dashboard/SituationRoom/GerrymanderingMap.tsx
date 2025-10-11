'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { USAMapWrapper, type USAStateAbbreviation } from '@/components/usa-map';

export function GerrymanderingMap() {
  // Simplified state data - in reality would have all 50 states with actual severity scores
  const stateData: Record<string, number> = {
    TX: 9,
    FL: 8,
    NC: 9,
    OH: 8,
    PA: 7,
    GA: 8,
    WI: 7,
    MI: 6,
    AZ: 6,
    CA: 4,
    NY: 5,
    IL: 7,
    VA: 6,
    MD: 9,
    LA: 8,
    AL: 8,
    TN: 7,
    MO: 7,
  };
  
  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return '#dc2626'; // red-600
    if (severity >= 6) return '#f97316'; // orange-500
    if (severity >= 4) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const customStates = useMemo(() => {
    const states: Record<string, any> = {};
    
    Object.entries(stateData).forEach(([state, severity]) => {
      states[state] = {
        fill: getSeverityColor(severity),
        stroke: '#6b7280', // gray-500
        tooltip: {
          enabled: true,
          render: () => (
            <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {state}: {severity}/10
            </div>
          ),
        },
      };
    });
    
    return states;
  }, []);
  
  const criticalCount = Object.values(stateData).filter(s => s >= 6).length;
  
  return (
    <Card className="border-2 border-purple-500/50 bg-purple-500/5 col-span-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-purple-600" />
          Gerrymandering Severity Map
        </CardTitle>
        <CardDescription>Electoral district manipulation by state</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Visualization */}
          <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-gray-300 dark:border-gray-700 overflow-hidden p-4">
            <USAMapWrapper
              customStates={customStates}
              defaultFill="#e5e7eb"
              defaultStroke="#9ca3af"
              enableHover={true}
              showTooltips={true}
              height={300}
            />
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Low (1-3)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Medium (4-5)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>High (6-7)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span>Severe (8-10)</span>
              </div>
            </div>
            <div className="text-muted-foreground">
              {criticalCount} states critically gerrymandered
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

