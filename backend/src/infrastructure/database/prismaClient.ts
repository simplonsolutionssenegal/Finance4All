import { PrismaClient } from '@prisma/client';

// Initialisation avec logging pour debug
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

/**
 * Déclaration d'augmentation pour ajouter le modèle User au client Prisma
 * Cela n'est normalement pas nécessaire car Prisma génère ses types automatiquement
 * mais peut aider dans certains cas où TypeScript ne reconnaît pas les modèles.
 */
declare global {
  namespace PrismaNamespace {
    interface PrismaClient {
      user: {
        findUnique: (args: { where: { id: string } }) => Promise<any>;
        create: (args: { data: any }) => Promise<any>;
        // Ajoutez d'autres méthodes au besoin
      }
    }
  }
}

export type { PrismaClient } from '@prisma/client';
