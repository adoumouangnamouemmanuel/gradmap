import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local IP for testing on mobile device
  allowedDevOrigins: ['172.17.0.123', 'http://172.17.0.123:3000'],
  experimental: {
    // Allow larger server action payloads for file uploads (base64 adds ~33%)
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
