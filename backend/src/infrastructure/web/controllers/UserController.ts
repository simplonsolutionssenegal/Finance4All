import { Request, Response } from 'express';
import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { RemoveUserUseCase } from '@/application/use-cases/RemoveUserUseCase';
import { UpdateUserRoleUseCase } from '@/application/use-cases/UpdateUserRoleUseCase';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
  ) {
    // Injection de dépendances
  }

  async create(req: Request, res: Response): Promise<void> {
    const { name, email } = req.body as { name: string; email: string };

    try {
      const user = await this.createUserUseCase.execute(name, email);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({
        error: 'Erreur lors de la création de l\'utilisateur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
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
