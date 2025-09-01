import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../../application/use-cases/CreateUserUseCase';

export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {
    // Injection de dépendances
  }

  async create(req: Request, res: Response): Promise<void> {
    const { name, email } = req.body as { name: string; email: string };

    try {
      const user = await this.createUserUseCase.execute(name, email);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({
        error: "Erreur lors de la création de l'utilisateur",
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}
