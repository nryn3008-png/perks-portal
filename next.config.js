/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Image optimization for perk logos/images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.getproven.com',
      },
      // TODO: Add other allowed image domains as needed
    ],
  },

  // Environment variables exposed to the browser (prefix with NEXT_PUBLIC_)
  // Server-only env vars (like API tokens) should NOT be listed here
}

module.exports = nextConfig
