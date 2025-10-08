import React from 'react';
import { AlertCircle } from 'lucide-react';
import { NationalDebtClock } from './SituationRoom/NationalDebtClock';
import { AuthoritarianismMeter } from './SituationRoom/AuthoritarianismMeter';
import { FOIAMetrics } from './SituationRoom/FOIAMetrics';
import { GerrymanderingMap } from './SituationRoom/GerrymanderingMap';
import { EpsteinFilesStatus } from './SituationRoom/EpsteinFilesStatus';

export function SituationRoom() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <div>
          <h2 className="text-2xl font-bold">Situation Room</h2>
          <p className="text-sm text-muted-foreground">Critical national metrics requiring attention</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NationalDebtClock />
        <AuthoritarianismMeter />
        <FOIAMetrics />
      </div>
      
      <GerrymanderingMap />
      
      <EpsteinFilesStatus />
    </div>
  );
}
