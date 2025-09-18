
import { GetUsersByOrganisationUseCase } from '@/application/use-cases/GetUsersByOrganisationUseCase';
import { ClerkUser } from '@/infrastructure/database/model/clerkUserModel';
import { UserRepository } from '../repositories/UserRepository';

export class GetUsersByOrganisationUseCaseImpl implements GetUsersByOrganisationUseCase
{
  constructor(private readonly userRepo: UserRepository) {}

  execute(organisationId: number): Promise<ClerkUser[]> {
    if (!Number.isFinite(organisationId) || organisationId <= 0) {
      throw new Error('organisationId invalide');
    }
    return this.userRepo.findByOrganisationId(organisationId);
    
  }
}
