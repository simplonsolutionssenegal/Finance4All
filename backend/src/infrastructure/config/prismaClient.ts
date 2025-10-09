import { PrismaClient } from '@prisma/client';

// Déclare une variable globale (uniquement en dev) pour éviter de recréer le client en HMR
declare global {
  var __PRISMA__: PrismaClient | undefined;
}

// Choisis les logs que tu veux (évite 'query' en prod si trop verbeux)
const logLevels: ('error' | 'warn' | 'info' | 'query')[] =
  process.env.NODE_ENV === 'development' ? ['error', 'warn', 'query'] : ['error', 'warn'];

export const prisma: PrismaClient = globalThis.__PRISMA__ ?? new PrismaClient({ log: logLevels });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__PRISMA__ = prisma;
}

// (facultatif) re-export du type
export type { PrismaClient } from '@prisma/client';
