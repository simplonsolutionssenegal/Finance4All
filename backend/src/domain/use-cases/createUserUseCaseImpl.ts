import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { User, UserRole, UserStatus } from '../entities/User';

export class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(name: string, email: string): Promise<User> {
    if (!name || !email) {
      throw new Error('Le nom et l\'email sont requis');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Format d\'email invalide');
    }

    const userData = {
      email,
      password: '',
      lastName: '',
      firstName: '',
      role: UserRole.BENEFICIAIRE,
      status: UserStatus.ACTIF,
    };
    return await this.userRepository.signUp(userData);
  }

  private isValidEmail(email: string): boolean {
    // Utilisation d'une regex plus sécurisée sans risque de backtracking
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
