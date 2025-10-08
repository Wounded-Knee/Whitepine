import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Users, MessageCircle, Target, TrendingUp } from 'lucide-react';

interface ImpactMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const mockImpact: ImpactMetric[] = [
  {
    id: 'positions',
    label: 'Positions Adopted',
    value: 234,
    change: 12,
    icon: <Users className="w-4 h-4" />,
    color: 'text-blue-600'
  },
  {
    id: 'conversations',
    label: 'Conversations Shifted',
    value: 67,
    change: 8,
    icon: <MessageCircle className="w-4 h-4" />,
    color: 'text-green-600'
  },
  {
    id: 'initiatives',
    label: 'Initiatives Moved',
    value: 12,
    change: 3,
    icon: <Target className="w-4 h-4" />,
    color: 'text-purple-600'
  },
  {
    id: 'quality',
    label: 'Discourse Quality Score',
    value: 87,
    change: 5,
    icon: <Award className="w-4 h-4" />,
    color: 'text-orange-600'
  }
];

export function YourImpact() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Your Impact
        </CardTitle>
        <CardDescription>Personal and team contributions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {mockImpact.map((metric) => (
            <div
              key={metric.id}
              className="p-4 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={metric.color}>
                  {metric.icon}
                </div>
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  +{metric.change}
                </div>
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{metric.label}</div>
            </div>
          ))}
        </div>
        
        {/* Traditional metrics - tiny at bottom */}
        <div className="pt-4 border-t text-center">
          <p className="text-[10px] text-muted-foreground">
            Followers: 1,247 | Following: 892 | Posts: 523 | Replies: 1,834
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

