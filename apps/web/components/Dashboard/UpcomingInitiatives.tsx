'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, TrendingUp, Users, MessageSquare } from 'lucide-react';

interface Initiative {
  id: string;
  title: string;
  author: string;
  engagement: number;
  replies: number;
  supporters: number;
  likelihood: number; // 0-100
  timeframe: string;
}

const mockInitiatives: Initiative[] = [
  {
    id: '1',
    title: 'Community Solar Grid Implementation Plan',
    author: 'Sarah Chen',
    engagement: 847,
    replies: 234,
    supporters: 612,
    likelihood: 87,
    timeframe: '2h'
  },
  {
    id: '2',
    title: 'Local Ranked-Choice Voting Initiative',
    author: 'Marcus Williams',
    engagement: 1203,
    replies: 456,
    supporters: 891,
    likelihood: 92,
    timeframe: '5h'
  },
  {
    id: '3',
    title: 'Municipal Broadband as Public Utility',
    author: 'Alex Rodriguez',
    engagement: 623,
    replies: 178,
    supporters: 445,
    likelihood: 74,
    timeframe: '1d'
  },
  {
    id: '4',
    title: 'Transit-Oriented Development Zoning Reform',
    author: 'Jamie Park',
    engagement: 892,
    replies: 312,
    supporters: 567,
    likelihood: 81,
    timeframe: '18h'
  }
];

export function UpcomingInitiatives() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-600" />
          Up & Coming Initiatives
        </CardTitle>
        <CardDescription>Posts showing signs of becoming initiatives</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockInitiatives.map((initiative) => (
            <div
              key={initiative.id}
              className="p-4 border rounded-lg hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{initiative.title}</h4>
                  <p className="text-xs text-muted-foreground">by {initiative.author} • {initiative.timeframe} ago</p>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-bold">{initiative.likelihood}%</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {initiative.replies}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {initiative.supporters}
                </div>
                <div className="flex-1" />
                <div className="text-xs font-medium text-green-600">
                  Initiative Likelihood
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${initiative.likelihood}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

