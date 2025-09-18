import { ClerkUser } from '@/infrastructure/database/model/clerkUserModel';

export interface GetUsersByOrganisationUseCase {
  execute(organisationId: number): Promise<ClerkUser[]>;
}