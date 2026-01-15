import { v4 as uuidv4 } from 'uuid';
import { Media } from '@/domain/media/entities/Media';
import type {
  UploadTemporaryMediaCommand,
  UploadTemporaryMediaUseCase,
} from '@/domain/media/ports/in/UploadTemporaryMediaUseCase';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import type { MediaDTO } from '@/domain/media/value-objects/MediaDTO';
import { getMediaTypeFromMimeType, MAX_FILE_SIZES } from '@/domain/media/value-objects/MediaType';
import {
  InvalidMediaTypeError,
  FileSizeExceededError,
  MediaUploadError,
} from '@/domain/media/errors/MediaErrors';

const TEMP_BUCKET = 'finance4all-temp';
const DEFAULT_EXPIRY_HOURS = 24;

export class UploadTemporaryMediaUseCaseImpl implements UploadTemporaryMediaUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storagePort: StoragePort,
    private readonly baseUrl: string
  ) {}

  async execute(command: UploadTemporaryMediaCommand): Promise<MediaDTO> {
    const {
      file,
      originalName,
      mimeType,
      size,
      metadata,
      expiresInHours = DEFAULT_EXPIRY_HOURS,
    } = command;

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

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    try {
      // Ensure bucket exists
      await this.storagePort.ensureBucket(TEMP_BUCKET);

      // Upload to storage
      const uploadResult = await this.storagePort.upload(file, {
        bucket: TEMP_BUCKET,
        filename: path,
        mimeType,
        metadata: {
          ...metadata,
          temporary: 'true',
          expiresAt: expiresAt.toISOString(),
        },
      });

      // Create media entity with temporary flag
      const media = Media.create(
        uniqueFilename,
        originalName,
        mimeType,
        size,
        uploadResult.bucket,
        uploadResult.path,
        metadata,
        true, // isTemporary
        expiresAt
      );

      // Persist metadata
      const savedMedia = await this.mediaRepository.save(media);

      return savedMedia.toDTO(this.baseUrl);
    } catch (error) {
      if (error instanceof InvalidMediaTypeError || error instanceof FileSizeExceededError) {
        throw error;
      }
      throw new MediaUploadError(
        `Failed to upload temporary file: ${originalName}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.slice(lastDot) : '';
  }
}
