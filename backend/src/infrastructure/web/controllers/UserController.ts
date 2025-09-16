import { Request, Response } from 'express';
import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';

export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, email } = req.body as { name?: string; email?: string };
      const user = await this.createUserUseCase.execute(name!, email!);
      res.status(201).json(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      res.status(400).json({
        error: 'Erreur lors de la création de l\'utilisateur',
        message,
      });
    }
  }
}
