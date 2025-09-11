import { PrismaClient } from '@prisma/client';
import { Role } from '../../domain/entities/Role';
import { RoleRepository } from '../../domain/repositories/RoleRepository';

const prisma = new PrismaClient();

export class PrismaRoleRepository implements RoleRepository {
  async getAllRoles(): Promise<Role[]> {
    const roles = await prisma.role.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return roles.map(role => new Role(
      role.id,
      role.name,
      role.createdAt,
      role.updatedAt,
    ));
  }
}
