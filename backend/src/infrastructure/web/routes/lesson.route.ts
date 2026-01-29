import {
  validateLessonId,
  handleValidationErrors,
} from '@/infrastructure/web/validators/lesson.validator';
import type { LessonController } from '@/infrastructure/web/controllers/LessonController';
import { Router } from 'express';
import { container, TYPES } from '@/infrastructure/config/container';

export const LessonRoutes = (): Router => {
  const router = Router();
  const controller = container.get<LessonController>(TYPES.LessonController);

  const boundController = {
    getById: controller.getById.bind(controller),
  };

  router.get('/:id', validateLessonId, handleValidationErrors, boundController.getById);

  return router;
};
