import Link from 'next/link';
import { getAllContent } from '@/lib/content/utils';
import type { MarketingPage } from '@/lib/content/types';

export default function MarketingPage() {
  const marketingPages = getAllContent('marketing') as MarketingPage[];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 
        className="font-medium text-foreground mb-12 text-balance"
        style={{ 
          fontFamily: 'var(--font-ubuntu)',
          fontSize: 'var(--font-size-5xl)', 
          lineHeight: 'var(--line-height-tight)', 
          letterSpacing: 'var(--letter-spacing-tight)' 
        }}
      >
        Marketing
      </h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {marketingPages.map((page) => (
          <article
            key={page.slug}
            className="bg-card rounded-lg border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all"
          >
            <h2 
              className="font-normal text-card-foreground mb-3"
              style={{ 
                fontFamily: 'var(--font-ubuntu)',
                fontSize: 'var(--font-size-2xl)', 
                lineHeight: 'var(--line-height-snug)' 
              }}
            >
              <Link
                href={`/marketing/${page.slug}`}
                className="hover:text-primary transition-colors"
              >
                {page.title}
              </Link>
            </h2>
            
            <p 
              className="text-muted-foreground mb-4"
              style={{ lineHeight: 'var(--line-height-relaxed)' }}
            >
              {page.description}
            </p>
            
            <div 
              className="flex items-center justify-between text-muted-foreground"
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              <time dateTime={page.date}>
                {new Date(page.date).toLocaleDateString()}
              </time>
              {page.author && (
                <span className="font-medium">by {page.author}</span>
              )}
            </div>
            
            {page.tags && page.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {page.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
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
