// backend/src/application/use-cases/GetUsersByOrganisationAndStatusUseCase.ts
import { ClerkUser } from '@/infrastructure/database/model/clerkUserModel';
import { LastLoginFilter } from '@/types/lastLoginFilter';



export interface GetUsersByOrganisationAndStatusUseCase {
  execute(
    organisationId: number,
    statuses: ('ACTIF' | 'INACTIF' | 'EN_ATTENTE')[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<ClerkUser[]>;
}
