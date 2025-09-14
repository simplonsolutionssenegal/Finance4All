/**
 * Interface pour le cas d'utilisation de modification du rôle d'un utilisateur
 * Définit le contrat que toute implémentation doit respecter
 */
export interface UpdateUserRoleUseCase {
  /**
   * Exécute la modification du rôle d'un utilisateur dans une organisation
   * @param userId - L'ID de l'utilisateur dont on veut modifier le rôle
   * @param organizationId - L'ID de l'organisation
   * @param role - Le nouveau rôle à attribuer à l'utilisateur
   * @returns Une promesse contenant le résultat de la modification
   */
  execute(userId: string, organizationId: string, role: string): Promise<{ success: boolean; message: string }>;
}