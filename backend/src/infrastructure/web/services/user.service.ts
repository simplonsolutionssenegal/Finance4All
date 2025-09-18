// backend/src/services/user.service.ts
import { GetUsersByOrganisationUseCase } from '@/application/use-cases/GetUsersByOrganisationUseCase';
import { GetUsersByOrganisationAndStatusUseCase, LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';
import { ClerkUser } from '@/infrastructure/database/model/clerkUserModel';

export class UserService {
  constructor(
    private readonly getUsersByOrganisationUC: GetUsersByOrganisationUseCase,
    private readonly getUsersByOrgAndStatusUC: GetUsersByOrganisationAndStatusUseCase,

  ) { }


  getUsersByOrganisation(organisationId: number): Promise<ClerkUser[]> {
    return this.getUsersByOrganisationUC.execute(organisationId);
  }

  getUsersByOrganisationAndStatus(
    organisationId: number,
    statuses: string[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter,
  ): Promise<ClerkUser[]> {
    const mappedStatuses = this.mapStatuses(statuses);
    return this.getUsersByOrgAndStatusUC.execute(
      organisationId,
      mappedStatuses,
      roles,
      lastLoginFilter,
    );
  }

  private mapStatuses(statuses: string[]): ('ACTIF' | 'INACTIF' | 'EN_ATTENTE')[] {
    return statuses.map((s) => {
      switch (s) {
        case 'ACTIF':
          return 'ACTIF';
        case 'INACTIF':
          return 'INACTIF';
        default:
          return 'EN_ATTENTE'; // Tout autre statut devient EN_ATTENTE
      }
    });
  }

}
