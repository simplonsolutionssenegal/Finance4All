// backend/src/services/user.service.ts
import { UserStatus } from '@prisma/client';
import { User } from '@/domain/entities/User'; // ✅ domaine
import { UserRepository } from '@/domain/repositories/UserRepository';
import { GetUsersByOrganisationUseCase } from '@/application/use-cases/GetUsersByOrganisationUseCase';
import { GetUsersByOrganisationAndStatusUseCase, LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';

export class UserService {
  constructor(
    private readonly getUsersByOrganisationUC: GetUsersByOrganisationUseCase,
    private readonly getUsersByOrgAndStatusUC: GetUsersByOrganisationAndStatusUseCase,

  ) { }

  // async getAllUsers(): Promise<User[]> {
  //   return this.userRepository.findAll();
  // }

  // async getUsersByOrganisation(organisationId: number): Promise<User[]> {
  //   return this.userRepository.findByOrganisationId(organisationId);
  // }
  getUsersByOrganisation(organisationId: number): Promise<User[]> {
    return this.getUsersByOrganisationUC.execute(organisationId);
  }

  // async getUsersByStatus(statuses: UserStatus[]): Promise<User[]> {
  //   if (!statuses || statuses.length === 0) {
  //     return this.userRepository.findAll();
  //   }
  //   return this.userRepository.findUsersByStatus(statuses);
  // }

  // async getUsersByOrganisationAndStatus(
  //   organisationId: number,
  //   statuses: UserStatus[],
  //   roles?: string[]
  // ): Promise<User[]> {
  //   if (!statuses || statuses.length === 0) {
  //     return roles?.length
  //       ? this.userRepository.findUsersByOrganisationAndStatus(organisationId, Object.values(UserStatus), roles)
  //       : this.userRepository.findByOrganisationId(organisationId);
  //   }
  //   return this.userRepository.findUsersByOrganisationAndStatus(organisationId, statuses, roles);
  // }

  getUsersByOrganisationAndStatus(
    organisationId: number,
    statuses: UserStatus[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<User[]> {
    return this.getUsersByOrgAndStatusUC.execute(
      organisationId,
      statuses,
      roles,
      lastLoginFilter
    );
  }

  // async createUser(data: {
  //   email: string;
  //   firstName?: string;
  //   lastName?: string;
  //   avatar?: string;
  //   isActive?: boolean;
  //   lastLoginAt?: Date;
  //   status?: UserStatus;
  //   organisationId?: number;     // ✅ manquait dans ta signature
  //   username: string;
  //   password: string;
  //   roleId: number;
  // }): Promise<User> {
  //   return this.userRepository.create(data as any);
  // }
}
