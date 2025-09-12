/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ['@whitepine/types'],
  webpack: (config) => {
    // Handle monorepo path resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': require('path').resolve(__dirname, '../../packages/types/src'),
      '@api': require('path').resolve(__dirname, '../api/src'),
      '@web': require('path').resolve(__dirname, '.'),
    };
    return config;
  },
};

module.exports = nextConfig;
