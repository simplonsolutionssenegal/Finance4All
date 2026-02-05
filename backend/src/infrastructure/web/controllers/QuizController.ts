import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

import type { GetQuizByIdUseCase } from '@/domain/formations/ports/in/GetQuizByIdUseCase';
import type { SubmitQuizAttemptUseCase } from '@/domain/formations/ports/in/SubmitQuizAttemptUseCase';
import type { GetQuizProgressUseCase } from '@/domain/formations/ports/in/GetQuizProgressUseCase';

export class QuizController {
  constructor(
    private readonly getQuizByIdUseCase: GetQuizByIdUseCase,
    private readonly submitQuizAttemptUseCase?: SubmitQuizAttemptUseCase,
    private readonly getQuizProgressUseCase?: GetQuizProgressUseCase
  ) {}

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await this.getQuizByIdUseCase.execute({ id });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({
          error: 'Non autorise',
          message: 'Utilisateur non authentifie',
        });
        return;
      }

      if (!this.submitQuizAttemptUseCase) {
        throw new Error('SubmitQuizAttemptUseCase is not configured');
      }

      const quizId = req.params.id as string;
      const answers = req.body.answers as {
        questionIndex: number;
        selectedOptionIndexes: number[];
      }[];

      const result = await this.submitQuizAttemptUseCase.execute({
        quizId,
        userId,
        answers,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({
          error: 'Non autorise',
          message: 'Utilisateur non authentifie',
        });
        return;
      }

      if (!this.getQuizProgressUseCase) {
        throw new Error('GetQuizProgressUseCase is not configured');
      }

      const quizId = req.params.id as string;
      const result = await this.getQuizProgressUseCase.execute({
        quizId,
        userId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
