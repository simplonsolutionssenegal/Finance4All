import type {
  UpdateQuizCommand,
  UpdateQuizUseCase,
} from '@/domain/formations/ports/in/UpdateQuizUseCase';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import type { QuizDTO } from '@/domain/formations/value-objects/QuizDTO';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { Quiz } from '@/domain/formations/entities/Quiz';
import {
  QuestionChoixUnique,
  QuestionChoixMultiple,
  TypeQuestion,
} from '@/domain/formations/entities/Question';
import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';

export class UpdateQuizUseCaseImpl implements UpdateQuizUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(command: UpdateQuizCommand): Promise<QuizDTO> {
    const existingQuiz = await this.quizRepository.findById(command.id);
    if (!existingQuiz) {
      throw new NotFoundError(`Quiz with id ${command.id} not found`);
    }

    const updatedQuestions = command.questions
      ? command.questions.map(q => this.mapQuestion(q))
      : existingQuiz.questions;

    const updatedQuiz = new Quiz({
      id: existingQuiz.id,
      moduleId: existingQuiz.moduleId,
      lessonId: existingQuiz.lessonId,
      chapterId: existingQuiz.chapterId,
      title: command.title ?? existingQuiz.title,
      description: command.description ?? existingQuiz.description,
      status: command.status ?? existingQuiz.status,
      scoreMinimum: command.scoreMinimum ?? existingQuiz.scoreMinimum,
      duree: command.duree !== undefined ? command.duree : existingQuiz.duree,
      nombreTentatives: command.nombreTentatives ?? existingQuiz.nombreTentatives,
      questions: updatedQuestions,
    });

    const savedQuiz = await this.quizRepository.update(updatedQuiz);
    return savedQuiz.toDTO();
  }

  private mapQuestion(dto: QuestionDTO) {
    if (dto.type === TypeQuestion.CHOIX_UNIQUE) {
      return new QuestionChoixUnique(dto.question, dto.points, dto.options, dto.explication);
    }

    if (dto.type === TypeQuestion.CHOIX_MULTIPLE) {
      return new QuestionChoixMultiple(dto.question, dto.points, dto.options, dto.explication);
    }

    throw new Error(`TypeQuestion inconnu: ${String((dto as any).type)}`);
  }
}
