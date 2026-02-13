import {
  validateLessonId,
  handleValidationErrors,
  validateUpdateLesson,
} from '@/infrastructure/web/validators/lesson.validator';
import type { LessonController } from '@/infrastructure/web/controllers/LessonController';
import { Router } from 'express';
import { container, TYPES } from '@/infrastructure/config/container';

export const LessonRoutes = (): Router => {
  const router = Router();
  const controller = container.get<LessonController>(TYPES.LessonController);

  const boundController = {
    getById: controller.getById.bind(controller),
    addQuiz: controller.addQuiz.bind(controller),
    update: controller.update.bind(controller),
    delete: controller.delete.bind(controller),
  };

  router.get('/:id', validateLessonId, handleValidationErrors, boundController.getById);
  router.put('/:id/quizzes', validateLessonId, handleValidationErrors, boundController.addQuiz);
  router.put(
    '/:id',
    validateLessonId,
    validateUpdateLesson,
    handleValidationErrors,
    boundController.update
  );
  router.delete('/:id', validateLessonId, handleValidationErrors, boundController.delete);
  return router;
};
