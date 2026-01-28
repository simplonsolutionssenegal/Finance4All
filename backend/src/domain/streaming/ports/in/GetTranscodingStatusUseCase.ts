import type { UseCase } from '@/domain/shared/UseCase';
import type { TranscodingJobDTO } from '../../value-objects/StreamingDTO';

export interface GetTranscodingStatusUseCase extends UseCase<string, TranscodingJobDTO> {}
