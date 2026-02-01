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
import type { ChapterDTO } from '@/domain/formations/value-objects/ChapterDTO';

export class AddLessonUseCaseImpl implements AddLessonUseCase {
  constructor(private readonly moduleRepository: ModuleRepository) {}

  // ✅ Méthode privée pour mapper ChapterDTO -> Chapter
  private mapChapter(dto: ChapterDTO): Chapter {
    // ⚠️ IMPORTANT: Si ChapterDTO contient un id, il faut le passer aussi
    const chapterId = dto.id ? EntityId.from(dto.id) : EntityId.generate();

    return new Chapter(chapterId, dto.title, dto.description, dto.mediaId, dto.order);
  }

  async execute(command: AddLessonCommand): Promise<ModuleResponseDTO> {
    const existingModule = await this.moduleRepository.findById(command.moduleId);
    if (!existingModule) throw new NotFoundError(`Module ${command.moduleId} not found`);

    // 1) mapper chapitres et garder les liens quiz -> chapterId
    const chapterLinks: Array<{ chapterId: string; quizId: string }> = [];

    const chapters = (command.chapters ?? []).map(dto => {
      const chapterId = dto.id ? EntityId.from(dto.id) : EntityId.generate();

      if (dto.quizId) {
        chapterLinks.push({ chapterId: chapterId.getValue(), quizId: dto.quizId });
      }

      return new Chapter(
        chapterId,
        dto.title,
        dto.description,
        dto.mediaId ?? undefined, // si tu as rendu mediaId optionnel côté domain
        dto.order
      );
    });

    const lessonId = EntityId.generate();

    const lesson = new Lesson({
      id: lessonId,
      moduleId: command.moduleId,
      title: command.title,
      description: command.description,
      duration: command.duration,
      order: command.order,
      chapters,
      quizzes: [],
      status: command.status,
    });

    existingModule.addLesson(lesson);

    // 2) créer lesson + chapters (via update du module)
    await this.moduleRepository.update(existingModule);

    const refreshed = await this.moduleRepository.findById(command.moduleId);
    if (!refreshed) throw new NotFoundError(`Module ${command.moduleId} not found after update`);

    return refreshed.toDTO();
  }
}
