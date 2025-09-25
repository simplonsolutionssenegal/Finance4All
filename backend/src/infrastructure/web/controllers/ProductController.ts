// src/infrastructure/web/controllers/ProductController.ts (adapté avec votre style)
import { type Request, type Response } from 'express';
import type { GetProductByIdUseCaseImpl } from '@/domain/use-cases/getProductByIdUseCaseImpl';
import type { GetProductsUseCaseImpl } from '@/domain/use-cases/getProductsUseCaseImpl';
import { ProductType, type ProductFilter } from '@/domain/entities/Product';
import { logger } from '@/infrastructure/utils/logger';

export class ProductController {
  constructor(
    private readonly getProductByIdUseCase: GetProductByIdUseCaseImpl,
    private readonly getProductsUseCase: GetProductsUseCaseImpl
  ) {}

  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction : gérer le cas où req.params ou req.params.id est manquant
      const id = req.params?.id;

      if (!id || typeof id !== 'string' || id.trim() === '') {
        res.status(400).json({
          status: 'error',
          message: 'ID du produit requis',
        });
        return;
      }

      const product = await this.getProductByIdUseCase.execute(id);

      if (!product) {
        res.status(404).json({
          status: 'error',
          message: 'Produit non trouvé',
        });
        return;
      }

      res.json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération du produit', {
        error: error as unknown,
        productId: req.params?.id,
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

  getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction : gérer le cas où req.query est undefined
      const query = req.query ?? {};
      const { type, designation, montantMinimum, montantMaximum } = query;

      // Validation du type de produit en utilisant l'enum
      const isValidProductType = (value: string): value is ProductType => {
        return Object.values(ProductType).includes(value as ProductType);
      };
      const typeParam = Array.isArray(type) ? type[0] : type;
      const typeStr = typeof typeParam === 'string' ? typeParam : undefined;
      const filters: ProductFilter = {
        type: typeStr && isValidProductType(typeStr) ? typeStr : undefined,
        designation: typeof designation === 'string' ? designation : undefined,
        montantMinimum: typeof montantMinimum === 'string' ? parseFloat(montantMinimum) : undefined,
        montantMaximum: typeof montantMaximum === 'string' ? parseFloat(montantMaximum) : undefined,
      };

      const result = await this.getProductsUseCase.execute(filters);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des produits', {
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
