import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Whitepine</h1>
        <h2 className="text-2xl font-semibold mb-6 text-muted-foreground">
          The Digital Town Hall
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          The digital town hall. The digital protest. The digital voting booth.
          Join the civic engagement revolution where every citizen is simultaneously
          participant, law-maker, and sheriff in the digital frontier.
        </p>
        <div className="flex gap-4 justify-center">
          {session ? (
            <>
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/marketing/about-us">
                  Learn More
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/marketing/about-us">
                  Learn More
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
