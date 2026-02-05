// import { Router } from "express";

import {
  handleValidationErrors,
  validateQuizId,
  validateSubmitQuizAttempt,
} from '../validators/quiz.validator';
import type { QuizController } from '@/infrastructure/web/controllers/QuizController';
import { Router } from 'express';
import { container, TYPES } from '@/infrastructure/config/container';

export const QuizRoutes = (): Router => {
  const router = Router();
  const controller = container.get<QuizController>(TYPES.QuizController);

  const boundController = {
    getById: controller.getById.bind(controller),
    submitAttempt: controller.submitAttempt.bind(controller),
    getMyProgress: controller.getMyProgress.bind(controller),
  };

  router.get('/:id', validateQuizId, handleValidationErrors, boundController.getById);
  router.post(
    '/:id/attempts',
    validateQuizId,
    validateSubmitQuizAttempt,
    handleValidationErrors,
    boundController.submitAttempt
  );
  router.get(
    '/:id/progress/me',
    validateQuizId,
    handleValidationErrors,
    boundController.getMyProgress
  );

  return router;
};
