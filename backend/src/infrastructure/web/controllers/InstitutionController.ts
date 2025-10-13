import type { NextFunction, Request, Response } from 'express';
import type { CreateInstitutionUseCase } from '@/domain/institutions/ports/in/CreateInstitutionUseCase';
import type { GetInstitutionsUseCase } from '@/domain/institutions/ports/in/GetInstitutionsUseCase';
import type { GetInstitutionByIdUseCase } from '@/domain/institutions/ports/in/GetInstitutionByIdUseCase';
import type { UpdateInstitutionUseCase } from '@/domain/institutions/ports/in/UpdateInstitutionUseCase';
import type { UpdateInstitutionStatusUseCase } from '@/domain/institutions/ports/in/UpdateInstitutionStatusUseCase';
import { InstitutionStatus } from '@/domain/institutions/entities/Institution';
import type { AddServiceUseCase } from '@/domain/institutions/ports/in/AddServiceUseCase';
import type { TypeService } from '@/domain/institutions/entities/Service';
import type { FilterServicesByInstitutionUseCase } from '@/domain/institutions/ports/in/FilterServicesByInstitutionUseCase';

export class InstitutionController {
  constructor(
    private readonly createInstitutionUseCase: CreateInstitutionUseCase,
    private readonly updateInstitutionUseCase: UpdateInstitutionUseCase,
    private readonly updateInstitutionStatusUseCase: UpdateInstitutionStatusUseCase,
    private readonly addServiceUseCase: AddServiceUseCase,
    private readonly getInstitutionsUseCase: GetInstitutionsUseCase,
    private readonly getInstitutionByIdUseCase: GetInstitutionByIdUseCase,
    private readonly filterServicesByInstitutionUseCase: FilterServicesByInstitutionUseCase
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
  filterByInstitution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const institutionId = String(req.params.institutionId || req.params.id || '');
      const typeParam = req.query.type;

      // S3358: Extraction de l'opération ternaire imbriquée
      const asArray = (v: unknown): string[] => {
        if (Array.isArray(v)) {
          return v as string[];
        }
        if (typeof v === 'string') {
          return v.split(',');
        }
        return [];
      };

      const rawTypes = asArray(typeParam)
        .map(t => String(t).trim())
        .filter(Boolean);
      const types = rawTypes.length
        ? (rawTypes.map(t => t.toUpperCase()) as TypeService[])
        : undefined;

      const preset = typeof req.query.date === 'string' ? req.query.date.toLowerCase() : undefined;
      const fromParam = typeof req.query.from === 'string' ? req.query.from : undefined;
      let fromDate: Date | undefined;

      if (fromParam) {
        const d = new Date(fromParam);
        fromDate = isNaN(d.getTime()) ? undefined : d;
      } else if (preset === 'recent') {
        fromDate = new Date(Date.now() - 30 * 24 * 3600 * 1000);
      } else if (preset === '3mois') {
        fromDate = new Date(Date.now() - 90 * 24 * 3600 * 1000);
      } else if (preset === '6mois') {
        fromDate = new Date(Date.now() - 180 * 24 * 3600 * 1000);
      }

      // S6551: Conversion sécurisée en string pour éviter [object Object]
      const pageParam = req.query.page;
      const pageValue =
        typeof pageParam === 'string' || typeof pageParam === 'number' ? String(pageParam) : '1';
      const page = parseInt(pageValue, 10) || 1;

      const limitParam = req.query.limit;
      const limitValue =
        typeof limitParam === 'string' || typeof limitParam === 'number'
          ? String(limitParam)
          : '10';
      const limit = parseInt(limitValue, 10) || 10;

      const result = await this.filterServicesByInstitutionUseCase.execute({
        institutionId,
        types,
        fromDate,
        page,
        limit,
      });

      res.status(200).json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  };
}
