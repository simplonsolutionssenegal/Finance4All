import type { Request, Response } from 'express';
import type { RemoveUserUseCase } from '@/application/use-cases/RemoveUserUseCase';
import type { UpdateUserRoleUseCase } from '@/application/use-cases/UpdateUserRoleUseCase';
import { clerkClient, getAuth } from '@clerk/express';
import { sendInvitationEmail } from '@/utils/emailService';
import { logger } from '@/utils/logger';

export class UserController {
  constructor(
    private readonly removeUserUseCase: RemoveUserUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase
  ) {
    // Injection de dépendances
  }

  async create(req: Request, res: Response): Promise<void> {
    const { firstName, lastName, email, organizationId, role } = req.body as {
      firstName: string;
      lastName: string;
      email: string;
      organizationId: string;
      role: string;
    };

    try {
      // Vérifier l'authentification
      const { userId } = getAuth(req);

      if (!userId) {
        res.status(401).json({
          error: 'Non autorisé',
          message: 'Utilisateur non authentifié',
        });
        return;
      }

      // Créer l'invitation dans l'organisation
      const invitation = await clerkClient.organizations.createOrganizationInvitation({
        organizationId,
        emailAddress: email,
        role,
        publicMetadata: {
          firstName,
          lastName,
        },
        redirectUrl: process.env.CLERK_REDIRECT_URL ?? 'http://localhost:3000/dashboard',
      });

      // Récupérer les informations de l'organisation pour l'email
      let organizationName = 'Finance4All';
      let inviterEmail: string | undefined;

      try {
        const organization = await clerkClient.organizations.getOrganization({
          organizationId,
        });
        organizationName = organization.name;
      } catch (orgError) {
        logger.warn("Impossible de récupérer le nom de l'organisation", {
          organizationId,
          error: orgError,
        });
      }

      try {
        const currentUser = await clerkClient.users.getUser(userId);
        inviterEmail = currentUser.emailAddresses?.[0]?.emailAddress;
      } catch (userError) {
        logger.warn("Impossible de récupérer l'email de l'inviteur", {
          userId,
          error: userError,
        });
      }

      // Envoyer l'email d'invitation directement
      try {
        await sendInvitationEmail({
          recipientEmail: email,
          organizationName,
          role,
          inviterEmail,
          invitationId: invitation.id,
          organizationId,
        });

        logger.info("Email d'invitation envoyé avec succès", {
          recipient: email,
          organizationName,
          role,
        });
      } catch (emailError) {
        logger.error("Erreur lors de l'envoi de l'email d'invitation", {
          emailError,
          recipient: email,
          invitationId: invitation.id,
        });
        // Ne pas faire échouer la création de l'invitation si l'email échoue
      }

      res.status(201).json({
        success: true,
        message: 'Invitation envoyée avec succès',
        invitation: {
          id: invitation.id,
          emailAddress: invitation.emailAddress,
          status: invitation.status,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'invitation:", error);

      // Gestion spécifique des erreurs Clerk
      if (error && typeof error === 'object' && 'errors' in error) {
        const clerkError = error as { message?: string; errors?: unknown[] };
        res.status(400).json({
          error: "Erreur lors de la création de l'invitation",
          message: clerkError.message ?? 'Erreur Clerk',
          details: clerkError.errors ?? [],
        });
      } else {
        res.status(400).json({
          error: "Erreur lors de la création de l'invitation",
          message: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    const { userId } = req.params as { userId: string };
    const { organizationId } = req.body as { organizationId: string };

    if (!userId || !organizationId) {
      res.status(400).json({
        error: 'Paramètres manquants',
        message: 'userId et organizationId sont requis',
      });
      return;
    }

    try {
      const result = await this.removeUserUseCase.execute(userId, organizationId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la suppression de l'utilisateur",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    const { userId } = req.params as { userId: string };
    const { organizationId, role } = req.body as { organizationId: string; role: string };

    if (!userId || !organizationId || !role) {
      res.status(400).json({
        error: 'Paramètres manquants',
        message: 'userId, organizationId et role sont requis',
      });
      return;
    }

    try {
      const result = await this.updateUserRoleUseCase.execute(userId, organizationId, role);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la modification du rôle de l'utilisateur",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}
