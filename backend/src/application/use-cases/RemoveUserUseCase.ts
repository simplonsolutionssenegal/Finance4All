/**
 * Interface pour le cas d'utilisation de suppression d'utilisateur
 * Définit le contrat que toute implémentation doit respecter
 */
export interface RemoveUserUseCase {
  /**
   * Exécute la suppression d'un utilisateur d'une organisation et supprime son compte
   * @param userId - L'ID de l'utilisateur à supprimer
   * @param organizationId - L'ID de l'organisation
   * @returns Une promesse contenant le résultat de la suppression
   */
  execute(userId: string, organizationId: string): Promise<{ success: boolean; message: string }>;
}
