import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/tokyotripplan", destination: "/travel/tokyo2026" },
      { source: "/tokyotripplan/:path*", destination: "/travel/tokyo2026/:path*" },
    ];
  },
};

export default nextConfig;
