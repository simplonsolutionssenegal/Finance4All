// import { PrismaClient } from '@prisma/client';

// export class UserService {
//   constructor(private readonly prisma: PrismaClient) {}
// }

// import { UserRepositoryPort } from '@/application/ports/user.repository.port';
import { User } from '@/domain/models/user.entity';
import { UserRepositoryPort } from '@/ports/user.repository.port';

export class UserService {
  constructor(private readonly userRepository: UserRepositoryPort) { }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUsersByOrganisation(organisationId: number): Promise<User[]> {
    return this.userRepository.findByOrganisationId(organisationId);
  }

  async createUser(data: {
    email: string;
    firstName: string,
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
