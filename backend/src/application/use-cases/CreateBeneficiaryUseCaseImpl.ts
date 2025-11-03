import { User } from '@/domain/entities/User';
import type { CreateBeneficiaryUseCase } from '@/domain/use-cases/CreateBeneficiaryUseCase';
import { logger } from '@/infrastructure/utils/logger';

/**
 * Implémentation du cas d'utilisation pour créer un bénéficiaire
 * Note: Les utilisateurs sont gérés par Clerk, on ne les stocke pas en base
 */
export class CreateBeneficiaryUseCaseImpl implements CreateBeneficiaryUseCase {
  async execute(userId: string, name: string, email: string, phoneNumber: string): Promise<User> {
    if (!userId || !name || !email || !phoneNumber) {
      throw new Error("L'ID utilisateur, le nom, l'email et le numéro de téléphone sont requis");
    }

    if (!this.isValidEmail(email)) {
      throw new Error("Format d'email invalide");
    }

    try {
      const user = new User(userId, name, email, 'beneficiary', phoneNumber);

      logger.info(`Bénéficiaire créé: ${email}`, {
        userId: user.id,
      });

      return user;
    } catch (error) {
      logger.error('Erreur lors de la création du bénéficiaire', {
        email,
        error,
      });

      if (error instanceof Error) {
        throw new Error(`Échec de la création du bénéficiaire: ${error.message}`);
      }

      throw new Error('Échec de la création du bénéficiaire');
    }
  }

  private isValidEmail(email: string): boolean {
    // Utilisation d'une regex plus sécurisée sans risque de backtracking
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
