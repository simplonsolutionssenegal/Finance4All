import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration compatible Next 15
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: false,
  compiler: {
    emotion: false,
    styledComponents: false,
  },
};

export default nextConfig;
