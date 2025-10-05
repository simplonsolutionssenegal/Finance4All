import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizeCss: false,
  },
  // Déplacement de serverComponentsExternalPackages vers serverExternalPackages
  serverExternalPackages: [],
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
  async rewrites() {
    return [
      {
        source: '/institutions/show/:id',
        destination: '/institutions/show?id=:id',
      },
    ];
  },
};

export default nextConfig;
