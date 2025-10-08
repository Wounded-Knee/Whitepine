import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export function AuthoritarianismMeter() {
  const level = 68; // 0-100 scale
  const threatLevel = level > 70 ? 'CRITICAL' : level > 50 ? 'HIGH' : level > 30 ? 'MODERATE' : 'LOW';
  const colorClass = level > 70 ? 'text-red-600' : level > 50 ? 'text-orange-600' : level > 30 ? 'text-yellow-600' : 'text-green-600';
  const bgColorClass = level > 70 ? 'bg-red-600' : level > 50 ? 'bg-orange-600' : level > 30 ? 'bg-yellow-600' : 'bg-green-600';
  
  return (
    <Card className="border-2 border-orange-500/50 bg-orange-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldAlert className="w-5 h-5 text-orange-600" />
          Authoritarianism Index
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current Threat Level</span>
            <span className={`text-sm font-bold ${colorClass}`}>{threatLevel}</span>
          </div>
          
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative">
              <div
                className={`h-full ${bgColorClass} transition-all duration-1000 flex items-center justify-end pr-3`}
                style={{ width: `${level}%` }}
              >
                <span className="text-white font-bold text-sm">{level}%</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Free</span>
              <span>Authoritarian</span>
            </div>
          </div>
          
          <div className="text-xs space-y-1 pt-2 border-t">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Executive Overreach:</span>
              <span className="font-medium text-orange-600">High</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Surveillance State:</span>
              <span className="font-medium text-red-600">Critical</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Press Freedom:</span>
              <span className="font-medium text-yellow-600">Moderate</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

