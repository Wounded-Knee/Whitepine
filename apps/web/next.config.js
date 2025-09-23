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
  
  // HMR WebSocket Configuration
  // Custom HMR WebSocket port support
  devIndicators: {
    position: 'bottom-right',
  },
  
  // HMR WebSocket Bug Workaround for Next.js 15.5.3
  // Explicitly allow development origins for HMR connections
  allowedDevOrigins: [
    `localhost:${process.env.DEV_WEB_PORT || 3000}`,
    `127.0.0.1:${process.env.DEV_WEB_PORT || 3000}`, 
    `0.0.0.0:${process.env.DEV_WEB_PORT || 3000}`,
    // Add HMR WebSocket port if different from web port
    ...(process.env.DEV_HMR_PORT && process.env.DEV_HMR_PORT !== process.env.DEV_WEB_PORT ? [
      `localhost:${process.env.DEV_HMR_PORT}`,
      `127.0.0.1:${process.env.DEV_HMR_PORT}`,
      `0.0.0.0:${process.env.DEV_HMR_PORT}`,
    ] : []),
    // Add API port if different from web port
    ...(process.env.DEV_API_PORT && process.env.DEV_API_PORT !== process.env.DEV_WEB_PORT ? [
      `localhost:${process.env.DEV_API_PORT}`,
      `127.0.0.1:${process.env.DEV_API_PORT}`,
      `0.0.0.0:${process.env.DEV_API_PORT}`,
    ] : []),
    // Add any custom domains you use for development
    // `mydev.local:${process.env.DEV_WEB_PORT || 3000}`,
    // '*.mydevnetwork.local'
  ],
  webpack: (config, { dev, isServer }) => {
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

    // Configure HMR WebSocket port for development
    if (dev && !isServer && process.env.DEV_HMR_PORT) {
      config.devServer = {
        ...config.devServer,
        client: {
          ...config.devServer?.client,
          webSocketURL: `ws://localhost:${process.env.DEV_HMR_PORT}/ws`,
        },
      };
    }

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
