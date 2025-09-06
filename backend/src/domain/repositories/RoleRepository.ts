import { Role } from "@prisma/client";

export interface RoleRepository {
  findAll(): Promise<Role[]>;
}