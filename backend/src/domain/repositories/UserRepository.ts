import { LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';
import { ClerkUser } from '@/infrastructure/database/model/clerkUserModel';

export interface UserRepository {
  findAll(): Promise<ClerkUser[]>;

  findByOrganisationId(organisationId: number): Promise<ClerkUser[]>;



    findUsersByOrganisationAndStatus(
    organisationId: number,
    statuses: ('ACTIF' | 'INACTIF' | 'EN_ATTENTE')[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<ClerkUser[]>;

  findById(id: string): Promise<ClerkUser | null>;
  
  
}
