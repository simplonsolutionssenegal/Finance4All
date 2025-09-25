// src/infrastructure/web/controllers/ProductController.ts (adapté avec votre style)
import { type Request, type Response } from 'express';
import type { GetProductByIdUseCaseImpl } from '@/domain/use-cases/getProductByIdUseCaseImpl';
import type { GetProductsUseCaseImpl } from '@/domain/use-cases/getProductsUseCaseImpl';
import type { CreateProductUseCaseImpl } from '@/domain/use-cases/createProductUseCaseImpl';
import { type ProductFilter, type ProductType } from '@/domain/entities/Product';
import { logger } from '@/utils/logger';

export class ProductController {
  constructor(
    private readonly getProductByIdUseCase: GetProductByIdUseCaseImpl,
    private readonly getProductsUseCase: GetProductsUseCaseImpl,
    private readonly createProductUseCase: CreateProductUseCaseImpl
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
      const { type, designation, montantMinimum, montantMaximum, page = 1, limit = 10 } = query;

      // Validation du type de produit
      const isValidProductType = (value: string): value is ProductType => {
        return ['credit', 'epargne', 'investissement', 'assurance'].includes(value);
      };

      const filters: ProductFilter = {
        type: type && typeof type === 'string' && isValidProductType(type) ? type : undefined,
        designation: designation as string | undefined,
        montantMinimum: montantMinimum ? parseFloat(montantMinimum as string) : undefined,
        montantMaximum: montantMaximum ? parseFloat(montantMaximum as string) : undefined,
      };

      const pagination = {
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 100),
      };

      const result = await this.getProductsUseCase.execute(filters, pagination);

      res.json({
        status: 'success',
        data: result.data,
        pagination: result.pagination,
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

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Tentative de création de produit', { body: req.body as unknown });

      const productData = req.body as unknown;
      const product = await this.createProductUseCase.execute(productData);

      logger.info('Produit créé avec succès', { productId: product.id });

      res.status(201).json({
        status: 'success',
        message: 'Produit créé avec succès',
        data: product,
      });
    } catch (error) {
      logger.error('Erreur lors de la création du produit', {
        error: error as unknown,
        errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
        errorStack: error instanceof Error ? error.stack : undefined,
        body: req.body as unknown,
      });

      if (
        error instanceof Error &&
        (error.message.includes('requis') ||
          error.message.includes('invalide') ||
          error.message.includes('doit être'))
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
