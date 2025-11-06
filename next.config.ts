import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for pino-pretty in client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Ignore pino-pretty in client builds
    config.externals = config.externals || [];
    config.externals.push('pino-pretty');
    
    return config;
  },
};

export default nextConfig;
