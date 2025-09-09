import { ResetPasswordUseCase } from '@/application/use-cases/ResetPasswordUseCase';
import { clerkClient } from '@clerk/express';

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
      this.handleClerkError(error);
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
      if (this.isClerkError(error)) {
        const clerkError = error.errors[0];

        switch (clerkError.code) {
          case 'form_password_pwned':
            throw new Error('Ce mot de passe a été trouvé dans une fuite de données. Pour la sécurité de votre compte, veuillez utiliser un mot de passe différent.');
          case 'form_password_validation_failed':
            throw new Error('Le mot de passe ne respecte pas les critères de sécurité requis.');
          case 'form_password_too_common':
            throw new Error('Ce mot de passe est trop commun. Veuillez choisir un mot de passe plus unique.');
          case 'form_password_not_strong_enough':
            throw new Error('Le mot de passe n\'est pas assez fort. Veuillez utiliser un mot de passe plus complexe.');
          default:
            throw new Error(clerkError.message ?? 'Erreur de validation du mot de passe');
        }
      }

      if (error instanceof Error && error.message.includes('not found')) {
        throw new Error('Utilisateur non trouvé');
      }
      throw error;
    }
  }

  private isClerkError(error: unknown): error is { clerkError: boolean; errors: { code: string; message: string }[] } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'clerkError' in error &&
      'errors' in error &&
      Array.isArray((error as Record<string, unknown>).errors) &&
      ((error as Record<string, unknown>).errors as unknown[]).length > 0
    );
  }

  private handleClerkError(error: unknown): never {
    if (!(error instanceof Error)) {
      throw new Error('Erreur inconnue lors de la mise à jour du mot de passe');
    }

    const errorMessage = error.message.toLowerCase();
    const specificError = this.getSpecificErrorMessage(errorMessage);

    if (specificError) {
      throw new Error(specificError);
    }

    throw new Error(error.message);
  }

  private getSpecificErrorMessage(errorMessage: string): string | null {
    const errorMappings = new Map([
      [['not found', 'does not exist', 'utilisateur non trouvé'], 'Utilisateur non trouvé'],
      [['rate limit'], 'Trop de tentatives. Veuillez réessayer plus tard.'],
      [['unauthorized', '401'], 'Une erreur est survenue lors de la mise à jour du mot de passe.'],
      [['forbidden', '403'], 'Vous n\'avez pas les permissions pour mettre à jour le mot de passe.'],
      [['invalid password', 'password policy'], 'Le mot de passe ne respecte pas la politique de sécurité'],
      [['weak password'], 'Le mot de passe est trop faible'],
    ]);

    for (const [keywords, message] of errorMappings) {
      if (keywords.some(keyword => errorMessage.includes(keyword))) {
        return message;
      }
    }

    return null;
  }
}
