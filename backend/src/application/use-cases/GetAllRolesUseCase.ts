import { Role } from '../../domain/entities/Role';
import { RoleRepository } from '../../domain/repositories/RoleRepository';

export class GetAllRolesUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async execute(): Promise<Role[]> {
    return await this.roleRepository.getAllRoles();
  }
}
