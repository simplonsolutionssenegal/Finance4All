import type { DeleteLessonUseCase } from '@/domain/formations/ports/in/DeleteLessonUseCase';
import type { LessonRepository } from '@/domain/formations/ports/out/LessonRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

export class DeleteLessonUseCaseImpl implements DeleteLessonUseCase {
  constructor(private readonly lessonRepository: LessonRepository) {}

  async execute(id: string): Promise<void> {
    const lesson = await this.lessonRepository.findById(id);
    if (!lesson) {
      throw new NotFoundError(`Lesson with id ${id} not found`);
    }

    await this.lessonRepository.delete(id);
  }
}
