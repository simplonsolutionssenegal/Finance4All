import { GetUsersByOrganisationAndStatusUseCase, LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';
import { User } from '@/domain/entities/User';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { UserStatus } from '@prisma/client';

export class GetUsersByOrganisationAndStatusUseCaseImpl implements GetUsersByOrganisationAndStatusUseCase
{
  constructor(private readonly userRepo: UserRepository) {}

 execute(
    organisationId: number,
    statuses: UserStatus[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<User[]> {
    if (!Number.isFinite(organisationId) || organisationId <= 0) {
      throw new Error('organisationId invalide');
    }

    // S’il n’y a pas de statuses -> retourne toute l’org (optionnellement filtrée par roles/date)
    const effectiveStatuses =
      Array.isArray(statuses) && statuses.length > 0
        ? statuses
        : (Object.values(UserStatus) as UserStatus[]);

    return this.userRepo.findUsersByOrganisationAndStatus(
      organisationId,
      effectiveStatuses,
      roles,
      lastLoginFilter // 👈 on propage !
    );
  }
}
