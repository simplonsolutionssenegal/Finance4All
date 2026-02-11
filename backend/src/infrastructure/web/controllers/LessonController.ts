// infrastructure/web/controllers/LessonController.ts

import type { Request, Response } from 'express';
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const lesson = await this.getLessonByIdUseCase.execute({ id });

      res.status(200).json({
        status: 'success',
        data: lesson,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async addQuiz(req: Request, res: Response): Promise<void> {
    try {
      const { id: lessonId } = req.params;
      const quizData = req.body;

      const command = {
        ...quizData,
        lessonId,
      };

      const updatedLesson = await this.addQuizLessonUseCase.execute(command);

      res.status(200).json({
        status: 'success',
        data: updatedLesson,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message,
        details: error.stack,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
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
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message,
        details: error.stack,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.deleteLessonUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Lesson deleted successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message,
        details: error.stack,
      });
    }
  }
}
