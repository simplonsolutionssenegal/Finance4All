export interface ForgotPasswordUseCase {
  /**
   * Exécute l'envoi d'un lien de réinitialisation de mot de passe
   * @param email - L'email de l'utilisateur
   * @returns Une promesse contenant le résultat de l'opération
   */
  execute(email: string): Promise<{ success: boolean; message: string }>;
}
