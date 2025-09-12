// backend/src/domain/use-cases/GetUsersByOrganisationAndStatusUseCaseImpl.ts
import { GetUsersByOrganisationAndStatusUseCase, LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';
import { User } from '@/domain/entities/User';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { UserStatus } from '@prisma/client'; // 👈 IMPORTANT

export class GetUsersByOrganisationAndStatusUseCaseImpl implements GetUsersByOrganisationAndStatusUseCase {

  constructor(private readonly userRepo: UserRepository) { }

  async execute(
    organisationId: number,
    statuses: UserStatus[] | undefined,
    roles?: string[],
    lastLoginFilter?: LastLoginFilter,
  ): Promise<User[]> {
    if (!Number.isFinite(organisationId) || organisationId <= 0) {
      throw new Error('organisationId invalide');
    }

    // défaut : tous les statuts si non fourni OU tableau vide
    const effectiveStatuses: UserStatus[] =
      statuses && statuses.length > 0 ? statuses : (Object.values(UserStatus) as UserStatus[]);

    return this.userRepo.findUsersByOrganisationAndStatus(
      organisationId,
      effectiveStatuses,
      roles,
      lastLoginFilter,
    );
  }
}
