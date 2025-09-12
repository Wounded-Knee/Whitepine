import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-border rounded-lg p-8">
        <div className="text-center">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to White Pine
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            A modern Next.js application with TypeScript, App Router, MDX support, and shadcn/ui
          </p>
          
          {/* Navigation Links with shadcn/ui Button */}
          <div className="mb-8 flex justify-center space-x-4">
            <Button asChild>
              <Link href="/blog">
                View Blog
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/marketing">
                Marketing Pages
              </Link>
            </Button>
            <Button variant="outline">
              Test Button
            </Button>
            <Button variant="destructive" size="sm">
              Destructive
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-card rounded-lg shadow p-6 border">
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Features
              </h2>
              <ul className="text-muted-foreground space-y-2">
                <li>✅ Next.js 14 with App Router</li>
                <li>✅ TypeScript with strict mode</li>
                <li>✅ MDX support for content</li>
                <li>✅ Monorepo structure with pnpm</li>
                <li>✅ Shared types package</li>
                <li>✅ ESLint and Prettier configured</li>
                <li>✅ Tailwind CSS ready</li>
                <li>✅ shadcn/ui components</li>
              </ul>
            </div>
            <div className="bg-card rounded-lg shadow p-6 border">
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Content Management
              </h2>
              <p className="text-muted-foreground mb-4">
                Content is managed through MDX files in the <code className="bg-muted px-2 py-1 rounded text-sm">
                  apps/web/content/
                </code> directory.
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>📝 Blog posts in <code className="bg-muted px-2 py-1 rounded text-sm">content/blog/</code></li>
                <li>📄 Marketing pages in <code className="bg-muted px-2 py-1 rounded text-sm">content/marketing/</code></li>
                <li>🎨 Custom MDX components with Tailwind styling</li>
                <li>📊 Automatic metadata extraction from frontmatter</li>
              </ul>
            </div>
            <div className="bg-card rounded-lg shadow p-6 border">
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Development
              </h2>
              <p className="text-muted-foreground">
                Run <code className="bg-muted px-2 py-1 rounded text-sm">
                  pnpm dev
                </code>{' '}
                to start the development server on port 3001.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
