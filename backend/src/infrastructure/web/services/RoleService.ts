import { ListRolesUseCase } from '@/application/use-cases/ListRolesUseCase';

export class RoleService {
  constructor(private readonly listRoles: ListRolesUseCase) {}

  listAll() {
    return this.listRoles.execute();
  }
}
