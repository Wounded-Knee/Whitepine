'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function FOIAMetrics() {
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

