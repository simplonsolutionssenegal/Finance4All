import { Router } from 'express';
import type { InstitutionController } from '../controllers/InstitutionController';
import {
  validateCreateInstitution,
  validatePagination,
  validateInstitutionId,
  handleValidationErrors,
  validateUpdateInstitution,
  validateAddService,
  validatePatchService,
} from '../validators/institution.validator';
import { container, TYPES } from '@/infrastructure/config/container';

export const InstitutionRoutes = (): Router => {
  const router = Router();
  const controller = container.get<InstitutionController>(TYPES.InstitutionController);

  // Bind methods to preserve 'this' context
  const boundController = {
    create: controller.create.bind(controller),
    update: controller.update.bind(controller),
    addService: controller.addService.bind(controller),
    activate: controller.activate.bind(controller),
    desactivate: controller.desactivate.bind(controller),
    getAll: controller.getAll.bind(controller),
    getById: controller.getById.bind(controller),
    updateService: controller.updateService.bind(controller),
  };

  router.get('/', validatePagination, handleValidationErrors, boundController.getAll);
  router.get('/:id', validateInstitutionId, handleValidationErrors, boundController.getById);
  router.post('/', validateCreateInstitution, handleValidationErrors, boundController.create);
  router.put('/:id', validateUpdateInstitution, handleValidationErrors, boundController.update);
  router.patch(
    '/:id/activate',
    validateInstitutionId,
    handleValidationErrors,
    boundController.activate
  );
  router.patch(
    '/:id/desactivate',
    validateInstitutionId,
    handleValidationErrors,
    boundController.desactivate
  );
  router.put(
    '/:id/services',
    validateAddService,
    handleValidationErrors,
    boundController.addService
  );

  router.put(
    '/:institutionId/services/:serviceId',
    validatePatchService,
    handleValidationErrors,
    boundController.updateService
  );

  return router;
};
