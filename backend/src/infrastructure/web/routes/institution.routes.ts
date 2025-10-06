import { Router } from 'express';
import type { InstitutionController } from '../controllers/InstitutionController';
import {
  validateCreateInstitution,
  handleValidationErrors,
} from '../validators/institution.validator';
import { container } from '@/infrastructure/config/container';

export const createInstitutionRoutes = (): Router => {
  const router = Router();
  const controller = container.get<InstitutionController>('InstitutionController');

  // Bind methods to preserve 'this' context
  const boundController = {
    create: controller.create.bind(controller),
  };

  router.post('/', validateCreateInstitution, handleValidationErrors, boundController.create);

  return router;
};
