'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Users } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  deadline: string;
  participants: number;
  needed: number;
  action: string;
}

const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'City Council Public Comment - Housing Bill',
    description: 'Need coordinated voices for tonight\'s public comment period',
    urgency: 'high',
    deadline: '6 hours',
    participants: 23,
    needed: 50,
    action: 'Sign Up'
  },
  {
    id: '2',
    title: 'State Rep Phone Campaign',
    description: 'Call representatives about education funding vote',
    urgency: 'high',
    deadline: '2 days',
    participants: 156,
    needed: 500,
    action: 'Join Campaign'
  },
  {
    id: '3',
    title: 'Coalition Strategy Session',
    description: 'Planning meeting for climate initiative coordination',
    urgency: 'medium',
    deadline: '4 days',
    participants: 47,
    needed: 100,
    action: 'RSVP'
  }
];

const urgencyConfig = {
  high: { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', label: 'URGENT' },
  medium: { color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', label: 'Important' },
  low: { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', label: 'Upcoming' }
};

export function TeamworkOpportunities() {
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Teamwork Opportunities
        </CardTitle>
        <CardDescription>Urgent collective actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockOpportunities.map((opp) => {
            const config = urgencyConfig[opp.urgency];
            const progress = (opp.participants / opp.needed) * 100;
            
            return (
              <div
                key={opp.id}
                className={`p-4 border-2 rounded-lg ${config.borderColor} ${config.bgColor}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {opp.deadline}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{opp.title}</h4>
                    <p className="text-xs text-muted-foreground">{opp.description}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {opp.participants} / {opp.needed} participants
                    </span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${opp.urgency === 'high' ? 'bg-red-500' : opp.urgency === 'medium' ? 'bg-orange-500' : 'bg-blue-500'} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <Button size="sm" className="w-full" variant={opp.urgency === 'high' ? 'default' : 'outline'}>
                    {opp.action}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

