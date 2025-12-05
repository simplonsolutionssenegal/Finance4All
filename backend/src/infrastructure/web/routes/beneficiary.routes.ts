import { Router } from 'express';

import { requireSameActiveOrg } from '../middleware/requireOrg.middleware';
import { handleValidationErrors } from '../validators/module.validator';
import { container, TYPES } from '@/infrastructure/config/container';
import type { BeneficiaryController } from '../controllers/BeneficiaryController';

export const beneficiaryRoutes = (): Router => {
  const router = Router();
  const controller = container.get<BeneficiaryController>(TYPES.BeneficiaryController);

  const boundController = {
    create: controller.create.bind(controller),
    update: controller.update.bind(controller),
  };
  router.post('/', requireSameActiveOrg, handleValidationErrors, boundController.create);
  router.patch(
    '/:beneficiaryId',
    requireSameActiveOrg,
    handleValidationErrors,
    boundController.update
  );

  return router;
};
