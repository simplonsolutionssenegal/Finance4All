import { ForgotPasswordUseCase } from '@/application/use-cases/ForgotPasswordUseCase';
import { clerkClient } from '@clerk/express';

export class ForgotPasswordUseCaseImpl implements ForgotPasswordUseCase {
  async execute(email: string | undefined): Promise<{ success: boolean; message: string }> {
    this.validateEmail(email);

    try {
      await this.checkUserExists(email!);
      return {
        success: true,
        message: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
      };
    } catch (error) {
      this.handleClerkError(error);
    }
  }

  private validateEmail(email: string | undefined): void {
    if (!email || (typeof email === 'string' && email.trim() === '')) {
      throw new Error('L\'email est requis');
    }

    if (!this.isValidEmail(email.trim())) {
      throw new Error('Format d\'email invalide');
    }
  }

  private async checkUserExists(email: string): Promise<void> {
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (users.data.length === 0) {
      throw new Error('Aucun compte n\'est associé à cette adresse email');
    }
  }

  private handleClerkError(error: unknown): never {
    if (!(error instanceof Error)) {
      throw new Error('Erreur inconnue lors de l\'envoi du lien de réinitialisation');
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
      [['not found', 'does not exist', 'aucun compte'], 'Aucun compte n\'est associé à cette adresse email'],
      [['rate limit'], 'Trop de tentatives. Veuillez réessayer plus tard.'],
      [['already exists', 'already sent'], 'Un lien de réinitialisation a déjà été envoyé récemment. Veuillez vérifier votre boîte email ou réessayer plus tard'],
      [['unauthorized', '401'], 'Une erreur est survenue lors de l\'envoi du lien de réinitialisation.'],
      [['forbidden', '403'], 'Vous n\'avez pas les permissions pour envoyer un lien de réinitialisation.'],
    ]);

    for (const [keywords, message] of errorMappings) {
      if (keywords.some(keyword => errorMessage.includes(keyword))) {
        return message;
      }
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    // Vérifications de base
    if (!email || email.length < 5) return false;

    // Vérifier qu'il n'y a qu'un seul @
    const atCount = (email.match(/@/g) ?? []).length;
    if (atCount !== 1) return false;

    // Séparer local et domain
    const [localPart, domainPart] = email.split('@');

    // Vérifier le local part
    if (!localPart || localPart.length === 0) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (localPart.includes('..')) return false; // Pas de points consécutifs

    // Vérifier le domain part
    if (!domainPart || domainPart.length === 0) return false;
    if (!domainPart.includes('.')) return false; // Doit avoir au moins un point
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;
    if (domainPart.includes('..')) return false; // Pas de points consécutifs

    // Vérifier que le TLD a au moins 2 caractères
    const tld = domainPart.split('.').pop();
    if (!tld || tld.length < 2) return false;

    // Regex de base pour les caractères autorisés
    const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return basicRegex.test(email);
  }
}
