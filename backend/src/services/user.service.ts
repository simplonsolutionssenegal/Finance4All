// import { PrismaClient } from '@prisma/client';

// export class UserService {
//   constructor(private readonly prisma: PrismaClient) {}
// }

// import { UserRepositoryPort } from '@/application/ports/user.repository.port';
import { User } from '@/domain/models/user.entity';
import { UserRepositoryPort } from '@/ports/user.repository.port';
import { UserStatus } from '@prisma/client';

export class UserService {
  constructor(private readonly userRepository: UserRepositoryPort) { }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUsersByOrganisation(organisationId: number): Promise<User[]> {
    return this.userRepository.findByOrganisationId(organisationId);
  }

  async getUsersByStatus(statuses: UserStatus[]): Promise<User[]> {
    if (!statuses || statuses.length === 0) {
      return this.userRepository.findAll();
    }
    return this.userRepository.findUsersByStatus(statuses);
  }

  async getUsersByOrganisationAndStatus(organisationId: number, statuses: UserStatus[], roles?: string[]): Promise<User[]> {
    if (!statuses || statuses.length === 0) {
      // Si pas de statuts spécifiés, on récupère tous les utilisateurs de l'organisation
      // avec le filtre de rôle si spécifié
      if (roles && roles.length > 0) {
        return this.userRepository.findUsersByOrganisationAndStatus(
          organisationId, 
          Object.values(UserStatus), // Tous les statuts
          roles
        );
      }
      return this.userRepository.findByOrganisationId(organisationId);
    }
    return this.userRepository.findUsersByOrganisationAndStatus(organisationId, statuses, roles);
  }

  async createUser(data: {
    email: string;
    firstName: string,
    lastLoginAt : Date,
    status : UserStatus,
    lastName: string,
    avatar: string,
    isActive: boolean,
    organisationId: number,
    username: string;
    password: string;
    roleId: number
  }): Promise<User> {
    return this.userRepository.create(data);
  }
}
