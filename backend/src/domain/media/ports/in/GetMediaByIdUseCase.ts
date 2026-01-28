import type { UseCase } from '@/domain/shared/UseCase';
import type { MediaDTO } from '../../value-objects/MediaDTO';

export interface GetMediaByIdUseCase extends UseCase<string, MediaDTO> {}
