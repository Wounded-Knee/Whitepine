'use client';

import { SessionProvider } from 'next-auth/react';
import { ReduxProvider } from '@/store/ReduxProvider';
import { Dashboard } from './index';
import type { Session } from 'next-auth';

interface ClientDashboardProps {
  session: Session | null;
}

/**
 * Client-side wrapper for Dashboard components that need Redux/session hooks.
 * This keeps the main Dashboard as a server component for better SEO.
 */
export function ClientDashboard({ session }: ClientDashboardProps) {
  return (
    <SessionProvider session={session}>
      <ReduxProvider>
        <Dashboard session={session} />
      </ReduxProvider>
    </SessionProvider>
  );
}

