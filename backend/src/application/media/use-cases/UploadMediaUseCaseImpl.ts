import { v4 as uuidv4 } from 'uuid';
import { Media } from '@/domain/media/entities/Media';
import type {
  UploadMediaCommand,
  UploadMediaUseCase,
} from '@/domain/media/ports/in/UploadMediaUseCase';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import type { MediaDTO } from '@/domain/media/value-objects/MediaDTO';
import { getMediaTypeFromMimeType, MAX_FILE_SIZES } from '@/domain/media/value-objects/MediaType';
import {
  InvalidMediaTypeError,
  FileSizeExceededError,
  MediaUploadError,
} from '@/domain/media/errors/MediaErrors';

const DEFAULT_BUCKET = 'finance4all-media';

export class UploadMediaUseCaseImpl implements UploadMediaUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storagePort: StoragePort,
    private readonly baseUrl: string
  ) {}

  async execute(command: UploadMediaCommand): Promise<MediaDTO> {
    const { file, originalName, mimeType, size, metadata } = command;

    // Validate media type
    const mediaType = getMediaTypeFromMimeType(mimeType);
    if (!mediaType) {
      throw new InvalidMediaTypeError(mimeType);
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[mediaType];
    if (size > maxSize) {
      throw new FileSizeExceededError(size, maxSize, mediaType);
    }

    // Generate unique filename
    const extension = this.getExtension(originalName);
    const uniqueFilename = `${uuidv4()}${extension}`;
    const path = `${mediaType.toLowerCase()}/${uniqueFilename}`;

    try {
      // Ensure bucket exists
      await this.storagePort.ensureBucket(DEFAULT_BUCKET);

      // Upload to storage
      const uploadResult = await this.storagePort.upload(file, {
        bucket: DEFAULT_BUCKET,
        filename: path,
        mimeType,
        metadata,
      });

      // Create media entity
      const media = Media.create(
        uniqueFilename,
        originalName,
        mimeType,
        size,
        uploadResult.bucket,
        uploadResult.path,
        metadata
      );

      // Persist metadata
      const savedMedia = await this.mediaRepository.save(media);

      return savedMedia.toDTO(this.baseUrl);
    } catch (error) {
      if (error instanceof InvalidMediaTypeError || error instanceof FileSizeExceededError) {
        throw error;
      }
      throw new MediaUploadError(
        `Failed to upload file: ${originalName}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.slice(lastDot) : '';
  }
}
