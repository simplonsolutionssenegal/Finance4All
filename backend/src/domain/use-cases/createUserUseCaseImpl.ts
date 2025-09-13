import type { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { User } from '../entities/User';
import { isValidEmail } from '@/utils/isValidEmail';
/**
 * Implémentation concrète du cas d'utilisation de création d'utilisateur
 */
export class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(name: string, email: string): Promise<User> {
    if (!name || !email) {
      throw new Error('Le nom et l\'email sont requis');
    }

    if (!isValidEmail(email)) {
      throw new Error('Format d\'email invalide');
    }

    const userId = Date.now().toString();
    const user = new User(userId, name, email);
    return this.userRepository.save(user);
  }

}
