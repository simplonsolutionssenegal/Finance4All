import { Role } from '@prisma/client';
export interface ListRolesUseCase {
  execute(): Promise<Role[]>;
}