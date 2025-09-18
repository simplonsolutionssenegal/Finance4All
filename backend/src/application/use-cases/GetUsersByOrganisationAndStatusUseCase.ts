// backend/src/application/use-cases/GetUsersByOrganisationAndStatusUseCase.ts
import { ClerkUser } from '@/infrastructure/database/model/clerkUserModel';

export type LastLoginFilter =
  | { type: 'recent' }
  | { type: 'last_month' }
  | { type: 'custom_date'; date: Date };

export interface GetUsersByOrganisationAndStatusUseCase {
  execute(
    organisationId: number,
    statuses: ('ACTIF' | 'INACTIF' | 'EN_ATTENTE')[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<ClerkUser[]>;
}
