import { clerkClient } from '@clerk/express';
import { UpdateUserRoleUseCase } from '@/application/use-cases/UpdateUserRoleUseCase';
import { logger } from '@/utils/logger';

/**
 * Implémentation du cas d'utilisation pour modifier le rôle d'un utilisateur
 * Gère la modification du rôle de l'utilisateur dans l'organisation
 */
export class UpdateUserRoleUseCaseImpl implements UpdateUserRoleUseCase {
  /**
   * Exécute la modification du rôle d'un utilisateur
   * @param userId - L'ID de l'utilisateur dont on veut modifier le rôle
   * @param organizationId - L'ID de l'organisation
   * @param role - Le nouveau rôle à attribuer à l'utilisateur
   * @returns Une promesse contenant le résultat de la modification
   */
  async execute(
    userId: string,
    organizationId: string,
    role: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      logger.info(
        `Début de la modification du rôle de l'utilisateur ${userId} dans l'organisation ${organizationId} vers le rôle ${role}`,
      );

      // Modifier le rôle de l'utilisateur dans l'organisation
      await clerkClient.organizations.updateOrganizationMembership({
        organizationId,
        userId,
        role,
      });

      logger.info(`Rôle de l'utilisateur ${userId} modifié avec succès vers ${role} dans l'organisation ${organizationId}`);

      return {
        success: true,
        message: `Rôle de l'utilisateur modifié avec succès vers ${role}`,
      };
    } catch (error) {
      logger.error('Erreur lors de la modification du rôle de l\'utilisateur', {
        userId,
        organizationId,
        role,
        error,
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue lors de la modification du rôle',
      };
    }
  }
}