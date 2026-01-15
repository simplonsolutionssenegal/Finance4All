import type { UseCase } from '@/domain/shared/UseCase';
import type { MediaDTO } from '../../value-objects/MediaDTO';

export interface UploadTemporaryMediaCommand {
  file: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  metadata?: Record<string, string>;
  expiresInHours?: number; // Default 24 hours
}

export interface UploadTemporaryMediaUseCase
  extends UseCase<UploadTemporaryMediaCommand, MediaDTO> {}
