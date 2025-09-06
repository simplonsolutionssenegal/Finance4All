
import { GetUsersByOrganisationUseCase } from '@/application/use-cases/GetUsersByOrganisationUseCase';
import { User } from '@/domain/entities/User';
import { UserRepository } from '@/domain/repositories/UserRepository';

export class GetUsersByOrganisationUseCaseImpl implements GetUsersByOrganisationUseCase
{
  constructor(private readonly userRepo: UserRepository) {}

  execute(organisationId: number): Promise<User[]> {
    if (!Number.isFinite(organisationId) || organisationId <= 0) {
      throw new Error('organisationId invalide');
    }
    return this.userRepo.findByOrganisationId(organisationId);
  }
}
