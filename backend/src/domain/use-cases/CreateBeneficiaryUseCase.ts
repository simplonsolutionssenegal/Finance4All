import type { User } from '../entities/User';

/**
 * Interface pour le cas d'utilisation de création de bénéficiaire
 * Définit le contrat que toute implémentation doit respecter
 */
export interface CreateBeneficiaryUseCase {
  /**
   * Exécute la création d'un bénéficiaire
   * @param userId - L'ID de l'utilisateur
   * @param name - Le nom de l'bénéficiaire
   * @param email - L'email de l'bénéficiaire
   * @param phoneNumber - Le numéro de téléphone de l'bénéficiaire
   * @returns Une promesse contenant le bénéficiaire créé
   */
  execute(userId: string, name: string, email: string, phoneNumber: string): Promise<User>;
}
