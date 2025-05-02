import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint for the entire project during development
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
