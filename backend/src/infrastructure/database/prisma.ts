// src/infrastructure/database/prisma.ts
import { PrismaClient } from '@prisma/client';

// Single Prisma client instance. Explicit typing avoids implicit any complaints.
export const prisma: PrismaClient = new PrismaClient();
