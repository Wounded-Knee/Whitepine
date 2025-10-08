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
        <header className="mb-12 border-b border-border pb-8">
          <h1 
            className="font-serif font-bold text-foreground mb-6 text-balance"
            style={{ 
              fontSize: 'var(--font-size-5xl)', 
              lineHeight: 'var(--line-height-tight)', 
              letterSpacing: 'var(--letter-spacing-tight)' 
            }}
          >
            {post.title}
          </h1>
          
          <div 
            className="flex items-center justify-between text-muted-foreground mb-6"
            style={{ fontSize: 'var(--font-size-sm)' }}
          >
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {post.author && (
              <span className="font-medium">by {post.author}</span>
            )}
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        
        <div className="prose max-w-none">
          <MDXContent />
        </div>
      </article>
    </div>
  );
}
