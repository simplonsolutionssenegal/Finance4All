// src/infrastructure/web/routes/product.routes.ts (exactement comme vos user routes)
import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { GetServicesUseCaseImpl } from '@/domain/use-cases/getServiceUseCaseImpl';

import { PrismaServiceRepository } from '@/infrastructure/config/ServiceRepository';
import { GetServiceByIdUseCaseImpl } from '@/domain/use-cases/getServiceByIdUseCaseImpl';

const router = Router();

const serviceRepository = new PrismaServiceRepository();
const getServiceByIdUseCase = new GetServiceByIdUseCaseImpl(serviceRepository);
const getServicesUseCase = new GetServicesUseCaseImpl(serviceRepository);
const serviceController = new ServiceController(getServiceByIdUseCase, getServicesUseCase);

// Routes avec le même style que vos user routes
router.get('/', (req, res) => serviceController.getServices(req, res));
router.route('/:id').get((req, res) => serviceController.getServiceById(req, res));

export default router;
