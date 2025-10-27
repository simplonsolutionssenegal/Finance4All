import type { UserRepository } from '@/domain/repositories/UserRepository';
import { User } from '../entities/User';
import type { CreateBeneficiaryUseCase } from '@/application/use-cases/CreateBeneficiaryUseCase';
import { logger } from '@/infrastructure/utils/logger';

/**
 * Implémentation du cas d'utilisation pour créer un bénéficiaire
 */
export class CreateBeneficiaryCaseImpl implements CreateBeneficiaryUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    clerkUserId: string,
    name: string,
    email: string,
    phoneNumber: string
  ): Promise<User> {
    if (!clerkUserId || !name || !email || !phoneNumber) {
      throw new Error("L'ID Clerk, le nom, l'email et le numéro de téléphone sont requis");
    }

    if (!this.isValidEmail(email)) {
      throw new Error("Format d'email invalide");
    }

    try {
      // Utiliser l'ID Clerk fourni par le frontend
      const user = new User(clerkUserId, name, email, 'beneficiary', phoneNumber);
      const savedUser = await this.userRepository.save(user);

      logger.info(`Bénéficiaire créé dans la base de données: ${email}`, {
        userId: savedUser.id,
        clerkUserId,
      });

      return savedUser;
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
