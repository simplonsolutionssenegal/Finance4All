import dotenv from 'dotenv';

// Charger les variables d'environnement une seule fois
dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY ?? '',
    secretKey: process.env.CLERK_SECRET_KEY ?? '',
  },
};
