// src/infrastructure/web/controllers/ServiceController.ts
import { type Request, type Response } from 'express';

import { logger } from '@/infrastructure/utils/logger';
import type { ServiceFilter } from '@/domain/entities/Service';
import { TypeService } from '@/domain/institutions/entities/Service';
import type { GetServicesUseCaseImpl } from '@/domain/use-cases/getServiceUseCaseImpl';
import type { GetServiceByIdUseCaseImpl } from '@/domain/use-cases/getServiceByIdUseCaseImpl';

export class ServiceController {
  constructor(
    private readonly getServiceByIdUseCase: GetServiceByIdUseCaseImpl,
    private readonly getServicesUseCase: GetServicesUseCaseImpl
  ) {}

  getServiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction : gérer le cas où req.params ou req.params.id est manquant
      const id = req.params?.id;

      if (!id || typeof id !== 'string' || id.trim() === '') {
        res.status(400).json({
          status: 'error',
          message: 'ID du service requis',
        });
        return;
      }

      const service = await this.getServiceByIdUseCase.execute(id);

      if (!service) {
        res.status(404).json({
          status: 'error',
          message: 'Service non trouvé',
        });
        return;
      }

      res.json({
        status: 'success',
        data: service,
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération du service', {
        error: error as unknown,
        serviceId: req.params?.id,
      });

      if (error instanceof Error && error.message.includes('requis')) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Erreur interne du serveur',
      });
    }
  };

  getServices = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction : gérer le cas où req.query est undefined
      const query = req.query ?? {};
      const { type, name, institutionId } = query;

      // Validation du type de produit en utilisant l'enum
      const isValidServiceType = (value: string): value is TypeService => {
        return Object.values(TypeService).includes(value as TypeService);
      };
      const typeParam = Array.isArray(type) ? type[0] : type;
      const typeStr = typeof typeParam === 'string' ? typeParam : undefined;
      const filters: ServiceFilter = {
        type: typeStr && isValidServiceType(typeStr) ? typeStr : undefined,
        name: typeof name === 'string' ? name : undefined,
        institutionId: typeof institutionId === 'string' ? institutionId : undefined,
      };

      const result = await this.getServicesUseCase.execute(filters);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des services', {
        error: error as unknown,
        query: req.query as unknown,
      });

      if (
        error instanceof Error &&
        (error.message.includes('page') || error.message.includes('limite'))
      ) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Erreur interne du serveur',
      });
    }
  };
}
