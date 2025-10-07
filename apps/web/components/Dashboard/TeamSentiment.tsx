'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Zap, Target } from 'lucide-react';

type Mood = 'energized' | 'focused' | 'determined';

const moodConfig = {
  energized: {
    icon: <Zap className="w-6 h-6" />,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    label: 'Energized',
    description: 'High activity, rapid engagement'
  },
  focused: {
    icon: <Target className="w-6 h-6" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Focused',
    description: 'Deep analysis, deliberate action'
  },
  determined: {
    icon: <Heart className="w-6 h-6" />,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Determined',
    description: 'Committed, pushing forward'
  }
};

export function TeamSentiment() {
  const [currentMood, setCurrentMood] = useState<Mood>('determined');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate live sentiment updates
  useEffect(() => {
    const interval = setInterval(() => {
      const moods: Mood[] = ['energized', 'focused', 'determined'];
      setCurrentMood(moods[Math.floor(Math.random() * moods.length)]);
      setLastUpdate(new Date());
    }, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const config = moodConfig[currentMood];
  const secondsAgo = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Team Sentiment</CardTitle>
        <CardDescription>Last 60 seconds • {secondsAgo}s ago</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`flex flex-col items-center justify-center p-6 rounded-lg ${config.bgColor}`}>
          <div className={config.color}>
            {config.icon}
          </div>
          <h3 className="text-xl font-bold mt-3">{config.label}</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {config.description}
          </p>
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Based on 847 team members
        </div>
      </CardContent>
    </Card>
  );
}

