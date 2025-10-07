import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function JoinPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
        Join Whitepine
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        This page is coming soon. Join our platform to participate in collective action and make your voice heard.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}

