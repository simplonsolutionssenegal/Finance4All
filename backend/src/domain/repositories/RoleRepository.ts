import { Role } from '../entities/Role';

export interface RoleRepository {
  getAllRoles(): Promise<Role[]>;
}
