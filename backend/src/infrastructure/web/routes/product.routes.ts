import { Router } from 'express';

import { PrismaProductRepository } from '@/infrastructure/database/PrismaProductRepository';
import { GetProductByInstitutionUseCaseImpl } from '@/domain/use-cases/GetProductByInstitutionUseCaseImpl';
import { FilterProductUseCaseImpl } from '@/domain/use-cases/FilterProductUseCaseImpl';
import { ProductController } from '@/infrastructure/web/controllers/ProductController';

const router = Router();

const repo = new PrismaProductRepository();
const byInstitutionUC = new GetProductByInstitutionUseCaseImpl(repo);
const filterUC = new FilterProductUseCaseImpl(repo);

const controller = new ProductController(byInstitutionUC, filterUC);

// existants
router.get('/by-institution/:institutionId', (req, res) => controller.byInstitution(req, res));

// nouveau filtre
router.get('/by-institution/:institutionId/filter', (req, res) =>
  controller.filterByInstitution(req, res)
);

export { router as productRoutes };
