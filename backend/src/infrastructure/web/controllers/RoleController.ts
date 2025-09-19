import { Request, Response } from 'express';
import { RoleService } from '../services/RoleService';

export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  async list(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const roles = await this.roleService.listAll(page, limit);

    res.status(200).json({
      status: 'success',
      page,
      limit,
      results: roles.length,
      data: roles,
    });
  }
}
