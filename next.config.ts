import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Remove .domains and use this instead
    remotePatterns: [
      // Add your actual domains here, e.g.:
      // { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: '**' }, // wildcard if needed (less secure)
    ],
  },
  // turbopack: { ... your turbopack options if any ... }, // if you had custom turbo rules
};

export default nextConfig;