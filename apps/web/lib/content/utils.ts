import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ContentItem, BlogPost, MarketingPage } from './types';

const contentDirectory = path.join(process.cwd(), 'content');

export function getAllContent(type?: 'blog' | 'marketing'): ContentItem[] {
  const content: ContentItem[] = [];
  
  if (!type || type === 'blog') {
    const blogDir = path.join(contentDirectory, 'blog');
    if (fs.existsSync(blogDir)) {
      const blogFiles = fs.readdirSync(blogDir);
      blogFiles.forEach((file) => {
        if (file.endsWith('.mdx')) {
          const slug = file.replace(/\.mdx$/, '');
          const filePath = path.join(blogDir, file);
          const fileContents = fs.readFileSync(filePath, 'utf8');
          const { data } = matter(fileContents);
          
          content.push({
            type: 'blog',
            slug,
            title: data.title || '',
            description: data.description || '',
            date: data.date || '',
            author: data.author,
            tags: data.tags || [],
          } as BlogPost);
        }
      });
    }
  }
  
  if (!type || type === 'marketing') {
    const marketingDir = path.join(contentDirectory, 'marketing');
    if (fs.existsSync(marketingDir)) {
      const marketingFiles = fs.readdirSync(marketingDir);
      marketingFiles.forEach((file) => {
        if (file.endsWith('.mdx')) {
          const slug = file.replace(/\.mdx$/, '');
          const filePath = path.join(marketingDir, file);
          const fileContents = fs.readFileSync(filePath, 'utf8');
          const { data } = matter(fileContents);
          
          content.push({
            type: 'marketing',
            slug,
            title: data.title || '',
            description: data.description || '',
            date: data.date || '',
            author: data.author,
            tags: data.tags || [],
          } as MarketingPage);
        }
      });
    }
  }
  
  // Sort by date (newest first)
  return content.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getContentBySlug(slug: string, type: 'blog' | 'marketing'): ContentItem | null {
  const filePath = path.join(contentDirectory, type, `${slug}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContents);
  
  return {
    type,
    slug,
    title: data.title || '',
    description: data.description || '',
    date: data.date || '',
    author: data.author,
    tags: data.tags || [],
  } as ContentItem;
}

export function getContentSlugs(type: 'blog' | 'marketing'): string[] {
  const dir = path.join(contentDirectory, type);
  
  if (!fs.existsSync(dir)) {
    return [];
  }
  
  const files = fs.readdirSync(dir);
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}
