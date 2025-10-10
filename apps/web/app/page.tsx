import { ClientDashboard } from '@/components/Dashboard/ClientDashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  // Server-render the welcome message for SEO
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to Whitepine</h1>
        <h2 className="text-2xl font-semibold mb-6 text-muted-foreground">
          The Digital Town Hall
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          The digital town hall. The digital protest. The digital voting booth.
          Join the civic engagement revolution where every citizen is simultaneously
          participant, law-maker, and sheriff in the digital frontier.
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
