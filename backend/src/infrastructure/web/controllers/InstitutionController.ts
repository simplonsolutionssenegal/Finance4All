import type { NextFunction, Request, Response } from 'express';
import type { CreateInstitutionUseCase } from '@/domain/institutions/ports/in/CreateInstitutionUseCase';
import type { GetInstitutionsUseCase } from '@/domain/institutions/ports/in/GetInstitutionsUseCase';
import type { GetInstitutionByIdUseCase } from '@/domain/institutions/ports/in/GetInstitutionByIdUseCase';
import type { UpdateInstitutionUseCase } from '@/domain/institutions/ports/in/UpdateInstitutionUseCase';
import type { UpdateInstitutionStatusUseCase } from '@/domain/institutions/ports/in/UpdateInstitutionStatusUseCase';
import { InstitutionStatus } from '@/domain/institutions/entities/Institution';
import type { AddServiceUseCase } from '@/domain/institutions/ports/in/AddServiceUseCase';

export class InstitutionController {
  constructor(
    private readonly createInstitutionUseCase: CreateInstitutionUseCase,
    private readonly updateInstitutionUseCase: UpdateInstitutionUseCase,
    private readonly updateInstitutionStatusUseCase: UpdateInstitutionStatusUseCase,
    private readonly addServiceUseCase: AddServiceUseCase,
    private readonly getInstitutionsUseCase: GetInstitutionsUseCase,
    private readonly getInstitutionByIdUseCase: GetInstitutionByIdUseCase
  ) {}

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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.updateInstitutionUseCase.execute({ id, ...req.body });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async addService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.addServiceUseCase.execute({ idInstitution: id, ...req.body });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.updateInstitutionStatusUseCase.execute({
        id,
        status: InstitutionStatus.ACTIVE,
      });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async desactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.updateInstitutionStatusUseCase.execute({
        id,
        status: InstitutionStatus.INACTIVE,
      });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.getInstitutionsUseCase.execute({ page, limit });
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.getInstitutionByIdUseCase.execute({ id });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
