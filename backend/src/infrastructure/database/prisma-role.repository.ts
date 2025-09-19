import { PrismaClient } from '@prisma/client';
import { RoleRepository } from '@/domain/repositories/RoleRepository';
import { Role } from '@/domain/entities/Role';

const prisma = new PrismaClient();

export class PrismaRoleRepository implements RoleRepository {
  // constructor(private readonly prisma: PrismaClient) {}

   async findAll(page: number, limit: number): Promise<Role[]> {
    const skip = (page - 1) * limit;

    const rows = await prisma.role.findMany({
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    });

    return rows.map(r => new Role(r.id, r.name, r.createdAt, r.updatedAt));
  }
}
