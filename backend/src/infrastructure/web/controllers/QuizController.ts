import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

import type { GetQuizByIdUseCase } from '@/domain/formations/ports/in/GetQuizByIdUseCase';
import type { SubmitQuizAttemptUseCase } from '@/domain/formations/ports/in/SubmitQuizAttemptUseCase';
import type { GetQuizProgressUseCase } from '@/domain/formations/ports/in/GetQuizProgressUseCase';
import type { UpdateQuizUseCase } from '@/domain/formations/ports/in/UpdateQuizUseCase';
import type { UpdateQuizStatusUseCase } from '@/domain/formations/ports/in/UpdateStatusQuizUseCase';
import type { DeleteQuizUseCase } from '@/domain/formations/ports/in/DeleteQuizUseCase';
import { QuizStatus } from '@/domain/formations/entities/Quiz';

export class QuizController {
  constructor(
    private readonly getQuizByIdUseCase: GetQuizByIdUseCase,
    private readonly updateQuizUseCase: UpdateQuizUseCase,
    private readonly updateStatusQuizUseCase: UpdateQuizStatusUseCase,
    private readonly deleteQuizUseCase: DeleteQuizUseCase,
    private readonly submitQuizAttemptUseCase: SubmitQuizAttemptUseCase,
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
      const { userId: userIdFromAuth } = getAuth(req);
      const userId = userIdFromAuth ?? (req.query.userId as string) ?? (req.body?.userId as string);
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

  async publie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await this.updateStatusQuizUseCase.execute({
        id,
        status: QuizStatus.PUBLISHED,
      });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await this.updateStatusQuizUseCase.execute({
        id,
        status: QuizStatus.ARCHIVED,
      });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async draft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await this.updateStatusQuizUseCase.execute({
        id,
        status: QuizStatus.DRAFT,
      });
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Token (getAuth) ou userId en query lorsque le proxy Next.js envoie userId (ex. session pending)
      const { userId: userIdFromAuth } = getAuth(req);
      const userId = userIdFromAuth ?? (req.query.userId as string);
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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const updateData = req.body;

      const command = {
        id,
        ...updateData,
      };

      const updatedQuiz = await this.updateQuizUseCase.execute(command);

      res.status(200).json({
        status: 'success',
        data: updatedQuiz,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.deleteQuizUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Quiz deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
