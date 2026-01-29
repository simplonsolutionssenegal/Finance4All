// import { Router } from "express";

import { handleValidationErrors, validateQuizId } from '../validators/quiz.validator';
import type { QuizController } from '@/infrastructure/web/controllers/QuizController';
import { Router } from 'express';
import { container, TYPES } from '@/infrastructure/config/container';

export const QuizRoutes = (): Router => {
  const router = Router();
  const controller = container.get<QuizController>(TYPES.QuizController);

  const boundController = {
    getById: controller.getById.bind(controller),
  };

  router.get('/:id', validateQuizId, handleValidationErrors, boundController.getById);

  return router;
};
