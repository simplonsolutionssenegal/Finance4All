// src/infrastructure/web/controllers/ProductController.ts
import type { Request, Response } from 'express';
import type { GetProductByInstitutionUseCase } from '@/application/use-cases/GetProductByInstitutionUseCase';
import type { FilterProductUseCase } from '@/application/use-cases/FilterProductUseCase';
import type { ProductType } from '@/domain/entities/types/ProductType';
import { InstitutionNotFoundError } from '@/domain/errors/InstitutionNotFoundError';

export class ProductController {
  constructor(
    private readonly getProductsByInstitution: GetProductByInstitutionUseCase,
    private readonly filterServices: FilterProductUseCase
  ) {}

  // byInstitution = async (req: Request, res: Response) => {
  //   try {
  //     const institutionId = req.params.institutionId;
  //     const products = await this.getProductsByInstitution.execute(institutionId);
  //     return res.status(200).json({ status: 'success', results: products.length, data: products });
  //   } catch (err) {
  //     if (err instanceof Error && err.message === 'INSTITUTION_NOT_FOUND') {
  //       return res.status(404).json({
  //         status: 'fail',
  //         message: 'institutionId introuvable',
  //       });
  //     }
  //     return res.status(500).json({
  //       status: 'error',
  //       message: 'Erreur lors de la récupération des services',
  //     });
  //   }
  // };

  byInstitution = async (req: Request, res: Response) => {
    try {
      const { institutionId } = req.params;
      const products = await this.getProductsByInstitution.execute(institutionId);
      return res.status(200).json({ status: 'success', results: products.length, data: products });
    } catch (err: unknown) {
      if (err instanceof InstitutionNotFoundError) {
        return res.status(404).json({
          status: 'error',
          code: 'INSTITUTION_NOT_FOUND',
          message: err.message,
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la récupération des services',
      });
    }
  };

  filterByInstitution = async (req: Request, res: Response) => {
    try {
      const institutionId = String(req.params.institutionId || '');

      const typeParam = req.query.type;
      const rawTypes = Array.isArray(typeParam) ? typeParam : typeParam ? [typeParam] : [];
      const types: ProductType[] | undefined = rawTypes.length
        ? (rawTypes.map(t => String(t).toUpperCase()) as ProductType[])
        : undefined;

      const zoneParam = req.query.zone;
      const rawZones = Array.isArray(zoneParam) ? zoneParam : zoneParam ? [zoneParam] : [];
      const zoneCodes: string[] | undefined = rawZones.map(z => String(z).trim()).filter(Boolean);
      const zoneArg = zoneCodes && zoneCodes.length ? zoneCodes : undefined;

      const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined;
      const datePreset = dateParam === 'recent' || dateParam === '3mois' ? dateParam : undefined;

      const services = await this.filterServices.execute({
        institutionId,
        types,
        zoneCodes: zoneArg,
        datePreset,
      });

      return res.status(200).json({
        status: 'success',
        results: services.length,
        data: services,
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'INSTITUTION_NOT_FOUND') {
        return res.status(404).json({
          status: 'fail',
          message: 'institutionId introuvable',
        });
      }

      const message = e instanceof Error ? e.message : 'Erreur lors du filtrage des services';
      return res.status(500).json({ status: 'error', message });
    }
  };
}
