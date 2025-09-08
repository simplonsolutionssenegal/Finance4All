import { ForgotPasswordUseCase } from '@/application/use-cases/ForgotPasswordUseCase';
import { clerkClient } from '@clerk/express';
export class ForgotPasswordUseCaseImpl implements ForgotPasswordUseCase {
  async execute(email: string): Promise<{ success: boolean; message: string }> {
    // Validation de l'email
    if (!email) {
      throw new Error('L\'email est requis');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Format d\'email invalide');
    }

    try {
      // Recherche de l'utilisateur par email
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (users.data.length === 0) {
        throw new Error('Aucun compte n\'est associé à cette adresse email');
      }
      
      return {
        success: true,
        message: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
      };
    } catch (error) {
      // Gestion des erreurs spécifiques à Clerk
      if (error instanceof Error) {
        console.error('Clerk API Error:', error.message);
        
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          throw new Error('Aucun compte n\'est associé à cette adresse email.');
        }
        if (error.message.includes('rate limit')) {
          throw new Error('Trop de tentatives. Veuillez réessayer plus tard.');
        }
        if (error.message.includes('already exists') || error.message.includes('already sent')) {
          throw new Error('Un lien de réinitialisation a déjà été envoyé récemment. Veuillez vérifier votre boîte email ou réessayer plus tard');
        }
        if (error.message.includes('unauthorized') || error.message.includes('401')) {
          throw new Error('Erreur de configuration Clerk.');
        }
        if (error.message.includes('forbidden') || error.message.includes('403')) {
          throw new Error('Accès refusé à l\'API Clerk.');
        }
        
        // Pour le debug, on retourne l'erreur réelle en développement
        if (process.env.NODE_ENV === 'development') {
          throw new Error(`${error.message}`);
        }
        
        throw new Error('Erreur lors de l\'envoi du lien de réinitialisation');
      }
      throw new Error('Erreur inconnue lors de l\'envoi du lien de réinitialisation');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
