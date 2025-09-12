import Link from 'next/link';
import { getAllContent } from '@/lib/content/utils';
import { BlogPost } from '@/lib/content/types';

export default function BlogPage() {
  const blogPosts = getAllContent('blog') as BlogPost[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Blog
      </h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
              <Link
                href={`/blog/${post.slug}`}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {post.title}
              </Link>
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {post.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString()}
              </time>
              {post.author && (
                <span>by {post.author}</span>
              )}
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
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
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No blog posts yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
