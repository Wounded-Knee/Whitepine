'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Hash } from 'lucide-react';

interface TrendingTopic {
  id: string;
  topic: string;
  mentions: number;
  trend: number; // percentage change
  context: string;
}

const mockTrending: TrendingTopic[] = [
  {
    id: '1',
    topic: 'Climate Action Now',
    mentions: 2847,
    trend: 156,
    context: 'Your network'
  },
  {
    id: '2',
    topic: 'Ranked Choice Voting',
    mentions: 1923,
    trend: 89,
    context: 'Coalition partners'
  },
  {
    id: '3',
    topic: 'Universal Healthcare',
    mentions: 1456,
    trend: 67,
    context: 'National discourse'
  },
  {
    id: '4',
    topic: 'Municipal Broadband',
    mentions: 892,
    trend: 142,
    context: 'Local activists'
  },
  {
    id: '5',
    topic: 'Housing First Policy',
    mentions: 734,
    trend: 51,
    context: 'Your network'
  }
];

export function Trending() {
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          Trending
        </CardTitle>
        <CardDescription>Talking points in your ecosystem</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTrending.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {item.topic}
                    </h4>
                    <p className="text-xs text-muted-foreground">{item.context}</p>
                  </div>
                  <div className="flex items-center gap-1 text-orange-600 flex-shrink-0">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-bold">+{item.trend}%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.mentions.toLocaleString()} mentions
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

