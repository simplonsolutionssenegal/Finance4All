// src/interfaces/controllers/role.controller.ts
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@/middleware/error.middleware';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export class RoleController {
  static readonly listRole = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const roles = await prisma.role.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true, updatedAt: true },
      });

      res.status(200).json({
        status: 'success',
        results: roles.length,
        data: { roles },
      });
    }
  );
}
