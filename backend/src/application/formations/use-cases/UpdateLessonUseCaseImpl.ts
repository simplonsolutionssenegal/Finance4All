import { EntityId } from '@/domain/shared/EntityId';
import { Lesson } from '@/domain/formations/entities/Lesson';
import { Chapter } from '@/domain/formations/entities/Chapter';
import { Quiz, QuizStatus } from '@/domain/formations/entities/Quiz';
import {
  QuestionChoixUnique,
  QuestionChoixMultiple,
  TypeQuestion,
} from '@/domain/formations/entities/Question';
import type { LessonRepository } from '@/domain/formations/ports/out/LessonRepository';
import type { LessonDTO } from '@/domain/formations/value-objects/LessonDTO';
import type {
  UpdateLessonCommand,
  UpdateLessonUseCase,
  UpdateChapterDTO,
  UpdateQuizDTO,
  UpdateQuestionDTO,
} from '@/domain/formations/ports/in/UpdateLessonUseCase';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

export class UpdateLessonUseCaseImpl implements UpdateLessonUseCase {
  constructor(private readonly lessonRepository: LessonRepository) {}

  async execute(command: UpdateLessonCommand): Promise<LessonDTO> {
    const existingLesson = await this.lessonRepository.findById(command.id);
    if (!existingLesson) {
      throw new NotFoundError(`Lesson with id ${command.id} not found`);
    }

    const updatedChapters = this.mapChapters(
      command.chapters !== undefined ? command.chapters : existingLesson.chapters,
      existingLesson
    );

    const updatedQuizzes = this.mapQuizzes(
      command.quizzes !== undefined ? command.quizzes : [],
      existingLesson.quizzes,
      existingLesson.moduleId,
      command.id,
      undefined
    );

    const updatedLesson = new Lesson({
      id: existingLesson.id,
      moduleId: existingLesson.moduleId,
      title: command.title ?? existingLesson.title,
      description: command.description ?? existingLesson.description,
      duration: command.duration ?? existingLesson.duration,
      order: command.order ?? existingLesson.order,
      status: command.status ?? existingLesson.status,
      chapters: updatedChapters,
      quizzes: updatedQuizzes,
    });

    // 5. Sauvegarder et retourner
    const savedLesson = await this.lessonRepository.update(updatedLesson);
    return savedLesson.toDTO();
  }

  private mapChapters(
    commandChapters: UpdateChapterDTO[] | Chapter[],
    existingLesson: Lesson
  ): Chapter[] {
    if (commandChapters.length > 0 && commandChapters[0] instanceof Chapter) {
      return commandChapters as Chapter[];
    }

    const chapterDTOs = commandChapters as UpdateChapterDTO[];
    const existingChapters = existingLesson.chapters;

    return chapterDTOs.map(chapterData => {
      const existingChapter = chapterData.id
        ? existingChapters.find(c => c.id.getValue() === chapterData.id)
        : undefined;

      const chapterQuizzes = this.mapQuizzes(
        chapterData.quizzes || [],
        existingChapter?.quizzes || [],
        existingLesson.moduleId,
        existingLesson.id.getValue(),
        chapterData.id
      );

      return new Chapter(
        chapterData.id ? EntityId.from(chapterData.id) : EntityId.generate(),
        chapterData.title,
        chapterData.description,
        chapterData.mediaId,
        chapterData.order,
        existingChapter?.media,
        chapterQuizzes,
        existingChapter?.createdAt ?? new Date(),
        new Date()
      );
    });
  }

  private mapQuizzes(
    commandQuizzes: UpdateQuizDTO[],
    existingQuizzes: Quiz[],
    moduleId: string,
    lessonId: string,
    chapterId?: string
  ): Quiz[] {
    if (!commandQuizzes || commandQuizzes.length === 0) {
      return existingQuizzes;
    }

    return commandQuizzes.map(quizData => {
      const existingQuiz = quizData.id
        ? existingQuizzes.find(q => q.id.getValue() === quizData.id)
        : undefined;

      const questions = quizData.questions.map(qData => this.mapQuestion(qData));

      return new Quiz({
        id: quizData.id ? EntityId.from(quizData.id) : EntityId.generate(),
        moduleId,
        lessonId,
        chapterId,
        title: quizData.title,
        description: quizData.description,
        status: quizData.status ?? existingQuiz?.status ?? QuizStatus.DRAFT,
        scoreMinimum: quizData.scoreMinimum,
        duree: quizData.duree,
        nombreTentatives: quizData.nombreTentatives,
        questions,
      });
    });
  }

  private mapQuestion(qData: UpdateQuestionDTO): QuestionChoixUnique | QuestionChoixMultiple {
    if (qData.type === TypeQuestion.CHOIX_UNIQUE) {
      return new QuestionChoixUnique(
        qData.question,
        qData.points,
        qData.options,
        qData.explication
      );
    } else {
      return new QuestionChoixMultiple(
        qData.question,
        qData.points,
        qData.options,
        qData.explication
      );
    }
  }
}
