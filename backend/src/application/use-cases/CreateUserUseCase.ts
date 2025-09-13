import { User } from '@/domain/entities/User';

/**
 * Interface pour le cas d'utilisation de création d'utilisateur
 * Définit le contrat que toute implémentation doit respecter
 */
export interface CreateUserUseCase {
  /**
   * Exécute la création d'un utilisateur
   * @param name - Le nom de l'utilisateur
   * @param email - L'email de l'utilisateur
   * @returns Une promesse contenant l'utilisateur créé
   */
  execute(name: string, email: string): Promise<User>;
}
