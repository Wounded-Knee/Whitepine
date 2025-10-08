import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { ContentItem, BlogPost, MarketingPage } from './types';

const contentDirectory = path.join(process.cwd(), 'content');

function readDirectoryRecursively(dir: string, basePath: string = ''): Array<{slug: string, filePath: string}> {
  const results: Array<{slug: string, filePath: string}> = [];
  
  if (!fs.existsSync(dir)) {
    return results;
  }
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = basePath ? `${basePath}/${item.name}` : item.name;
    
    if (item.isDirectory()) {
      results.push(...readDirectoryRecursively(fullPath, relativePath));
    } else if (item.isFile() && item.name.endsWith('.mdx')) {
      const slug = relativePath.replace(/\.mdx$/, '');
      results.push({ slug, filePath: fullPath });
    }
  }
  
  return results;
}

export function getAllContent(type?: 'blog' | 'marketing'): ContentItem[] {
  const content: ContentItem[] = [];
  
  if (!type || type === 'blog') {
    const blogDir = path.join(contentDirectory, 'blog');
    const blogFiles = readDirectoryRecursively(blogDir);
    
    blogFiles.forEach(({ slug, filePath }) => {
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
    });
  }
  
  if (!type || type === 'marketing') {
    const marketingDir = path.join(contentDirectory, 'marketing');
    const marketingFiles = readDirectoryRecursively(marketingDir);
    
    marketingFiles.forEach(({ slug, filePath }) => {
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
    });
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
  const files = readDirectoryRecursively(dir);
  return files.map(({ slug }) => slug);
}
