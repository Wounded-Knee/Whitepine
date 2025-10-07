'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Target, Users, BarChart3, Briefcase, Map, Settings } from 'lucide-react';

interface DashboardView {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

const views: DashboardView[] = [
  {
    id: 'default',
    name: 'Command Center',
    description: 'Your primary dashboard with all key metrics',
    icon: <Target className="w-5 h-5" />,
    available: true
  },
  {
    id: 'representatives',
    name: 'My Representatives',
    description: 'Track your elected officials and their positions',
    icon: <Users className="w-5 h-5" />,
    available: true
  },
  {
    id: 'initiatives',
    name: 'My Initiatives',
    description: 'Initiatives you\'re tracking and participating in',
    icon: <Briefcase className="w-5 h-5" />,
    available: true
  },
  {
    id: 'analytics',
    name: 'Impact Analytics',
    description: 'Deep dive into your civic impact over time',
    icon: <BarChart3 className="w-5 h-5" />,
    available: true
  },
  {
    id: 'map',
    name: 'Coalition Map',
    description: 'Visualize your network and team connections',
    icon: <Map className="w-5 h-5" />,
    available: false
  },
  {
    id: 'settings',
    name: 'Metric Settings',
    description: 'Configure your custom civic metrics',
    icon: <Settings className="w-5 h-5" />,
    available: false
  }
];

export function ViewSwitcher() {
  const [open, setOpen] = useState(false);

  const handleViewSelect = (viewId: string) => {
    console.log('Switching to view:', viewId);
    setOpen(false);
    // TODO: Implement view switching logic
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Target className="w-4 h-4" />
          Views
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Dashboard Views</SheetTitle>
          <SheetDescription>
            Switch between different dashboard perspectives
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => view.available && handleViewSelect(view.id)}
              disabled={!view.available}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                view.available
                  ? 'hover:border-blue-500 hover:shadow-md cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              } ${view.id === 'default' ? 'border-blue-500 bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`${view.available ? 'text-blue-600' : 'text-gray-400'}`}>
                  {view.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    {view.name}
                    {view.id === 'default' && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Current</span>
                    )}
                    {!view.available && (
                      <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded">Coming Soon</span>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {view.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

