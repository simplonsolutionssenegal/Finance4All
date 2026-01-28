import type { UseCase } from '@/domain/shared/UseCase';
import type { StartTranscodingCommand, TranscodingJobDTO } from '../../value-objects/StreamingDTO';

export interface StartTranscodingUseCase
  extends UseCase<StartTranscodingCommand, TranscodingJobDTO> {}
