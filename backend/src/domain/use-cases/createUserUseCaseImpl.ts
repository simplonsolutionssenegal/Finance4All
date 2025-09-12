import { CreateUserDTO, CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../entities/User';
import { UserStatus } from '@prisma/client';
/**
 * Implémentation concrète du cas d'utilisation de création d'utilisateur
 */
export class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: CreateUserDTO): Promise<User> {
    const { email, username, password, roleId } = dto;

    if (!email || !username || !password || !roleId) {
      throw new Error('email, username, password et roleId sont requis');
    }
    this.isValidEmail(email);

    return this.userRepository.create({
      email,
      username,
      password,
      roleId,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      avatar: dto.avatar ?? null,
      organisationId: dto.organisationId ?? null,
      status: dto.status ?? UserStatus.ACTIF,
      isActive: dto.isActive ?? true,
      lastLoginAt: dto.lastLoginAt ?? new Date(),
    });
  }



  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
