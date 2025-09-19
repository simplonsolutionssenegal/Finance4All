import { ListRolesUseCase } from '@/application/use-cases/ListRolesUseCase';
import { RoleRepository } from '@/domain/repositories/RoleRepository';
import { Role } from '@/domain/entities/Role';

export class ListRolesUseCaseImpl implements ListRolesUseCase {
  constructor(private readonly roleRepo: RoleRepository) {}

  async execute(page: number, limit: number): Promise<Role[]> {
    return this.roleRepo.findAll(page, limit);
  }
}
