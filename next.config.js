/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint for the entire project during development
    ignoreDuringBuilds: true,
  },

  // Add staleTimes configuration for Next.js 15
  // This configures client-side caching and reuse of page segments
  experimental: {
    staleTimes: {
      // Cache static content longer (3 minutes)
      static: 180,
      // Cache dynamic content (with user-specific data) for a shorter time (30 seconds)
      dynamic: 30,
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

module.exports = nextConfig;
