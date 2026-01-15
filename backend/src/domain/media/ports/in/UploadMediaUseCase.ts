import type { UseCase } from '@/domain/shared/UseCase';
import type { MediaDTO } from '../../value-objects/MediaDTO';

export interface UploadMediaCommand {
  file: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  metadata?: Record<string, string>;
}

export interface UploadMediaUseCase extends UseCase<UploadMediaCommand, MediaDTO> {}
