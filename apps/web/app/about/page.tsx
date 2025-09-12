export default function AboutPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            This is a Next.js application built with TypeScript and the App Router.
            It's part of a monorepo structure using pnpm workspaces.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Technology Stack
          </h2>
          <ul className="text-gray-600 space-y-2">
            <li>• Next.js 14 with App Router</li>
            <li>• TypeScript with strict configuration</li>
            <li>• Tailwind CSS for styling</li>
            <li>• ESLint and Prettier for code quality</li>
            <li>• pnpm for package management</li>
            <li>• Monorepo architecture</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
