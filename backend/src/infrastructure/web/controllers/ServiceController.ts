// src/infrastructure/web/controllers/ProductController.ts
import type { Request, Response } from 'express';
import type { GetServicesByInstitutionUseCase } from '@/application/use-cases/GetServiceByInstitutionUseCase';
import type { FilterServicesUseCase } from '@/application/use-cases/FilterServicesUseCase';
import type { ServiceType } from '@/domain/entities/types/ServiceType';

export class ServiceController {
  constructor(
    // private readonly listProducts: ListServiceUseCase,
    private readonly getProductsByInstitution: GetServicesByInstitutionUseCase,
    private readonly filterServices: FilterServicesUseCase
  ) {}

  // GET /products/institution/:institutionId
  byInstitution = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.institutionId);
      if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).json({ status: 'fail', message: 'institutionId invalide' });
      }
      const products = await this.getProductsByInstitution.execute(id);
      res.status(200).json({ status: 'success', results: products.length, data: products });
    } catch (_e) {
      res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la récupération des produits',
      });
    }
  };

  filterByInstitution = async (req: Request, res: Response) => {
    try {
      const institutionId = Number(req.params.institutionId);
      if (!Number.isFinite(institutionId) || institutionId <= 0) {
        return res.status(400).json({ status: 'fail', message: 'institutionId invalide' });
      }

      const typeParam = req.query.type;
      const types: ServiceType[] | undefined = Array.isArray(typeParam)
        ? (typeParam as string[]).map(t => t.toUpperCase() as ServiceType)
        : typeof typeParam === 'string'
          ? [(typeParam as string).toUpperCase() as ServiceType]
          : undefined;

      // const zoneParam = req.query.zone;
      // const zoneId = typeof zoneParam === 'string' ? Number(zoneParam) : undefined;
      const zoneParam = req.query.zone;
      const zoneId =
        typeof zoneParam === 'string' && Number.isFinite(Number(zoneParam))
          ? Number(zoneParam)
          : undefined;

      const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined;
      const datePreset =
        dateParam === 'recent' || dateParam === '3mois'
          ? (dateParam as 'recent' | '3mois')
          : undefined;

      const services = await this.filterServices.execute({
        institutionId,
        types,
        zoneId,
        datePreset, // 👈 passe le preset
      });

      res.status(200).json({
        status: 'success',
        results: services.length,
        data: services,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur lors du filtrage des services';
      res.status(500).json({ status: 'error', message });
    }
  };
}
