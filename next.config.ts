import type { NextConfig } from "next";

// Build target: 'web' for Vercel, 'desktop' for Tauri
const buildTarget = process.env.BUILD_TARGET || 'web';
const isDesktop = buildTarget === 'desktop';

const nextConfig: NextConfig = {
  // Tauri requires static export, Web version uses dynamic rendering
  output: isDesktop ? 'export' : undefined,

  // Tauri requires image optimization to be disabled
  images: isDesktop ? { unoptimized: true } : undefined,

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Prisma only works in web version (Node.js server)
  serverExternalPackages: isDesktop ? undefined : ['@prisma/client'],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
