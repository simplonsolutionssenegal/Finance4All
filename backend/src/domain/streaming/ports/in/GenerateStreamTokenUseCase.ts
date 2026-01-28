import type { UseCase } from '@/domain/shared/UseCase';
import type { GenerateStreamTokenCommand, StreamTokenDTO } from '../../value-objects/StreamingDTO';

export interface GenerateStreamTokenUseCase
  extends UseCase<GenerateStreamTokenCommand, StreamTokenDTO> {}
