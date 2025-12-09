import type { NextFunction, Request, Response } from 'express';
import type { GetServicesUseCase } from '@/domain/institutions/ports/in/GetServicesUseCase';
import type { TypeService } from '@/domain/institutions/entities/Service';
import type { CompareServicesUseCase } from '@/domain/institutions/ports/in/CompareServicesUseCase';
import { ServiceComparisonError } from '@/domain/institutions/errors/ServiceComparisonError';
import type { CountryType } from '@/domain/institutions/value-objects/Country';

export class ServiceController {
  constructor(
    private readonly getServicesUseCase: GetServicesUseCase,
    private readonly compareServicesUseCase: CompareServicesUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as TypeService | undefined;
      const pays = req.query.pays as CountryType | undefined;

      const result = await this.getServicesUseCase.execute({
        page,
        limit,
        type,
        pays,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async compare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idsParam = req.query.ids as string | undefined;

      if (!idsParam) {
        res.status(400).json({
          success: false,
          message: 'Paramètre "ids" requis, ex: /services/compare?ids=ID1,ID2',
        });
        return;
      }

      const ids = idsParam
        .split(',')
        .map(id => id.trim())
        .filter(Boolean);

      if (ids.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Aucun id valide fourni',
        });
        return;
      }

      const data = await this.compareServicesUseCase.execute({ ids });

      res.status(200).json({
        success: true,
        data,
        message: `Comparaison de ${data.length} services du type "${data[0].type}"`,
      });
    } catch (error) {
      if (error instanceof ServiceComparisonError) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      next(error);
    }
  }
}
