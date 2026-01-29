import type { Request, Response, NextFunction } from 'express';

import type { GetQuizByIdUseCase } from '@/domain/formations/ports/in/GetQuizByIdUseCase';

export class QuizController {
  constructor(private readonly getQuizByIdUseCase: GetQuizByIdUseCase) {}

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.getQuizByIdUseCase.execute({ id });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
