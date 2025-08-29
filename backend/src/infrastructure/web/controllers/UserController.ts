import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../../application/use-cases/CreateUserUseCase';

export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async create(req: Request, res: Response) {
    const { name, email } = req.body;
    const user = await this.createUserUseCase.execute(name, email);
    res.status(201).json(user);
  }
}
