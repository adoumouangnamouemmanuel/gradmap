import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local IP for testing on mobile device
  allowedDevOrigins: ['172.17.0.106', 'http://172.17.0.106:3000'],
};

export default nextConfig;
