import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizeCss: false,
  },
  // Déplacement de serverComponentsExternalPackages vers serverExternalPackages
  serverExternalPackages: [],
  // Configuration compatible Next 15
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: false,
  compiler: {
    emotion: false,
    styledComponents: false,
  },
  images: {
    unoptimized: true, // Evite les erreurs d'optimisation des images
  },
};

export default nextConfig;
