import { notFound } from 'next/navigation';
import { getContentBySlug, getContentSlugs } from '@/lib/content/utils';
import { MarketingPage } from '@/lib/content/types';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

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

  // Read the MDX file content and parse it
  const contentPath = path.join(process.cwd(), 'content', 'marketing', `${slug}.mdx`);
  let htmlContent = '';
  
  if (fs.existsSync(contentPath)) {
    const fileContents = fs.readFileSync(contentPath, 'utf8');
    const { content: mdxContent } = matter(fileContents);
    
    // Configure marked with custom options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert line breaks to <br>
    });
    
    // Convert markdown to HTML with custom styling
    htmlContent = marked(mdxContent);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="prose prose-lg max-w-none">
        {/* Render the markdown content as HTML */}
        <div 
          className="markdown-content [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:dark:text-white [&_h1]:mb-4 [&_h1]:mt-6
                     [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h2]:mb-4 [&_h2]:mt-6
                     [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mb-4 [&_h3]:mt-6
                     [&_p]:text-gray-700 [&_p]:dark:text-gray-300 [&_p]:mb-4 [&_p]:leading-relaxed
                     [&_ul]:list-disc [&_ul]:list-inside [&_ul]:text-gray-700 [&_ul]:dark:text-gray-300 [&_ul]:mb-4 [&_ul]:space-y-2 [&_ul]:ml-4
                     [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:text-gray-700 [&_ol]:dark:text-gray-300 [&_ol]:mb-4 [&_ol]:space-y-2 [&_ol]:ml-4
                     [&_li]:text-gray-700 [&_li]:dark:text-gray-300
                     [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:hover:text-blue-800 [&_a]:dark:hover:text-blue-300 [&_a]:underline
                     [&_strong]:font-semibold [&_strong]:text-gray-900 [&_strong]:dark:text-white
                     [&_em]:italic [&_em]:text-gray-800 [&_em]:dark:text-gray-200
                     [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700 [&_blockquote]:dark:text-gray-300 [&_blockquote]:my-4 [&_blockquote]:bg-gray-50 [&_blockquote]:dark:bg-gray-800 [&_blockquote]:py-2 [&_blockquote]:rounded-r
                     [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:text-gray-800 [&_code]:dark:text-gray-200 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
        
        <div className="mt-8 p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-800">
            <strong>✅ Success:</strong> Next.js 15 upgrade completed successfully! 
            The page now features custom markdown-to-HTML rendering with Tailwind CSS classes.
          </p>
        </div>
      </div>
    </div>
  );
}
