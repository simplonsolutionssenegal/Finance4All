
import { ClerkUser } from '@/infrastructure/database/model/clerkUserModel';
import { LastLoginFilter } from '@/types/lastLoginFilter';
import { UserStatus } from '../constants/userStatus';

export interface UserRepository {
  findAll(): Promise<ClerkUser[]>;

  findByOrganisationId(organisationId: number): Promise<ClerkUser[]>;



    findUsersByOrganisationAndStatus(
    organisationId: number,
    statuses:  readonly UserStatus[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<ClerkUser[]>;

  findById(id: string): Promise<ClerkUser | null>;
  
  
}
