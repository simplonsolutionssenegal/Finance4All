import { Router } from 'express';
import type { ServiceController } from '../controllers/ServiceController';
import { validatePagination, handleValidationErrors } from '../validators/institution.validator';
import { container, TYPES } from '@/infrastructure/config/container';

export const ServiceRoutes = (): Router => {
  const router = Router();
  const controller = container.get<ServiceController>(TYPES.ServiceController);

  // Bind methods to preserve 'this' context
  const boundController = {
    getAll: controller.getAll.bind(controller),
    compare: controller.compare.bind(controller),
  };

  router.get('/', validatePagination, handleValidationErrors, boundController.getAll);
  router.get('/compare', validatePagination, handleValidationErrors, boundController.compare);

  return router;
};
