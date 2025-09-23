import { clerkClient } from '@clerk/express';
import type { RemoveUserUseCase } from '@/application/use-cases/RemoveUserUseCase';
import { logger } from '@/utils/logger';

/**
 * Implémentation du cas d'utilisation pour supprimer un utilisateur
 * Gère la suppression de l'utilisateur de l'organisation et la suppression de son compte
 */
export class RemoveUserUseCaseImpl implements RemoveUserUseCase {
  /**
   * Exécute la suppression d'un utilisateur
   * @param userId - L'ID de l'utilisateur à supprimer
   * @param organizationId - L'ID de l'organisation
   * @returns Une promesse contenant le résultat de la suppression
   */
  async execute(
    userId: string,
    organizationId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      logger.info(
        `Début de la suppression de l'utilisateur ${userId} de l'organisation ${organizationId}`
      );

      // Étape 1 : Supprimer l'utilisateur de l'organisation
      try {
        await clerkClient.organizations.deleteOrganizationMembership({
          organizationId,
          userId,
        });
        logger.info(`Utilisateur ${userId} supprimé de l'organisation ${organizationId}`);
      } catch (orgError) {
        logger.error("Erreur lors de la suppression de l'utilisateur de l'organisation", {
          userId,
          organizationId,
          error: orgError,
        });
        // Continue même si la suppression de l'organisation échoue
      }

      // Étape 2: Supprimer complètement le compte utilisateur
      try {
        await clerkClient.users.deleteUser(userId);
        logger.info(`Compte utilisateur ${userId} supprimé définitivement`);
      } catch (userError) {
        logger.error('Erreur lors de la suppression du compte utilisateur', {
          userId,
          error: userError,
        });
        throw new Error('Impossible de supprimer le compte utilisateur');
      }

      return {
        success: true,
        message: "Utilisateur supprimé avec succès de l'organisation et son compte a été supprimé",
      };
    } catch (error) {
      logger.error("Erreur lors de la suppression de l'utilisateur", {
        userId,
        organizationId,
        error,
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue lors de la suppression',
      };
    }
  }
}
