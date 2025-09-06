import { User } from '@/domain/entities/User';

export interface GetUsersByOrganisationUseCase {
  execute(organisationId: number): Promise<User[]>;
}