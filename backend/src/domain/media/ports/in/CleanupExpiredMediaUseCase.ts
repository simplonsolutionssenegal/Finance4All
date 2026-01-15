import type { UseCase } from '@/domain/shared/UseCase';

export interface CleanupResult {
  deletedCount: number;
  deletedIds: string[];
}

export interface CleanupExpiredMediaUseCase extends UseCase<void, CleanupResult> {}
