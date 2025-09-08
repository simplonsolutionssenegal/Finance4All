import { ForgotPasswordUseCase } from '@/application/use-cases/ForgotPasswordUseCase';
import { clerkClient } from '@clerk/express';

export class ForgotPasswordUseCaseImpl implements ForgotPasswordUseCase {
  async execute(email: string): Promise<{ success: boolean; message: string }> {
    this.validateEmail(email);

    try {
      await this.checkUserExists(email);
      return {
        success: true,
        message: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
      };
    } catch (error) {
      this.handleClerkError(error);
    }
  }

  private validateEmail(email: string): void {
    if (!email) {
      throw new Error('L\'email est requis');
    }

    if (!this.isValidEmail(email)) {
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

    console.error('Clerk API Error:', error.message);
    
    const errorMessage = error.message.toLowerCase();
    const specificError = this.getSpecificErrorMessage(errorMessage);
    
    if (specificError) {
      throw new Error(specificError);
    }

    // Pour le debug, on retourne l'erreur réelle en développement
    if (process.env.NODE_ENV === 'development') {
      throw new Error(error.message);
    }
    
    throw new Error('Erreur lors de l\'envoi du lien de réinitialisation');
  }

  private getSpecificErrorMessage(errorMessage: string): string | null {
    const errorMappings = [
      { keywords: ['not found', 'does not exist'], message: 'Aucun compte n\'est associé à cette adresse email.' },
      { keywords: ['rate limit'], message: 'Trop de tentatives. Veuillez réessayer plus tard.' },
      { keywords: ['already exists', 'already sent'], message: 'Un lien de réinitialisation a déjà été envoyé récemment. Veuillez vérifier votre boîte email ou réessayer plus tard' },
      { keywords: ['unauthorized', '401'], message: 'Erreur de configuration Clerk.' },
      { keywords: ['forbidden', '403'], message: 'Accès refusé à l\'API Clerk.' },
    ];

    for (const mapping of errorMappings) {
      if (mapping.keywords.some(keyword => errorMessage.includes(keyword))) {
        return mapping.message;
      }
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
