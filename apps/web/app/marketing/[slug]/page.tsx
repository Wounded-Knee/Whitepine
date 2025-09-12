import { notFound } from 'next/navigation';
import { getContentBySlug, getContentSlugs } from '@/lib/content/utils';
import { MarketingPage } from '@/lib/content/types';

interface MarketingPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = getContentSlugs('marketing');
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: MarketingPageProps) {
  const page = getContentBySlug(params.slug, 'marketing') as MarketingPage;
  
  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      type: 'website',
    },
  };
}

export default function MarketingPageComponent({ params }: MarketingPageProps) {
  const page = getContentBySlug(params.slug, 'marketing') as MarketingPage;

  if (!page) {
    notFound();
  }

  // Import the MDX content dynamically
  let MDXContent;
  try {
    MDXContent = require(`@/content/marketing/${params.slug}.mdx`).default;
  } catch (error) {
    console.error(`Failed to load MDX content for ${params.slug}:`, error);
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {page.title}
          </h1>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
            <time dateTime={page.date}>
              {new Date(page.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {page.author && (
              <span>by {page.author}</span>
            )}
          </div>
          
          {page.tags && page.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {page.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        
        <div className="prose prose-lg max-w-none">
          <MDXContent />
        </div>
      </article>
    </div>
  );
}
