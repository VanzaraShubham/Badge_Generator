import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', '*.devtunnels.ms', '*.ngrok-free.app', '*.ngrok.io'],
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
