import { notFound } from 'next/navigation';
import { getContentBySlug, getContentSlugs } from '@/lib/content/utils';
import type { BlogPost } from '@/lib/content/types';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getContentSlugs('blog');
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getContentBySlug(slug, 'blog') as BlogPost;
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getContentBySlug(slug, 'blog') as BlogPost;

  if (!post) {
    notFound();
  }

  // Import the MDX content dynamically using dynamic import
  let MDXContent;
  try {
    const mdxModule = await import(`@/content/blog/${slug}.mdx`);
    MDXContent = mdxModule.default;
  } catch (error) {
    console.error(`Failed to load MDX content for ${slug}:`, error);
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {post.author && (
              <span>by {post.author}</span>
            )}
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
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
