import type { Request, Response, NextFunction } from 'express';
import type { CreateInstitutionUseCase } from '@/domain/institutions/ports/in/CreateInstitutionUseCase';

export class InstitutionController {
  constructor(private readonly createInstitutionUseCase: CreateInstitutionUseCase) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.createInstitutionUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
