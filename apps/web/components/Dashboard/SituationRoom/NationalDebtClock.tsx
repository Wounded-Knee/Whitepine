import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function NationalDebtClock() {
  // Simulated debt counter (in reality, this would be fetched from an API)
  const nationalDebt = 36247891234567; // $36.2 trillion
  const debtPerCitizen = 107234;
  
  return (
    <Card className="border-2 border-red-500/50 bg-red-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-red-600" />
          National Debt Clock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total National Debt</p>
            <p className="text-2xl font-bold text-red-600 font-mono tracking-tight">
              ${nationalDebt.toLocaleString()}
            </p>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Debt per Citizen</p>
            <p className="text-lg font-semibold text-red-500 font-mono">
              ${debtPerCitizen.toLocaleString()}
            </p>
          </div>
          <div className="text-xs text-muted-foreground pt-1">
            ⚠️ Increasing at ~$1M per 30 seconds
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

