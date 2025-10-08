import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

export function EpsteinFilesStatus() {
  return (
    <Card className="border-2 border-gray-500/50 bg-gray-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5 text-gray-600" />
          Epstein Files Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Full Document Release Status</p>
            <p className="text-xs text-muted-foreground">Public transparency pending</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-red-600 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-8 h-8 bg-red-600 rounded-full animate-ping opacity-75" />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-600">SEALED</p>
              <p className="text-xs text-muted-foreground">Access Denied</p>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          ⚖️ Continued advocacy required for full disclosure
        </div>
      </CardContent>
    </Card>
  );
}

