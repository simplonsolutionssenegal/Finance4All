// application/formations/use-cases/AddLessonUseCaseImpl.ts
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type {
  AddLessonCommand,
  AddLessonUseCase,
} from '@/domain/formations/ports/in/AddLessonUseCase';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { EntityId } from '@/domain/shared/EntityId';
import { Lesson } from '@/domain/formations/entities/Lesson';
import { Chapter } from '@/domain/formations/entities/Chapter';
import { Quiz } from '@/domain/formations/entities/Quiz';
import {
  QuestionChoixMultiple,
  QuestionChoixUnique,
  TypeQuestion,
} from '@/domain/formations/entities/Question';
import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';

export class AddLessonUseCaseImpl implements AddLessonUseCase {
  constructor(private readonly moduleRepository: ModuleRepository) {}

  // ✅ Mapper QuestionDTO -> Question
  private mapQuestion(dto: QuestionDTO) {
    if (dto.type === TypeQuestion.CHOIX_UNIQUE) {
      return new QuestionChoixUnique(dto.question, dto.points, dto.options, dto.explication);
    }

    if (dto.type === TypeQuestion.CHOIX_MULTIPLE) {
      return new QuestionChoixMultiple(dto.question, dto.points, dto.options, dto.explication);
    }

    throw new Error(`TypeQuestion inconnu: ${String((dto as any).type)}`);
  }

  async execute(command: AddLessonCommand): Promise<ModuleResponseDTO> {
    const existingModule = await this.moduleRepository.findById(command.moduleId);
    if (!existingModule) throw new NotFoundError(`Module ${command.moduleId} not found`);

    const lessonId = EntityId.generate();

    const chapters = (command.chapters ?? []).map(chapterDto => {
      const chapterId = chapterDto.id ? EntityId.from(chapterDto.id) : EntityId.generate();

      const chapterQuizzes = (chapterDto.quizzes ?? []).map(quizDto => {
        const quizId = quizDto.id ? EntityId.from(quizDto.id) : EntityId.generate();
        const questions = quizDto.questions.map(q => this.mapQuestion(q));

        return new Quiz({
          id: quizId,
          chapterId: chapterId.getValue(),
          lessonId: lessonId.getValue(),
          moduleId: command.moduleId,
          title: quizDto.title,
          description: quizDto.description,
          status: quizDto.status,
          scoreMinimum: quizDto.scoreMinimum,
          duree: quizDto.duree,
          nombreTentatives: quizDto.nombreTentatives,
          questions,
        });
      });

      // ✅ Nettoyer mediaId si vide
      const cleanMediaId = chapterDto.mediaId?.trim() || undefined;

      return new Chapter(
        chapterId,
        chapterDto.title,
        chapterDto.description,
        cleanMediaId, // ✅ Utiliser la version nettoyée
        chapterDto.order,
        undefined,
        chapterQuizzes
      );
    });

    const lessonQuizzes = (command.quizzes ?? []).map(dto => {
      const quizId = dto.id ? EntityId.from(dto.id) : EntityId.generate();
      const questions = dto.questions.map(q => this.mapQuestion(q));

      return new Quiz({
        id: quizId,
        lessonId: lessonId.getValue(),
        moduleId: command.moduleId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        scoreMinimum: dto.scoreMinimum,
        duree: dto.duree,
        nombreTentatives: dto.nombreTentatives,
        questions,
      });
    });

    const lesson = new Lesson({
      id: lessonId,
      moduleId: command.moduleId,
      title: command.title,
      description: command.description,
      duration: command.duration,
      order: command.order,
      chapters,
      quizzes: lessonQuizzes,
      status: command.status,
    });

    existingModule.addLesson(lesson);

    await this.moduleRepository.update(existingModule);

    const refreshed = await this.moduleRepository.findById(command.moduleId);
    if (!refreshed) throw new NotFoundError(`Module ${command.moduleId} not found after update`);

    return refreshed.toDTO();
  }
}
