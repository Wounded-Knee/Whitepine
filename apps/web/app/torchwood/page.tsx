import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TorchwoodPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
        What&apos;s Happening
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        This page is coming soon. View active campaigns, current initiatives, and ongoing collective actions.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}

