import { Router } from 'express';

import { PrismaServiceRepository } from '@/infrastructure/database/PrismaServiceRepository';
import { GetServiceByInstitutionUseCaseImpl } from '@/domain/use-cases/GetServiceByInstitutionUseCaseImpl';
import { FilterServicesUseCaseImpl } from '@/domain/use-cases/FilterServicesUseCaseImpl';
import { ServiceController } from '@/infrastructure/web/controllers/ServiceController';

const router = Router();

const repo = new PrismaServiceRepository();
const byInstitutionUC = new GetServiceByInstitutionUseCaseImpl(repo);
const filterUC = new FilterServicesUseCaseImpl(repo);

const controller = new ServiceController(byInstitutionUC, filterUC);

// existants
router.get('/by-institution/:institutionId', (req, res) => controller.byInstitution(req, res));

// nouveau filtre
router.get('/by-institution/:institutionId/filter', (req, res) =>
  controller.filterByInstitution(req, res)
);

export { router as serviceRoutes };
