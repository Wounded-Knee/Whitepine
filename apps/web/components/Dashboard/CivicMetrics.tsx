'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Shield, Users, Signal } from 'lucide-react';

interface Metric {
  id: string;
  name: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

const mockMetrics: Metric[] = [
  {
    id: 'discourse',
    name: 'Discourse Quality',
    value: '87%',
    trend: 'up',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-green-600'
  },
  {
    id: 'coalition',
    name: 'Coalition Strength',
    value: 'High',
    trend: 'stable',
    icon: <Users className="w-5 h-5" />,
    color: 'text-blue-600'
  },
  {
    id: 'misinfo',
    name: 'Misinformation Risk',
    value: 'Low',
    trend: 'down',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-emerald-600'
  },
  {
    id: 'signal',
    name: 'Signal/Noise Ratio',
    value: '8:1',
    trend: 'up',
    icon: <Signal className="w-5 h-5" />,
    color: 'text-purple-600'
  }
];

export function CivicMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockMetrics.map((metric) => (
        <Card key={metric.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.name}
            </CardTitle>
            <div className={metric.color}>
              {metric.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.trend && (
              <p className="text-xs text-muted-foreground">
                {metric.trend === 'up' && '↑ Improving'}
                {metric.trend === 'down' && '↓ Declining'}
                {metric.trend === 'stable' && '→ Stable'}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

