/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push(
      'pino-pretty',
      'lokijs',
      'encoding',
      'porto',
      'porto/internal',
      '@react-native-async-storage/async-storage', // Fixes MetaMask SDK error
      '@metamask/sdk-react-native' // Extra safety
    );
    return config;
  },
};

module.exports = nextConfig;