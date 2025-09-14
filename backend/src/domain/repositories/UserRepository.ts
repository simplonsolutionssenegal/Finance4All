import { UserStatus } from '@prisma/client';
import { User } from '../entities/User';
import { LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';

export interface UserRepository {
  findAll(): Promise<User[]>;

  findByOrganisationId(organisationId: number): Promise<User[]>;



  findUsersByOrganisationAndStatus(
    organisationId: number,
    statuses: UserStatus[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<User[]>;

  findById(id: number): Promise<User | null>;
  
  
}
