import React from 'react';
import type { Session } from 'next-auth';
import { UserBadge } from './UserBadge';
import { ViewSwitcher } from './ViewSwitcher';
import { CivicMetrics } from './CivicMetrics';
import { ActivityByParty } from './ActivityByParty';
import { TeamSentiment } from './TeamSentiment';
import { VoteOutcomes } from './VoteOutcomes';
import { UpcomingInitiatives } from './UpcomingInitiatives';
import { Trending } from './Trending';
import { TeamworkOpportunities } from './TeamworkOpportunities';
import { YourImpact } from './YourImpact';
import { SituationRoom } from './SituationRoom';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  session: Session | null;
}

export function Dashboard({ session }: DashboardProps) {
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Welcome to Whitepine</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          The digital town hall. The digital protest. The digital voting booth.
        </p>
        <Button asChild size="lg">
          <Link href="/auth/signin">
            Sign In to Continue
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with User Badge and View Switcher */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <UserBadge session={session} />
        </div>
        <ViewSwitcher />
      </div>

      <Separator />

      {/* SITUATION ROOM */}
      <section>
        <SituationRoom />
      </section>

      <Separator />

      {/* TOP FOLD - Command Center */}
      <section>
        <h2 className="text-xl font-bold mb-4">Command Center</h2>
        <CivicMetrics />
      </section>

      {/* Live Pulse */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ActivityByParty />
          <TeamSentiment />
        </div>
      </section>

      <Separator />

      {/* MID FOLD - The Work */}
      <section>
        <h2 className="text-xl font-bold mb-4">The Work</h2>
        <div className="space-y-4">
          <VoteOutcomes />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <UpcomingInitiatives />
            <div className="space-y-4">
              <Trending />
              <TeamworkOpportunities />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* LOWER FOLD - Your Impact */}
      <section>
        <h2 className="text-xl font-bold mb-4">Your Impact</h2>
        <YourImpact />
      </section>

      {/* Footer note */}
      <div className="text-center py-8 text-xs text-muted-foreground">
        <p>This is America.com — Keep the peace. Regulate conversation. Cooperation. Progress. Victory for democracy.</p>
      </div>
    </div>
  );
}

