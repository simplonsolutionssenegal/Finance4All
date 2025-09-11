import { CreateUserUseCase, CreateUserData } from '@/application/use-cases/CreateUserUseCase';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../entities/User';
/**
 * Implémentation concrète du cas d'utilisation de création d'utilisateur
 */
export class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userData: CreateUserData): Promise<User> {
    const { username, email, firstName, lastName, roleId, organizationId, status } = userData;

    if (!username || !email || !firstName || !lastName || !roleId) {
      throw new Error('Les champs username, email, firstName, lastName et roleId sont requis');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Format d\'email invalide');
    }

    const userId = Date.now().toString();
    const user = new User(
      userId,                    // id
      username,                  // username
      email,                     // email
      firstName,                 // firstName
      lastName,                  // lastName
      roleId,                    // roleId
      organizationId ?? null,    // organizationId
      status ?? 'ACTIF',         // status
    );
    return this.userRepository.save(user);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
