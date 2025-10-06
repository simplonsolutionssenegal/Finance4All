import type { CreateInstitutionUseCase } from '@/application/institutions/use-cases/CreateInsitution.usecase';
import type { Request, Response, NextFunction } from 'express';

export class InstitutionController {
  constructor(private readonly createInstitutionUseCase: CreateInstitutionUseCase) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.createInstitutionUseCase.execute(req.body);
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
