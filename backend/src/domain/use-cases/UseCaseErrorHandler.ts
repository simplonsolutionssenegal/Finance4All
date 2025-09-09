export class UseCaseErrorHandler {
  static handleClerkError(error: unknown, context: string): never {
    // Handle specific Clerk errors first
    if (this.isClerkError(error)) {
      const clerkError = error.errors[0];
      const specificClerkError = this.getSpecificClerkErrorMessage(clerkError.code);
      if (specificClerkError) {
        throw new Error(specificClerkError);
      }
      throw new Error(clerkError.message ?? 'Erreur de validation du mot de passe');
    }

    if (!(error instanceof Error)) {
      throw new Error(`Erreur inconnue lors de ${context}`);
    }

    const errorMessage = error.message.toLowerCase();
    const specificError = this.getSpecificErrorMessage(errorMessage, context);

    if (specificError) {
      throw new Error(specificError);
    }

    throw new Error(error.message);
  }

  private static getSpecificErrorMessage(errorMessage: string, context: string): string | null {
    const errorMappings = new Map([
      [['not found', 'does not exist', 'aucun compte', 'utilisateur non trouvé'], 
        context.includes('envoi') ? 'Aucun compte n\'est associé à cette adresse email' : 'Utilisateur non trouvé'],
      [['rate limit'], 'Trop de tentatives. Veuillez réessayer plus tard.'],
      [['already exists', 'already sent'], 'Un lien de réinitialisation a déjà été envoyé récemment. Veuillez vérifier votre boîte email ou réessayer plus tard'],
      [['unauthorized', '401'], 
        context.includes('envoi') ? 'Une erreur est survenue lors de l\'envoi du lien de réinitialisation.' : 'Une erreur est survenue lors de la mise à jour du mot de passe.'],
      [['forbidden', '403'], 
        context.includes('envoi') ? 'Vous n\'avez pas les permissions pour envoyer un lien de réinitialisation.' : 'Vous n\'avez pas les permissions pour mettre à jour le mot de passe.'],
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

  private static isClerkError(error: unknown): error is { clerkError: boolean; errors: { code: string; message: string }[] } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'clerkError' in error &&
      'errors' in error &&
      Array.isArray((error as Record<string, unknown>).errors) &&
      ((error as Record<string, unknown>).errors as unknown[]).length > 0
    );
  }

  private static getSpecificClerkErrorMessage(code: string): string | null {
    const clerkErrorMappings = new Map([
      ['form_password_pwned', 'Ce mot de passe a été trouvé dans une fuite de données. Pour la sécurité de votre compte, veuillez utiliser un mot de passe différent.'],
      ['form_password_validation_failed', 'Le mot de passe ne respecte pas les critères de sécurité requis.'],
      ['form_password_too_common', 'Ce mot de passe est trop commun. Veuillez choisir un mot de passe plus unique.'],
      ['form_password_not_strong_enough', 'Le mot de passe n\'est pas assez fort. Veuillez utiliser un mot de passe plus complexe.'],
    ]);

    return clerkErrorMappings.get(code) ?? null;
  }
}
