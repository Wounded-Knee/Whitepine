import Link from 'next/link';
import { getAllContent } from '@/lib/content/utils';
import type { MarketingPage } from '@/lib/content/types';

export default function MarketingPage() {
  const marketingPages = getAllContent('marketing') as MarketingPage[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Marketing
      </h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {marketingPages.map((page) => (
          <article
            key={page.slug}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
              <Link
                href={`/marketing/${page.slug}`}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {page.title}
              </Link>
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {page.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <time dateTime={page.date}>
                {new Date(page.date).toLocaleDateString()}
              </time>
              {page.author && (
                <span>by {page.author}</span>
              )}
            </div>
            
            {page.tags && page.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {page.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      
      {marketingPages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No marketing pages yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
