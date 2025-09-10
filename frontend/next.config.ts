import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizeCss: false,
  },
  // Packages externes pour les composants serveur
  serverExternalPackages: [],
  // Minification utilisée par défaut dans Next.js 15
  output: "standalone",
  // Réduire les ressources utilisées
  poweredByHeader: false,
  reactStrictMode: false,
  compiler: {
    // Désactiver les transformations React complexes
    emotion: false,
    styledComponents: false,
    reactRemoveProperties: false,
  },
};

export default nextConfig;
