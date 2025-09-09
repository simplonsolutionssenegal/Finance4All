import { ResetPasswordUseCase } from '@/application/use-cases/ResetPasswordUseCase';
import { clerkClient } from '@clerk/express';
import { UseCaseErrorHandler } from './UseCaseErrorHandler';

export class ResetPasswordUseCaseImpl implements ResetPasswordUseCase {
  async execute(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    this.validateInputs(userId, newPassword);

    try {
      await this.updateUserPassword(userId, newPassword);
      return {
        success: true,
        message: 'Votre mot de passe a été mis à jour avec succès.',
      };
    } catch (error) {
      UseCaseErrorHandler.handleClerkError(error, 'la mise à jour du mot de passe');
    }
  }

  private validateInputs(userId: string, newPassword: string): void {
    if (!userId || (typeof userId === 'string' && userId.trim() === '')) {
      throw new Error('L\'ID utilisateur est requis');
    }

    if (!newPassword || (typeof newPassword === 'string' && newPassword.trim() === '')) {
      throw new Error('Le nouveau mot de passe est requis');
    }

    this.validatePasswordStrength(newPassword.trim());
  }

  private validatePasswordStrength(password: string): void {
    // Vérifications de base pour un mot de passe fort
    if (password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (password.length > 128) {
      throw new Error('Le mot de passe ne peut pas dépasser 128 caractères');
    }

    // Vérifier qu'il contient au moins une lettre minuscule
    if (!/[a-z]/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins une lettre minuscule');
    }

    // Vérifier qu'il contient au moins une lettre majuscule
    if (!/[A-Z]/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins une lettre majuscule');
    }

    // Vérifier qu'il contient au moins un chiffre
    if (!/\d/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins un chiffre');
    }

    // Vérifier qu'il contient au moins un caractère spécial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins un caractère spécial');
    }

    // Vérifier qu'il ne contient pas d'espaces
    if (/\s/.test(password)) {
      throw new Error('Le mot de passe ne peut pas contenir d\'espaces');
    }
  }

  private async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      await clerkClient.users.updateUser(userId, {
        password: newPassword,
      });
    } catch (error: unknown) {
      UseCaseErrorHandler.handleClerkError(error, 'la mise à jour du mot de passe');
    }
  }

}
