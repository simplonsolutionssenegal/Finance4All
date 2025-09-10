// backend/src/services/user.service.ts
import { UserStatus } from '@prisma/client';
import { User } from '@/domain/entities/User'; // ✅ domaine
import { UserRepository } from '@/domain/repositories/UserRepository';
import { GetUsersByOrganisationUseCase } from '@/application/use-cases/GetUsersByOrganisationUseCase';
import { GetUsersByOrganisationAndStatusUseCase, LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';

export class UserService {
  constructor(
    private readonly getUsersByOrganisationUC: GetUsersByOrganisationUseCase,
    private readonly getUsersByOrgAndStatusUC: GetUsersByOrganisationAndStatusUseCase,

  ) { }


  getUsersByOrganisation(organisationId: number): Promise<User[]> {
    return this.getUsersByOrganisationUC.execute(organisationId);
  }
  
  getUsersByOrganisationAndStatus(
    organisationId: number,
    statuses: UserStatus[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<User[]> {
    return this.getUsersByOrgAndStatusUC.execute(
      organisationId,
      statuses,
      roles,
      lastLoginFilter
    );
  }
}
