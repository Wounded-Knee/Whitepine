'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Clock } from 'lucide-react';

interface VoteOutcome {
  id: string;
  title: string;
  status: 'passed' | 'failed' | 'pending' | 'trending_up' | 'trending_down';
  change?: string;
  timestamp: string;
}

const mockOutcomes: VoteOutcome[] = [
  {
    id: '1',
    title: 'CA Prop 47 - Criminal Justice Reform',
    status: 'trending_up',
    change: '+12%',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    title: 'HR 1234 - Infrastructure Bill',
    status: 'passed',
    timestamp: '5 hours ago'
  },
  {
    id: '3',
    title: 'Senate Resolution 891',
    status: 'trending_down',
    change: '-8%',
    timestamp: '1 day ago'
  },
  {
    id: '4',
    title: 'State Ballot Measure 3',
    status: 'pending',
    timestamp: 'Vote in 3 days'
  },
  {
    id: '5',
    title: 'City Council Motion 45',
    status: 'failed',
    timestamp: '2 days ago'
  }
];

const statusConfig = {
  passed: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Passed' },
  failed: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Failed' },
  pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Pending' },
  trending_up: { icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Rising' },
  trending_down: { icon: TrendingDown, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Falling' }
};

export function VoteOutcomes() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Vote Outcomes</CardTitle>
        <CardDescription>Updates since you last logged in</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockOutcomes.map((outcome) => {
            const config = statusConfig[outcome.status];
            const Icon = config.icon;
            
            return (
              <div
                key={outcome.id}
                className={`flex items-center justify-between p-3 rounded-lg ${config.bgColor} hover:shadow-md transition-shadow cursor-pointer`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{outcome.title}</p>
                    <p className="text-xs text-muted-foreground">{outcome.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {outcome.change && (
                    <span className={`text-sm font-bold ${config.color}`}>
                      {outcome.change}
                    </span>
                  )}
                  <span className={`text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

