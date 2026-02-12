import { Router } from 'express';
import { container, TYPES } from '@/infrastructure/config/container';
import type { ModuleController } from '@/infrastructure/web/controllers/ModuleFormationController';
import {
  handleValidationErrors,
  validateCreateModule,
  validateGetModules,
  validatePagination,
  validateModuleId,
  validateUpdateModule,
} from '../validators/module.validator';

export const ModuleFormationRoutes = (): Router => {
  const router = Router();
  const controller = container.get<ModuleController>(TYPES.ModuleController);

  const boundController = {
    create: controller.create.bind(controller),
    getAll: controller.getAll.bind(controller),
    getById: controller.getById.bind(controller),
    addLesson: controller.addLesson.bind(controller),
    addQuiz: controller.addQuiz.bind(controller),
    update: controller.update.bind(controller),
    enroll: controller.enroll.bind(controller),
    getMyEnrollments: controller.getMyEnrollments.bind(controller),
  };

  router.get(
    '/',
    validatePagination,
    validateGetModules,
    handleValidationErrors,
    boundController.getAll
  );
  router.get('/enrollments/me', handleValidationErrors, boundController.getMyEnrollments);
  router.put(
    '/:id',
    validateModuleId,
    validateUpdateModule,
    handleValidationErrors,
    boundController.update
  );
  router.post('/', validateCreateModule, handleValidationErrors, boundController.create);
  router.get('/:id', validateModuleId, handleValidationErrors, boundController.getById);
  router.post('/:id/enroll', validateModuleId, handleValidationErrors, boundController.enroll);
  router.put('/:id/lessons', validateModuleId, handleValidationErrors, boundController.addLesson);
  router.put('/:id/quizzes', validateModuleId, handleValidationErrors, boundController.addQuiz);

  return router;
};
