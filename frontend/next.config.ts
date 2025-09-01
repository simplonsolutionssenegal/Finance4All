import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizeCss: false,
    // Limiter les fonctionnalités expérimentales qui pourraient causer l'erreur de bus
    serverComponentsExternalPackages: [],
  },
  // Utiliser un compilateur plus stable
  swcMinify: false,
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
