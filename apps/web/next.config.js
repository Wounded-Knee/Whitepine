import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  transpilePackages: ['@whitepine/types'],
  webpack: (config) => {
    // Handle monorepo path resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.resolve(__dirname, '../../packages/types/src'),
      '@api': path.resolve(__dirname, '../api/src'),
      '@web': path.resolve(__dirname, '.'),
      // Point @whitepine/types to source files for proper transpilation
      '@whitepine/types': path.resolve(__dirname, '../../packages/types/src'),
    };

    // Provide fallbacks for server-side dependencies in client bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'lodash-es': false,
      'mongoose': false,
    };

    return config;
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  },
});

export default withMDX(nextConfig);
