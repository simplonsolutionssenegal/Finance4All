import { Router } from 'express';
import type { InstitutionController } from '../controllers/InstitutionController';
import {
  validateCreateInstitution,
  validatePagination,
  handleValidationErrors,
} from '../validators/institution.validator';
import { container, TYPES } from '@/infrastructure/config/container';

export const InstitutionRoutes = (): Router => {
  const router = Router();
  const controller = container.get<InstitutionController>(TYPES.InstitutionController);

  // Bind methods to preserve 'this' context
  const boundController = {
    create: controller.create.bind(controller),
    getAll: controller.getAll.bind(controller),
  };

  router.get('/', validatePagination, handleValidationErrors, boundController.getAll);
  router.post('/', validateCreateInstitution, handleValidationErrors, boundController.create);

  return router;
};
