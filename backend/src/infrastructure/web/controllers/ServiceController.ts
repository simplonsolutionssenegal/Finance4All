// src/infrastructure/web/controllers/ProductController.ts
import type { Request, Response } from 'express';
import type { GetServicesByInstitutionUseCase } from '@/application/use-cases/GetServiceByInstitutionUseCase';
import type { FilterServicesUseCase } from '@/application/use-cases/FilterServicesUseCase';
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';
import { validate as isUuid } from 'uuid';

export class ServiceController {
  constructor(
    private readonly getProductsByInstitution: GetServicesByInstitutionUseCase,
    private readonly filterServices: FilterServicesUseCase
  ) {}

  byInstitution = async (req: Request, res: Response) => {
    try {
      const institutionId = req.params.institutionId;
      if (!isUuid(institutionId)) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'institutionId invalide (UUID attendu)' });
      }
      const services = await this.getProductsByInstitution.execute(institutionId);
      return res.status(200).json({ status: 'success', results: services.length, data: services });
    } catch {
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la récupération des services',
      });
    }
  };

  // filterByInstitution = async (req: Request, res: Response) => {
  //   try {
  //     const institutionId = req.params.institutionId;

  //     if (!isUuid(institutionId)) {
  //       return res.status(400).json({ status: 'fail', message: 'institutionId invalide (UUID attendu)' });
  //     }
  //     const typeParam = req.query.type;
  //     const types: ServiceType[] | undefined = Array.isArray(typeParam)
  //       ? (typeParam as string[]).map(t => t.toUpperCase() as ServiceType)
  //       : typeof typeParam === 'string'
  //         ? [(typeParam as string).toUpperCase() as ServiceType]
  //         : undefined;

  //     const zoneParam = req.query.zone;
  //     let zoneIds: string[] | undefined;

  //     if (Array.isArray(zoneParam)) {
  //       zoneIds = zoneParam
  //         .map(z => String(z))
  //         .filter(z => isUuid(z));
  //     } else if (typeof zoneParam === 'string') {
  //       zoneIds = isUuid(zoneParam) ? [zoneParam] : undefined;
  //     }

  //     const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined;
  //     const datePreset =
  //       dateParam === 'recent' || dateParam === '3mois'
  //         ? (dateParam as 'recent' | '3mois')
  //         : undefined;

  //     const services = await this.filterServices.execute({
  //       institutionId,
  //       types,
  //       zoneIds,
  //       datePreset,
  //     });

  //     res.status(200).json({
  //       status: 'success',
  //       results: services.length,
  //       data: services,
  //     });
  //   } catch (e: unknown) {
  //     const message = e instanceof Error ? e.message : 'Erreur lors du filtrage des services';
  //     res.status(500).json({ status: 'error', message });
  //   }
  // };
  filterByInstitution = async (req: Request, res: Response) => {
    try {
      const institutionId = String(req.params.institutionId || '');
      if (institutionId.length < 3) {
        return res.status(400).json({ status: 'fail', message: 'institutionId invalide' });
      }

      // types (string | string[])
      const typeParam = req.query.type;
      const rawTypes = Array.isArray(typeParam) ? typeParam : typeParam ? [typeParam] : [];
      const types: ServiceType[] | undefined = rawTypes.length
        ? (rawTypes.map(t => String(t).toUpperCase()) as ServiceType[])
        : undefined;

      // zones (string | string[]) — strings libres
      const zoneParam = req.query.zone;
      const rawZones = Array.isArray(zoneParam) ? zoneParam : zoneParam ? [zoneParam] : [];
      const zoneCodes: string[] | undefined = rawZones.map(z => String(z).trim()).filter(Boolean);
      const zoneArg = zoneCodes && zoneCodes.length ? zoneCodes : undefined;

      // date preset
      const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined;
      const datePreset = dateParam === 'recent' || dateParam === '3mois' ? dateParam : undefined;

      const services = await this.filterServices.execute({
        institutionId,
        types,
        zoneCodes: zoneArg,
        datePreset,
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
