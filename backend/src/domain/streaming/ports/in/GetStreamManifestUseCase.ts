import type { UseCase } from '@/domain/shared/UseCase';
import type { GetStreamManifestQuery, StreamManifestDTO } from '../../value-objects/StreamingDTO';

export interface GetStreamManifestUseCase
  extends UseCase<GetStreamManifestQuery, StreamManifestDTO> {}
