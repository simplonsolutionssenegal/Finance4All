import type { UseCase } from '@/domain/shared/UseCase';
import type { UpdateProgressCommand, MediaProgressDTO } from '../../value-objects/StreamingDTO';

export interface UpdateProgressUseCase extends UseCase<UpdateProgressCommand, MediaProgressDTO> {}
