import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Server External Packages */
  serverExternalPackages: ['firebase-admin'],

  /* Image Optimization */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },

  /* Performance Optimization */
  compress: true,
  poweredByHeader: false,

  /* Production Environment */
  output: 'standalone',
  // @ts-ignore
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://goodzz.co.kr/:path*',
        permanent: true,
        has: [{ type: 'host', value: 'www.goodzz.co.kr' }],
      },
    ];
  },
};

export default nextConfig;
