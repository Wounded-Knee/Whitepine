import { notFound } from 'next/navigation';
import { getContentBySlug, getContentSlugs } from '@/lib/content/utils';
import type { MarketingPage } from '@/lib/content/types';

interface MarketingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getContentSlugs('marketing');
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: MarketingPageProps) {
  const { slug } = await params;
  const page = getContentBySlug(slug, 'marketing') as MarketingPage;
  
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

export default async function MarketingPageComponent({ params }: MarketingPageProps) {
  const { slug } = await params;
  const page = getContentBySlug(slug, 'marketing') as MarketingPage;

  if (!page) {
    notFound();
  }

  // Import the MDX content dynamically using dynamic import
  let MDXContent;
  try {
    const mdxModule = await import(`@/content/marketing/${slug}.mdx`);
    MDXContent = mdxModule.default;
  } catch (error) {
    console.error(`Failed to load MDX content for ${slug}:`, error);
    notFound();
  }

  return (
    <MDXContent />
  );
}
