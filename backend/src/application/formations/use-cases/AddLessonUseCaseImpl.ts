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

  // ✅ Méthode privée pour mapper ChapterDTO -> Chapter (comme mapQuestion)
  private mapChapter(dto: ChapterDTO): Chapter {
    return new Chapter(dto.title, dto.description, dto.mediaId, dto.order);
  }

  async execute(command: AddLessonCommand): Promise<ModuleResponseDTO> {
    const existingModule = await this.moduleRepository.findById(command.moduleId);

    if (!existingModule) {
      throw new NotFoundError(`Module with id ${command.moduleId} not found`);
    }

    // ✅ Mapper les ChapterDTO en instances de Chapter
    const chapters = (command.chapters ?? []).map(c => this.mapChapter(c));

    const lesson = new Lesson({
      id: EntityId.generate(),
      title: command.title,
      description: command.description,
      duration: command.duration,
      order: command.order,
      chapters, // ✅ Utiliser les instances de Chapter
      status: command.status,
    });

    existingModule.addLesson(lesson);

    const savedModule = await this.moduleRepository.update(existingModule);

    return savedModule.toDTO();
  }
}
