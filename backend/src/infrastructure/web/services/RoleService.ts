import { ListRolesUseCase } from '@/application/use-cases/ListRolesUseCase';

export class RoleService {
  constructor(private readonly listRoles: ListRolesUseCase) {}

  listAll(page= 1, limit= 10) {
    return this.listRoles.execute(page, limit);
  }
}
