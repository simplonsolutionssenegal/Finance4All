//domain/formations/ports/out/LessonRepository.ts

import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';
import type { Lesson } from '@/domain/formations/entities/Lesson';

export interface LessonRepository {
  findById(id: string): Promise<Lesson | null>;
  update(lesson: Lesson): Promise<Lesson>;

  findAll(params: PaginationParams): Promise<PaginatedResult<Lesson>>;
}
