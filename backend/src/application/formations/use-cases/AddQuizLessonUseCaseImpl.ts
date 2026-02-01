import { Quiz } from '@/domain/formations/entities/Quiz';
import { EntityId } from '@/domain/shared/EntityId';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

import {
  TypeQuestion,
  QuestionChoixUnique,
  QuestionChoixMultiple,
} from '@/domain/formations/entities/Question';
import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';
import type { LessonDTO } from '@/domain/formations/value-objects/LessonDTO';
import type {
  AddQuizLessonCommand,
  AddQuizLessonUseCase,
} from '@/domain/formations/ports/in/AddQuizLessonUseCase';
import type { LessonRepository } from '@/domain/formations/ports/out/LessonRepository';

export class AddQuizLessonUseCaseImpl implements AddQuizLessonUseCase {
  constructor(private readonly lessonRepository: LessonRepository) {}

  private mapQuestion(dto: QuestionDTO) {
    if (dto.type === TypeQuestion.CHOIX_UNIQUE) {
      return new QuestionChoixUnique(dto.question, dto.points, dto.options, dto.explication);
    }
    if (dto.type === TypeQuestion.CHOIX_MULTIPLE) {
      return new QuestionChoixMultiple(dto.question, dto.points, dto.options, dto.explication);
    }
    throw new Error(`TypeQuestion inconnu: ${String((dto as any).type)}`);
  }

  async execute(command: AddQuizLessonCommand): Promise<LessonDTO> {
    const existingLesson = await this.lessonRepository.findById(command.lessonId);

    if (!existingLesson) {
      throw new NotFoundError(`Lesson with id ${command.lessonId} not found`);
    }

    const questions = (command.questions ?? []).map(q => this.mapQuestion(q));

    const quiz = new Quiz({
      id: EntityId.generate(),
      title: command.title,
      description: command.description,
      status: command.status,
      scoreMinimum: command.scoreMinimum,
      duree: command.duree,
      nombreTentatives: command.nombreTentatives,
      questions,
    });

    existingLesson.addQuiz(quiz);
    const savedLesson = await this.lessonRepository.update(existingLesson);

    return savedLesson.toDTO();
  }
}
