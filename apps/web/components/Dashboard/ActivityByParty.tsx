'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface PartyActivity {
  name: string;
  count: number;
  color: string;
  percentage: number;
}

const mockPartyData: PartyActivity[] = [
  { name: 'Democratic', count: 1247, color: 'bg-blue-500', percentage: 42 },
  { name: 'Republican', count: 1089, color: 'bg-red-500', percentage: 37 },
  { name: 'Independent', count: 421, color: 'bg-purple-500', percentage: 14 },
  { name: 'Green', count: 127, color: 'bg-green-500', percentage: 4 },
  { name: 'Others', count: 89, color: 'bg-gray-500', percentage: 3 }
];

export function ActivityByParty() {
  const [pulse, setPulse] = useState(false);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalActive = mockPartyData.reduce((sum, party) => sum + party.count, 0);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className={`w-5 h-5 ${pulse ? 'text-green-500' : ''}`} />
              Activity by Party
            </CardTitle>
            <CardDescription>Live pulse • {totalActive.toLocaleString()} active now</CardDescription>
          </div>
          <div className={`w-2 h-2 rounded-full ${pulse ? 'bg-green-500' : 'bg-gray-400'} transition-colors`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockPartyData.map((party) => (
            <div key={party.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{party.name}</span>
                <span className="text-muted-foreground">
                  {party.count.toLocaleString()} ({party.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${party.color} transition-all duration-500`}
                  style={{ width: `${party.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

