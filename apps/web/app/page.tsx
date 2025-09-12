import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to White Pine
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            A modern Next.js application with TypeScript, App Router, and MDX support
          </p>
          
          {/* Navigation Links */}
          <div className="mb-8 flex justify-center space-x-4">
            <Link
              href="/blog"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View Blog
            </Link>
            <Link
              href="/marketing"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Marketing Pages
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Features
              </h2>
              <ul className="text-gray-600 space-y-2">
                <li>✅ Next.js 14 with App Router</li>
                <li>✅ TypeScript with strict mode</li>
                <li>✅ MDX support for content</li>
                <li>✅ Monorepo structure with pnpm</li>
                <li>✅ Shared types package</li>
                <li>✅ ESLint and Prettier configured</li>
                <li>✅ Tailwind CSS ready</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Content Management
              </h2>
              <p className="text-gray-600 mb-4">
                Content is managed through MDX files in the <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  apps/web/content/
                </code> directory.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>📝 Blog posts in <code className="bg-gray-100 px-2 py-1 rounded text-sm">content/blog/</code></li>
                <li>📄 Marketing pages in <code className="bg-gray-100 px-2 py-1 rounded text-sm">content/marketing/</code></li>
                <li>🎨 Custom MDX components with Tailwind styling</li>
                <li>📊 Automatic metadata extraction from frontmatter</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Development
              </h2>
              <p className="text-gray-600">
                Run <code className="bg-gray-100 px-2 py-1 rounded text-sm">
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
