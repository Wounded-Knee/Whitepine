import { ClientDashboard } from '@/components/Dashboard/ClientDashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Require authentication for dashboard
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Sign In Required</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          Please sign in to access your dashboard.
        </p>
        <Button asChild size="lg">
          <Link href="/auth/signin">
            Sign In to Continue
          </Link>
        </Button>
      </div>
    );
  }
  
  // For authenticated users, render the dashboard with client components
  return <ClientDashboard session={session} />;
}

