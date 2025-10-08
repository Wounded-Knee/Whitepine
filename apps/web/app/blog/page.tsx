import Link from 'next/link';
import { getAllContent } from '@/lib/content/utils';
import type { BlogPost } from '@/lib/content/types';

export default function BlogPage() {
  const blogPosts = getAllContent('blog') as BlogPost[];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 
        className="font-semibold text-foreground mb-12 text-balance"
        style={{ 
          fontFamily: 'var(--font-manrope)',
          fontSize: 'var(--font-size-5xl)', 
          lineHeight: 'var(--line-height-tight)', 
          letterSpacing: 'var(--letter-spacing-tight)' 
        }}
      >
        Blog
      </h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="bg-card rounded-lg border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all"
          >
            <h2 
              className="font-medium text-card-foreground mb-3"
              style={{ 
                fontFamily: 'var(--font-manrope)',
                fontSize: 'var(--font-size-2xl)', 
                lineHeight: 'var(--line-height-snug)' 
              }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="hover:text-primary transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            
            <p 
              className="text-muted-foreground mb-4"
              style={{ lineHeight: 'var(--line-height-relaxed)' }}
            >
              {post.description}
            </p>
            
            <div 
              className="flex items-center justify-between text-muted-foreground"
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString()}
              </time>
              {post.author && (
                <span className="font-medium">by {post.author}</span>
              )}
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
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
      
      {blogPosts.length === 0 && (
        <div className="text-center py-12">
          <p 
            className="text-muted-foreground"
            style={{ fontSize: 'var(--font-size-lg)' }}
          >
            No blog posts yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
