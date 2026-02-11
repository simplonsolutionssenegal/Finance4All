import type {
  GetLessonByIdUseCase,
  GetLessonByIdUseCaseQuery,
} from '@/domain/formations/ports/in/GetLessonByIdUseCase';
import type { LessonRepository } from '@/domain/formations/ports/out/LessonRepository';
import type { LessonDTO } from '@/domain/formations/value-objects/LessonDTO';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

export class GetLessonByIdUseCaseImpl implements GetLessonByIdUseCase {
  constructor(private readonly lessonRepository: LessonRepository) {}
  async execute(query: GetLessonByIdUseCaseQuery): Promise<LessonDTO> {
    const lesson = await this.lessonRepository.findById(query.id);

    if (!lesson) {
      throw new NotFoundError(`lesson with id ${query.id} not found`);
    }
    return lesson.toDTO();
  }
}
