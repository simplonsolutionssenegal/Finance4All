import { Request, Response } from 'express';
import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { RemoveUserUseCaseImpl } from '@/domain/use-cases/removeUserUseCaseImpl';
import { UpdateUserRoleUseCaseImpl } from '@/domain/use-cases/updateUserRoleUseCaseImpl';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly removeUserUseCase?: RemoveUserUseCaseImpl,
    private readonly updateUserRoleUseCase?: UpdateUserRoleUseCaseImpl
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
    if (!this.removeUserUseCase) {
      res.status(500).json({ error: 'RemoveUserUseCase not configured' });
      return;
    }

    const { userId } = req.params;
    const { organizationId } = req.body as { organizationId: string };

    try {
      await this.removeUserUseCase.execute(userId, organizationId);
      res.status(200).json({ success: true, message: 'User removed successfully' });
    } catch (error) {
      res.status(400).json({
        error: 'Erreur lors de la suppression de l\'utilisateur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    if (!this.updateUserRoleUseCase) {
      res.status(500).json({ error: 'UpdateUserRoleUseCase not configured' });
      return;
    }

    const { userId } = req.params;
    const { role, organizationId } = req.body as { role: string; organizationId: string };

    try {
      await this.updateUserRoleUseCase.execute(userId, role, organizationId);
      res.status(200).json({ success: true, message: 'User role updated successfully' });
    } catch (error) {
      res.status(400).json({
        error: 'Erreur lors de la mise à jour du rôle',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}
