import { Request, Response } from 'express';
import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { RemoveUserUseCase } from '@/application/use-cases/RemoveUserUseCase';
import { UpdateUserRoleUseCase } from '@/application/use-cases/UpdateUserRoleUseCase';
import { clerkClient, getAuth } from '@clerk/express';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
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
      console.error('Erreur lors de la création de l\'invitation:', error);

      // Gestion spécifique des erreurs Clerk
      if (error && typeof error === 'object' && 'errors' in error) {
        const clerkError = error as any;
        res.status(400).json({
          error: 'Erreur lors de la création de l\'invitation',
          message: clerkError.message ?? 'Erreur Clerk',
          details: clerkError.errors ?? [],
        });
      } else {
        res.status(400).json({
          error: 'Erreur lors de la création de l\'invitation',
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
        message: 'Erreur serveur lors de la suppression de l\'utilisateur',
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
        message: 'Erreur serveur lors de la modification du rôle de l\'utilisateur',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}
