import dotenv from 'dotenv';

// Charger les variables d'environnement une seule fois
dotenv.config();

// Configuration centralisée utilisée par les tests (les tests vérifient la présence de ces propriétés)
export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  databaseUrl: process.env.DATABASE_URL ?? '',
};

// Optionnel: export par défaut si besoin futur
export default config;