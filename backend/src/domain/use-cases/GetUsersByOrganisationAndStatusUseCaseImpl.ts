// backend/src/infrastructure/use-cases/GetUsersByOrganisationAndStatusUseCaseImpl.ts
import { ClerkUser } from '@/infrastructure/database/model/clerkUserModel';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { GetUsersByOrganisationAndStatusUseCase, LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';

export class GetUsersByOrganisationAndStatusUseCaseImpl implements GetUsersByOrganisationAndStatusUseCase {
  constructor(private readonly userRepo: UserRepository) { }

  async execute(
    organisationId: number,
    statuses: ('ACTIF' | 'INACTIF' | 'EN_ATTENTE')[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter,
  ): Promise<ClerkUser[]> {
    if (!Number.isFinite(organisationId) || organisationId <= 0) {
      throw new Error('organisationId invalide');
    }

    // Par défaut, tous les statuts
    const ALL_STATUSES: ('ACTIF' | 'INACTIF' | 'EN_ATTENTE')[] = ['ACTIF', 'INACTIF', 'EN_ATTENTE'];
    const effectiveStatuses = statuses.length > 0 ? statuses : ALL_STATUSES;

    return this.userRepo.findUsersByOrganisationAndStatus(
      organisationId,
      effectiveStatuses,
      roles,
      lastLoginFilter,
    );
  }
}
