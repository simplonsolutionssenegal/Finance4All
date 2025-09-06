import { UserStatus } from '@prisma/client';
import { User } from '../entities/User';
import { LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';

export interface UserRepository {
  findAll(): Promise<User[]>;

  findByOrganisationId(organisationId: number): Promise<User[]>;

  findUsersByStatus(statuses: UserStatus[]): Promise<User[]>;

  findUsersByOrganisationAndStatus(
    organisationId: number,
    statuses: UserStatus[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<User[]>;

  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;

  create(data: {
    email: string;
    username: string;
    password: string;
    roleId: number;

    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
    organisationId?: number | null;

    status?: UserStatus;
    isActive?: boolean;
    lastLoginAt?: Date | null;
  }): Promise<User>;

}
