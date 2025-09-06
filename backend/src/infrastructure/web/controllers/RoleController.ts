import { Request, Response } from 'express';
import { RoleService } from '../services/RoleService';

export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  async list(req: Request, res: Response): Promise<void> {
    const roles = await this.roleService.listAll();
    res.status(200).json({ status: 'success', results: roles.length, data: roles });
  }
}
