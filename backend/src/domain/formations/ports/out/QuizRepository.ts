//domain/formations/ports/out/ModuleRepository.ts

import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';
import type { Quiz } from '@/domain/formations/entities/Quiz';

export interface QuizRepository {
  findById(id: string): Promise<Quiz | null>;
  update(quiz: Quiz): Promise<Quiz>;
  delete(id: string): Promise<void>;

  findAll(params: PaginationParams): Promise<PaginatedResult<Quiz>>;
}
