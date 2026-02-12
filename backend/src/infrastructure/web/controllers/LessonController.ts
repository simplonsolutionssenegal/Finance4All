import type { NextFunction, Request, Response } from 'express';
import type { GetLessonByIdUseCase } from '@/domain/formations/ports/in/GetLessonByIdUseCase';
import type { AddQuizLessonUseCase } from '@/domain/formations/ports/in/AddQuizLessonUseCase';
import type { UpdateLessonUseCase } from '@/domain/formations/ports/in/UpdateLessonUseCase';
import type { DeleteLessonUseCase } from '@/domain/formations/ports/in/DeleteLessonUseCase';

export class LessonController {
  constructor(
    private readonly getLessonByIdUseCase: GetLessonByIdUseCase,
    private readonly addQuizLessonUseCase: AddQuizLessonUseCase,
    private readonly updateLessonUseCase: UpdateLessonUseCase,
    private readonly deleteLessonUseCase: DeleteLessonUseCase
  ) {}

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const lesson = await this.getLessonByIdUseCase.execute({ id });

      res.status(200).json({
        status: 'success',
        data: lesson,
      });
    } catch (error) {
      next(error);
    }
  }

  async addQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const quizData = req.body;

      const updatedLesson = await this.addQuizLessonUseCase.execute({ lessonId: id, ...quizData });

      res.status(201).json({
        status: 'success',
        data: updatedLesson,
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

      const updatedLesson = await this.updateLessonUseCase.execute(command);

      res.status(200).json({
        status: 'success',
        data: updatedLesson,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.deleteLessonUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Lesson deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
