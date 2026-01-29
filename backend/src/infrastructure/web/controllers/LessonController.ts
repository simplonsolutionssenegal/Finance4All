import type { Request, Response, NextFunction } from 'express';
import type { GetLessonByIdUseCase } from '@/domain/formations/ports/in/GetLessonByIdUseCase';

export class LessonController {
  constructor(private readonly getLessonByIdUseCase: GetLessonByIdUseCase) {}

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.getLessonByIdUseCase.execute({ id });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
