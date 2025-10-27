import { Router } from 'express';
import type { BeneficiaryController } from '../controllers/BeneficiaryController';
import {
  validateCreateBeneficiary,
  handleValidationErrors,
} from '../validators/beneficiary.validator';
import { container, TYPES } from '@/infrastructure/config/container';

export const BeneficiaryRoutes = (): Router => {
  const router = Router();
  const controller = container.get<BeneficiaryController>(TYPES.BeneficiaryController);

  // Bind methods to preserve 'this' context
  const boundController = {
    create: controller.create.bind(controller),
  };

  router.post('/', validateCreateBeneficiary, handleValidationErrors, boundController.create);

  return router;
};
