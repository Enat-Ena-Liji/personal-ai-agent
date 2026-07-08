import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile Baileys package to avoid ESM issues
  transpilePackages: ['@whiskeysockets/baileys'],
  
  // Add empty turbopack config to silence the warning
  turbopack: {},
  
  // Webpack configuration (only used when running with --webpack)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        child_process: false,
        'fs/promises': false,
        url: false,
        http: false,
        https: false,
        zlib: false,
      };
    }
    return config;
  },
};

export default nextConfig;