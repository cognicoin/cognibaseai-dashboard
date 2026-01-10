/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: false,
  },
  // IMPORTANT: do NOT use output: 'export'
  // output: 'export',
};

module.exports = nextConfig;
