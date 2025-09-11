import { Request, Response } from 'express';
import { GetAllRolesUseCase } from '../../../application/use-cases/GetAllRolesUseCase';

export class RoleController {
  constructor(private getAllRolesUseCase: GetAllRolesUseCase) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const roles = await this.getAllRolesUseCase.execute();
      res.json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch roles',
      });
    }
  }
}
