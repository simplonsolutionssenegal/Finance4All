import type { UseCase } from '@/domain/shared/UseCase';
import type { GetProgressQuery, MediaProgressDTO } from '../../value-objects/StreamingDTO';

export interface GetProgressUseCase extends UseCase<GetProgressQuery, MediaProgressDTO | null> {}
