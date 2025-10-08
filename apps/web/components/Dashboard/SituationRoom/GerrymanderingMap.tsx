import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function GerrymanderingMap() {
  // Simplified state data - in reality would have all 50 states with actual severity scores
  const stateData = [
    { name: 'TX', severity: 9, x: 35, y: 70 },
    { name: 'FL', severity: 8, x: 75, y: 75 },
    { name: 'NC', severity: 9, x: 70, y: 55 },
    { name: 'OH', severity: 8, x: 65, y: 40 },
    { name: 'PA', severity: 7, x: 70, y: 38 },
    { name: 'GA', severity: 8, x: 68, y: 65 },
    { name: 'WI', severity: 7, x: 55, y: 30 },
    { name: 'MI', severity: 6, x: 60, y: 32 },
    { name: 'AZ', severity: 6, x: 20, y: 60 },
    { name: 'CA', severity: 4, x: 8, y: 55 },
    { name: 'NY', severity: 5, x: 75, y: 30 },
    { name: 'IL', severity: 7, x: 55, y: 40 },
    { name: 'VA', severity: 6, x: 72, y: 52 },
    { name: 'MD', severity: 9, x: 73, y: 48 },
    { name: 'LA', severity: 8, x: 50, y: 72 },
    { name: 'AL', severity: 8, x: 60, y: 68 },
    { name: 'TN', severity: 7, x: 60, y: 58 },
    { name: 'MO', severity: 7, x: 50, y: 50 },
  ];
  
  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'bg-red-600';
    if (severity >= 6) return 'bg-orange-500';
    if (severity >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
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
          <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-gray-300 dark:border-gray-700 overflow-hidden">
            {/* Simplified USA outline - in production would use proper map SVG */}
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/30">
              [ USA MAP OUTLINE ]
            </div>
            
            {/* State markers */}
            {stateData.map((state) => (
              <div
                key={state.name}
                className="absolute group cursor-pointer"
                style={{ 
                  left: `${state.x}%`, 
                  top: `${state.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(state.severity)} opacity-80 group-hover:opacity-100 group-hover:scale-150 transition-all`} />
                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {state.name}: {state.severity}/10
                  </div>
                </div>
              </div>
            ))}
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
              18 states critically gerrymandered
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

