'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileText, MapPin, AlertCircle, TrendingUp, Eye, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// National Debt Clock Component
function NationalDebtClock() {
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

// Authoritarianism Meter Component
function AuthoritarianismMeter() {
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

// FOIA Metrics Component
function FOIAMetrics() {
  const [timePeriod, setTimePeriod] = useState('12mo');
  
  // Mock data for redaction trends
  const redactionData = {
    '3mo': [45, 52, 48],
    '6mo': [42, 45, 52, 48, 54, 51],
    '12mo': [38, 42, 45, 52, 48, 54, 51, 58, 62, 59, 64, 61]
  };
  
  const data = redactionData[timePeriod as keyof typeof redactionData];
  const maxValue = Math.max(...data);
  const currentRedactionRate = data[data.length - 1];
  
  return (
    <Card className="border-2 border-blue-500/50 bg-blue-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              FOIA Transparency
            </CardTitle>
            <CardDescription className="mt-1">Disclosure vs. Violations</CardDescription>
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3mo">3 months</SelectItem>
              <SelectItem value="6mo">6 months</SelectItem>
              <SelectItem value="12mo">12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Requests Fulfilled</p>
              <p className="text-xl font-bold text-green-600">1,247</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Violations Reported</p>
              <p className="text-xl font-bold text-red-600">389</p>
            </div>
          </div>
          
          {/* Redaction Rate Graph */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium">Redaction Rate Trend</p>
              <p className="text-xs text-red-600 font-bold">{currentRedactionRate}%</p>
            </div>
            
            <div className="h-24 flex items-end justify-between gap-1">
              {data.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-gradient-to-t from-red-600 to-orange-500 rounded-t transition-all duration-500 hover:opacity-80"
                    style={{ height: `${(value / maxValue) * 100}%` }}
                  />
                  <span className="text-[8px] text-muted-foreground">
                    {timePeriod === '12mo' ? (index + 1) : ''}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              📈 Redactions trending {currentRedactionRate > data[0] ? 'UP' : 'DOWN'} over period
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Gerrymandering Heatmap Component
function GerrymanderingMap() {
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

// Epstein Files Status Light
function EpsteinFilesStatus() {
  return (
    <Card className="border-2 border-gray-500/50 bg-gray-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-gray-600" />
          Epstein Files Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Full Document Release Status</p>
            <p className="text-xs text-muted-foreground">Public transparency pending</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-red-600 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-8 h-8 bg-red-600 rounded-full animate-ping opacity-75" />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-600">SEALED</p>
              <p className="text-xs text-muted-foreground">Access Denied</p>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          ⚖️ Continued advocacy required for full disclosure
        </div>
      </CardContent>
    </Card>
  );
}

// Main Situation Room Component
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



