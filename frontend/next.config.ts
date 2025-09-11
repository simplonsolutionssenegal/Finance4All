import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizeCss: false,
  },
  // External packages for server components
  serverExternalPackages: [],
  // Minification utilisée par défaut dans Next.js 15
  output: 'standalone',
  // Réduire les ressources utilisées
  poweredByHeader: false,
  reactStrictMode: false,
  compiler: {
    // Désactiver les transformations React complexes
    emotion: false,
    styledComponents: false,
    reactRemoveProperties: false,
  },
  images: {
    unoptimized: true, // Evite les erreurs d'optimisation des images
  },
};

export default nextConfig;
