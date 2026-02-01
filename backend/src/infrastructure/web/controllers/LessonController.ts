import type { Request, Response } from 'express';
import type { GetLessonByIdUseCase } from '@/domain/formations/ports/in/GetLessonByIdUseCase';
import type { AddQuizLessonUseCase } from '@/domain/formations/ports/in/AddQuizLessonUseCase';

export class LessonController {
  constructor(
    private readonly getLessonByIdUseCase: GetLessonByIdUseCase,
    private readonly addQuizLessonUseCase: AddQuizLessonUseCase
  ) {}

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
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
      const { id: lessonId } = req.params; // ✅ Récupérer l'ID depuis les params
      const quizData = req.body;

      const command = {
        ...quizData,
        lessonId, // ✅ Ajouter le lessonId
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
}
