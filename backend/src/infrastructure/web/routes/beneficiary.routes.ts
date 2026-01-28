import { Router } from 'express';

import { requireSameActiveOrg } from '../middleware/requireOrg.middleware';
import { handleValidationErrors } from '../validators/module.validator';
import { container, TYPES } from '@/infrastructure/config/container';
import type { BeneficiaryController } from '../controllers/BeneficiaryController';

export const beneficiaryRoutes = (): Router => {
  const router = Router();
  const controller = container.get<BeneficiaryController>(TYPES.BeneficiaryController);

  const boundController = {
    list: controller.list.bind(controller),
    create: controller.create.bind(controller),
    update: controller.update.bind(controller),
    delete: controller.delete.bind(controller),
    getDashboard: controller.getDashboard.bind(controller),
  };
  router.get('/dashboard', boundController.getDashboard);
  router.get('/', requireSameActiveOrg, boundController.list);
  router.post('/', requireSameActiveOrg, handleValidationErrors, boundController.create);
  router.patch(
    '/:beneficiaryId',
    requireSameActiveOrg,
    handleValidationErrors,
    boundController.update
  );
  router.delete('/:beneficiaryId', requireSameActiveOrg, boundController.delete);

  return router;
};
