import { Role } from '@prisma/client';

export interface RoleRepository {
  findAll(page: number, limit: number): Promise<Role[]>;
}