import { Router } from 'express';

import { requireSameActiveOrg } from '../middleware/requireOrg.middleware';
import { handleValidationErrors } from '../validators/module.validator';
import { container, TYPES } from '@/infrastructure/config/container';
import type { BeneficiaryController } from '../controllers/BeneficiaryController';
import {
  validateAssignModules,
  validateBeneficiaryId,
  validateRemoveModules,
} from '../validators/assignment.validator';

export const beneficiaryRoutes = (): Router => {
  const router = Router();
  const controller = container.get<BeneficiaryController>(TYPES.BeneficiaryController);

  const boundController = {
    list: controller.list.bind(controller),
    create: controller.create.bind(controller),
    update: controller.update.bind(controller),
    delete: controller.delete.bind(controller),
    assignmentSummary: controller.assignmentSummary.bind(controller),
    modulesForBeneficiary: controller.modulesForBeneficiary.bind(controller),
    assignModules: controller.assignModules.bind(controller),
    removeModules: controller.removeModules.bind(controller),
  };
  router.get('/', requireSameActiveOrg, boundController.list);
  router.post('/', requireSameActiveOrg, handleValidationErrors, boundController.create);
  router.patch(
    '/:beneficiaryId',
    requireSameActiveOrg,
    handleValidationErrors,
    boundController.update
  );
  router.delete('/:beneficiaryId', requireSameActiveOrg, boundController.delete);

  // ✅ new
  router.get('/assignments/summary', requireSameActiveOrg, boundController.assignmentSummary);

  router.get(
    '/:beneficiaryId/modules',
    requireSameActiveOrg,
    validateBeneficiaryId,
    handleValidationErrors,
    boundController.modulesForBeneficiary
  );
  router.post(
    '/:beneficiaryId/assignments',
    requireSameActiveOrg,
    validateAssignModules,
    handleValidationErrors,
    boundController.assignModules
  );
  router.delete(
    '/:beneficiaryId/assignments',
    requireSameActiveOrg,
    validateRemoveModules,
    handleValidationErrors,
    boundController.removeModules
  );

  return router;
};
