import { notFound } from 'next/navigation';
import { getContentBySlug, getContentSlugs } from '@/lib/content/utils';
import type { MarketingPage } from '@/lib/content/types';

interface MarketingPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const slugs = getContentSlugs('marketing');
  return slugs.map((slug) => ({
    slug: slug.split('/'),
  }));
}

export async function generateMetadata({ params }: MarketingPageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');
  
  // Try direct path first, then index
  let page = getContentBySlug(slugPath, 'marketing') as MarketingPage;
  
  if (!page) {
    // Try index file
    const indexPath = `${slugPath}/index`;
    page = getContentBySlug(indexPath, 'marketing') as MarketingPage;
  }
  
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
  const slugPath = slug.join('/');
  
  // Try direct path first, then index
  let page = getContentBySlug(slugPath, 'marketing') as MarketingPage;
  let actualPath = slugPath;
  
  if (!page) {
    // Try index file
    const indexPath = `${slugPath}/index`;
    page = getContentBySlug(indexPath, 'marketing') as MarketingPage;
    if (page) {
      actualPath = indexPath;
    }
  }

  if (!page) {
    notFound();
  }

  // Import the MDX content dynamically using dynamic import
  let MDXContent;
  try {
    const mdxModule = await import(`@/content/marketing/${actualPath}.mdx`);
    MDXContent = mdxModule.default;
  } catch (error) {
    console.error(`Failed to load MDX content for ${actualPath}:`, error);
    notFound();
  }

  return (
    <MDXContent />
  );
}

