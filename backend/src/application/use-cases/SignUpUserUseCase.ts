import { User } from '../../domain/entities/User';
import { CreateUserInput } from '../validators/UserValidator';

/**
 * Contrat du cas d’utilisation d’inscription utilisateur
 */
export interface SignUpUserUseCase {
  /**
   * Exécute l'inscription d'un utilisateur
   * @param input - Les données d'inscription validées
   * @returns L'utilisateur créé et un message de confirmation
   */
  execute(input: CreateUserInput): Promise<{ user: User; message: string }>;
}
