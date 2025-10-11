import { notFound } from 'next/navigation';
import { getContentBySlug, getContentSlugs } from '@/lib/content/utils';
import type { MarketingPage } from '@/lib/content/types';
import { getMdxComponent } from '@/lib/content/mdx-components';

interface MarketingPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const slugs = getContentSlugs('marketing');
  return slugs.map((slug) => {
    // Remove /index suffix from URLs for cleaner paths
    const cleanSlug = slug.endsWith('/index') ? slug.slice(0, -6) : slug;
    return {
      slug: cleanSlug.split('/'),
    };
  });
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

  // Get the MDX component from the pre-imported map
  const MDXContent = getMdxComponent(actualPath);
  
  if (!MDXContent) {
    console.error(`No MDX component found for path: ${actualPath}`);
    notFound();
  }

  return (
    <MDXContent />
  );
}

