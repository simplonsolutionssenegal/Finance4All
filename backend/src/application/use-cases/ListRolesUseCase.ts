import { Role } from '@prisma/client';
export interface ListRolesUseCase {
  execute(page: number, limit: number): Promise<Role[]>;
}