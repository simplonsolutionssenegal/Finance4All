import { PrismaClient } from '@prisma/client';
import { RoleRepository } from '@/domain/repositories/RoleRepository';
import { Role } from '@/domain/entities/Role';

const prisma = new PrismaClient();

export class PrismaRoleRepository implements RoleRepository {
  // constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Role[]> {
    const rows = await prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
    return rows.map(r => new Role(r.id, r.name, r.createdAt, r.updatedAt));
  }
}
