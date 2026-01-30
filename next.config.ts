import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages용 static export
  output: 'export',
  // Turbopack 설정 (Next.js 16+)
  turbopack: {},
  // 이미지 최적화 설정 (static export에서는 unoptimized 필요)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
