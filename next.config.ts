import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack 설정 (Next.js 16+)
  turbopack: {},
  // 이미지 최적화 설정
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
