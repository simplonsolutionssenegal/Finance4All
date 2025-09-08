import { ForgotPasswordUseCase } from '@/application/use-cases/ForgotPasswordUseCase';
import { clerkClient } from '@clerk/express';

/**
 * Implémentation du cas d'usage pour la réinitialisation de mot de passe
 * Utilise l'API Clerk pour vérifier l'existence de l'utilisateur
 */
export class ForgotPasswordUseCaseImpl implements ForgotPasswordUseCase {
  /**
   * Exécute le processus de réinitialisation de mot de passe
   * @param email - L'adresse email de l'utilisateur
   * @returns Promise avec le résultat de l'opération
   * @throws Error si l'email est invalide ou si l'utilisateur n'existe pas
   */
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

  /**
   * Valide le format de l'email
   * @param email - L'adresse email à valider
   * @throws Error si l'email est vide ou invalide
   */
  private validateEmail(email: string): void {
    if (!email) {
      throw new Error('L\'email est requis');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Format d\'email invalide');
    }
  }

  /**
   * Vérifie si l'utilisateur existe dans Clerk
   * @param email - L'adresse email de l'utilisateur
   * @throws Error si l'utilisateur n'existe pas
   */
  private async checkUserExists(email: string): Promise<void> {
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (users.data.length === 0) {
      throw new Error('Aucun compte n\'est associé à cette adresse email');
    }
  }

  /**
   * Gère les erreurs spécifiques à l'API Clerk
   * @param error - L'erreur à traiter
   * @throws Error avec un message approprié selon le type d'erreur
   */
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

  /**
   * Mappe les messages d'erreur Clerk vers des messages utilisateur
   * @param errorMessage - Le message d'erreur de Clerk
   * @returns Le message d'erreur mappé ou null si aucun mapping trouvé
   */
  private getSpecificErrorMessage(errorMessage: string): string | null {
    const errorMappings = new Map([
      [['not found', 'does not exist'], 'Aucun compte n\'est associé à cette adresse email.'],
      [['rate limit'], 'Trop de tentatives. Veuillez réessayer plus tard.'],
      [['already exists', 'already sent'], 'Un lien de réinitialisation a déjà été envoyé récemment. Veuillez vérifier votre boîte email ou réessayer plus tard'],
      [['unauthorized', '401'], 'Erreur de configuration Clerk.'],
      [['forbidden', '403'], 'Accès refusé à l\'API Clerk.'],
    ]);

    for (const [keywords, message] of errorMappings) {
      if (keywords.some(keyword => errorMessage.includes(keyword))) {
        return message;
      }
    }

    return null;
  }

  /**
   * Valide le format d'un email avec une regex sécurisée
   * @param email - L'adresse email à valider
   * @returns true si l'email est valide, false sinon
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
