import { Router } from 'express';
import { container, TYPES } from '@/infrastructure/config/container';
import type { ModuleController } from '@/infrastructure/web/controllers/ModuleFormationController';
import {
  handleValidationErrors,
  validateCreateModule,
  validateGetModules,
} from '../validators/module.validator';

export const createModuleRoutes = (): Router => {
  const router = Router();
  const controller = container.get<ModuleController>(TYPES.ModuleController);

  const boundController = {
    create: controller.create.bind(controller),
    getAll: controller.getAll.bind(controller),
  };

  router.get('/', validateGetModules, handleValidationErrors, boundController.getAll);
  router.post('/', validateCreateModule, handleValidationErrors, boundController.create);

  return router;
};
