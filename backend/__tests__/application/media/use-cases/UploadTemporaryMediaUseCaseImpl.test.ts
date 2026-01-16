import { UploadTemporaryMediaUseCaseImpl } from '@/application/media/use-cases/UploadTemporaryMediaUseCaseImpl';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import type { UploadTemporaryMediaCommand } from '@/domain/media/ports/in/UploadTemporaryMediaUseCase';
import { MediaType } from '@/domain/media/value-objects/MediaType';
import {
  InvalidMediaTypeError,
  FileSizeExceededError,
  MediaUploadError,
} from '@/domain/media/errors/MediaErrors';
import { EntityId } from '@/domain/shared/EntityId';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => '87654321-4321-4321-8321-210987654321'),
}));

describe('UploadTemporaryMediaUseCaseImpl', () => {
  let useCase: UploadTemporaryMediaUseCaseImpl;
  let mockMediaRepository: jest.Mocked<MediaRepository>;
  let mockStoragePort: jest.Mocked<StoragePort>;
  const baseUrl = 'https://example.com';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));

    mockMediaRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByType: jest.fn(),
      findExpiredTemporaryMedia: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      existsById: jest.fn(),
    };

    mockStoragePort = {
      upload: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getPresignedUrl: jest.fn(),
      getPublicUrl: jest.fn(),
      ensureBucket: jest.fn(),
    } as jest.Mocked<StoragePort>;

    useCase = new UploadTemporaryMediaUseCaseImpl(mockMediaRepository, mockStoragePort, baseUrl);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('execute', () => {
    const validCommand: UploadTemporaryMediaCommand = {
      file: Buffer.from('fake video data'),
      originalName: 'temp-video.mp4',
      mimeType: 'video/mp4',
      size: 1024 * 1024, // 1MB
      metadata: { userId: 'user-123' },
    };

    it('should upload temporary video with default expiry (24 hours)', async () => {
      const expectedExpiresAt = new Date('2024-01-16T10:00:00Z'); // 24 hours later

      const mockMedia = {
        id: EntityId.generate(),
        filename: '87654321-4321-4321-8321-210987654321.mp4',
        originalName: validCommand.originalName,
        mimeType: validCommand.mimeType,
        type: MediaType.VIDEO,
        size: validCommand.size,
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321.mp4',
        metadata: validCommand.metadata,
        isTemporary: true,
        expiresAt: expectedExpiresAt,
        toDTO: jest.fn((baseUrl: string) => ({
          id: 'media-id-123',
          filename: '87654321-4321-4321-8321-210987654321.mp4',
          originalName: validCommand.originalName,
          mimeType: validCommand.mimeType,
          type: MediaType.VIDEO,
          size: validCommand.size,
          url: `${baseUrl}/finance4all-temp/video/87654321-4321-4321-8321-210987654321.mp4`,
          bucket: 'finance4all-temp',
          path: 'video/87654321-4321-4321-8321-210987654321.mp4',
          metadata: validCommand.metadata,
          isTemporary: true,
          expiresAt: expectedExpiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321.mp4',
        etag: 'etag-123',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      const result = await useCase.execute(validCommand);

      expect(mockStoragePort.ensureBucket).toHaveBeenCalledWith('finance4all-temp');
      expect(mockStoragePort.upload).toHaveBeenCalledWith(validCommand.file, {
        bucket: 'finance4all-temp',
        filename: 'video/87654321-4321-4321-8321-210987654321.mp4',
        mimeType: validCommand.mimeType,
        metadata: {
          ...validCommand.metadata,
          temporary: 'true',
          expiresAt: expectedExpiresAt.toISOString(),
        },
      });
      expect(mockMediaRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('isTemporary', true);
      expect(result).toHaveProperty('expiresAt', expectedExpiresAt);
    });

    it('should upload temporary file with custom expiry hours', async () => {
      const customCommand: UploadTemporaryMediaCommand = {
        ...validCommand,
        expiresInHours: 48,
      };

      const expectedExpiresAt = new Date('2024-01-17T10:00:00Z'); // 48 hours later

      const mockMedia = {
        id: EntityId.generate(),
        filename: '87654321-4321-4321-8321-210987654321.mp4',
        originalName: customCommand.originalName,
        mimeType: customCommand.mimeType,
        type: MediaType.VIDEO,
        size: customCommand.size,
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321.mp4',
        metadata: customCommand.metadata,
        isTemporary: true,
        expiresAt: expectedExpiresAt,
        toDTO: jest.fn((baseUrl: string) => ({
          id: 'media-id-456',
          filename: '87654321-4321-4321-8321-210987654321.mp4',
          originalName: customCommand.originalName,
          mimeType: customCommand.mimeType,
          type: MediaType.VIDEO,
          size: customCommand.size,
          url: `${baseUrl}/finance4all-temp/video/87654321-4321-4321-8321-210987654321.mp4`,
          bucket: 'finance4all-temp',
          path: 'video/87654321-4321-4321-8321-210987654321.mp4',
          metadata: customCommand.metadata,
          isTemporary: true,
          expiresAt: expectedExpiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321.mp4',
        etag: 'etag-456',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      const result = await useCase.execute(customCommand);

      expect(result).toHaveProperty('expiresAt', expectedExpiresAt);
      expect(mockStoragePort.upload).toHaveBeenCalledWith(
        customCommand.file,
        expect.objectContaining({
          metadata: expect.objectContaining({
            expiresAt: expectedExpiresAt.toISOString(),
          }),
        })
      );
    });

    it('should upload temporary audio successfully', async () => {
      const audioCommand: UploadTemporaryMediaCommand = {
        file: Buffer.from('fake audio data'),
        originalName: 'temp-audio.mp3',
        mimeType: 'audio/mpeg',
        size: 1024 * 1024,
        metadata: { userId: 'user-789' },
        expiresInHours: 12,
      };

      const expectedExpiresAt = new Date('2024-01-15T22:00:00Z'); // 12 hours later

      const mockMedia = {
        id: EntityId.generate(),
        filename: '87654321-4321-4321-8321-210987654321.mp3',
        originalName: audioCommand.originalName,
        mimeType: audioCommand.mimeType,
        type: MediaType.AUDIO,
        size: audioCommand.size,
        bucket: 'finance4all-temp',
        path: 'audio/87654321-4321-4321-8321-210987654321.mp3',
        metadata: audioCommand.metadata,
        isTemporary: true,
        expiresAt: expectedExpiresAt,
        toDTO: jest.fn((baseUrl: string) => ({
          id: 'media-id-789',
          filename: '87654321-4321-4321-8321-210987654321.mp3',
          originalName: audioCommand.originalName,
          mimeType: audioCommand.mimeType,
          type: MediaType.AUDIO,
          size: audioCommand.size,
          url: `${baseUrl}/finance4all-temp/audio/87654321-4321-4321-8321-210987654321.mp3`,
          bucket: 'finance4all-temp',
          path: 'audio/87654321-4321-4321-8321-210987654321.mp3',
          metadata: audioCommand.metadata,
          isTemporary: true,
          expiresAt: expectedExpiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-temp',
        path: 'audio/87654321-4321-4321-8321-210987654321.mp3',
        etag: 'etag-789',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      const result = await useCase.execute(audioCommand);

      expect(result).toHaveProperty('type', MediaType.AUDIO);
      expect(result).toHaveProperty('isTemporary', true);
      expect(mockStoragePort.upload).toHaveBeenCalledWith(audioCommand.file, {
        bucket: 'finance4all-temp',
        filename: 'audio/87654321-4321-4321-8321-210987654321.mp3',
        mimeType: audioCommand.mimeType,
        metadata: {
          ...audioCommand.metadata,
          temporary: 'true',
          expiresAt: expectedExpiresAt.toISOString(),
        },
      });
    });

    it('should upload temporary PDF successfully', async () => {
      const pdfCommand: UploadTemporaryMediaCommand = {
        file: Buffer.from('fake pdf data'),
        originalName: 'temp-document.pdf',
        mimeType: 'application/pdf',
        size: 1024 * 1024,
        expiresInHours: 6,
      };

      const expectedExpiresAt = new Date('2024-01-15T16:00:00Z'); // 6 hours later

      const mockMedia = {
        id: EntityId.generate(),
        filename: '87654321-4321-4321-8321-210987654321.pdf',
        originalName: pdfCommand.originalName,
        mimeType: pdfCommand.mimeType,
        type: MediaType.PDF,
        size: pdfCommand.size,
        bucket: 'finance4all-temp',
        path: 'pdf/87654321-4321-4321-8321-210987654321.pdf',
        metadata: null,
        isTemporary: true,
        expiresAt: expectedExpiresAt,
        toDTO: jest.fn((baseUrl: string) => ({
          id: 'media-id',
          filename: '87654321-4321-4321-8321-210987654321.pdf',
          originalName: pdfCommand.originalName,
          mimeType: pdfCommand.mimeType,
          type: MediaType.PDF,
          size: pdfCommand.size,
          url: `${baseUrl}/finance4all-temp/pdf/87654321-4321-4321-8321-210987654321.pdf`,
          bucket: 'finance4all-temp',
          path: 'pdf/87654321-4321-4321-8321-210987654321.pdf',
          metadata: null,
          isTemporary: true,
          expiresAt: expectedExpiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-temp',
        path: 'pdf/87654321-4321-4321-8321-210987654321.pdf',
        etag: 'etag',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      const result = await useCase.execute(pdfCommand);

      expect(result).toHaveProperty('type', MediaType.PDF);
      expect(result).toHaveProperty('isTemporary', true);
    });

    it('should throw InvalidMediaTypeError for unsupported mime type', async () => {
      const invalidCommand: UploadTemporaryMediaCommand = {
        file: Buffer.from('fake data'),
        originalName: 'test.exe',
        mimeType: 'application/x-executable',
        size: 1024,
      };

      await expect(useCase.execute(invalidCommand)).rejects.toThrow(InvalidMediaTypeError);
      await expect(useCase.execute(invalidCommand)).rejects.toThrow(
        'Invalid or unsupported media type: application/x-executable'
      );
      expect(mockStoragePort.ensureBucket).not.toHaveBeenCalled();
      expect(mockStoragePort.upload).not.toHaveBeenCalled();
      expect(mockMediaRepository.save).not.toHaveBeenCalled();
    });

    it('should throw FileSizeExceededError when video size exceeds limit', async () => {
      const oversizedCommand: UploadTemporaryMediaCommand = {
        file: Buffer.from('fake large video'),
        originalName: 'large-video.mp4',
        mimeType: 'video/mp4',
        size: 600 * 1024 * 1024, // 600MB (exceeds 500MB limit)
      };

      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(FileSizeExceededError);
      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(
        /File size .* exceeds maximum allowed .* for VIDEO/
      );
      expect(mockStoragePort.ensureBucket).not.toHaveBeenCalled();
      expect(mockStoragePort.upload).not.toHaveBeenCalled();
    });

    it('should throw FileSizeExceededError when PDF size exceeds limit', async () => {
      const oversizedCommand: UploadTemporaryMediaCommand = {
        file: Buffer.from('fake large pdf'),
        originalName: 'large-doc.pdf',
        mimeType: 'application/pdf',
        size: 60 * 1024 * 1024, // 60MB (exceeds 50MB limit)
      };

      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(FileSizeExceededError);
      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(
        /File size .* exceeds maximum allowed .* for PDF/
      );
    });

    it('should throw FileSizeExceededError when audio size exceeds limit', async () => {
      const oversizedCommand: UploadTemporaryMediaCommand = {
        file: Buffer.from('fake large audio'),
        originalName: 'large-audio.mp3',
        mimeType: 'audio/mpeg',
        size: 120 * 1024 * 1024, // 120MB (exceeds 100MB limit)
      };

      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(FileSizeExceededError);
      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(
        /File size .* exceeds maximum allowed .* for AUDIO/
      );
    });

    it('should handle file without extension', async () => {
      const commandNoExt: UploadTemporaryMediaCommand = {
        file: Buffer.from('fake video'),
        originalName: 'videofile',
        mimeType: 'video/mp4',
        size: 1024,
      };

      const expectedExpiresAt = new Date('2024-01-16T10:00:00Z');

      const mockMedia = {
        id: EntityId.generate(),
        filename: '87654321-4321-4321-8321-210987654321',
        originalName: commandNoExt.originalName,
        mimeType: commandNoExt.mimeType,
        type: MediaType.VIDEO,
        size: commandNoExt.size,
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321',
        metadata: null,
        isTemporary: true,
        expiresAt: expectedExpiresAt,
        toDTO: jest.fn((baseUrl: string) => ({
          id: 'media-id',
          filename: '87654321-4321-4321-8321-210987654321',
          originalName: commandNoExt.originalName,
          mimeType: commandNoExt.mimeType,
          type: MediaType.VIDEO,
          size: commandNoExt.size,
          url: `${baseUrl}/finance4all-temp/video/87654321-4321-4321-8321-210987654321`,
          bucket: 'finance4all-temp',
          path: 'video/87654321-4321-4321-8321-210987654321',
          metadata: null,
          isTemporary: true,
          expiresAt: expectedExpiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321',
        etag: 'etag',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      const result = await useCase.execute(commandNoExt);

      expect(mockStoragePort.upload).toHaveBeenCalledWith(
        commandNoExt.file,
        expect.objectContaining({
          filename: 'video/87654321-4321-4321-8321-210987654321',
        })
      );
      expect(result).toHaveProperty('filename', '87654321-4321-4321-8321-210987654321');
    });

    it('should merge metadata with temporary flag', async () => {
      const customMetadataCommand: UploadTemporaryMediaCommand = {
        file: Buffer.from('fake data'),
        originalName: 'test.mp4',
        mimeType: 'video/mp4',
        size: 1024,
        metadata: { custom: 'value', another: 'data' },
      };

      const expectedExpiresAt = new Date('2024-01-16T10:00:00Z');

      const mockMedia = {
        id: EntityId.generate(),
        filename: '87654321-4321-4321-8321-210987654321.mp4',
        originalName: customMetadataCommand.originalName,
        mimeType: customMetadataCommand.mimeType,
        type: MediaType.VIDEO,
        size: customMetadataCommand.size,
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321.mp4',
        metadata: customMetadataCommand.metadata,
        isTemporary: true,
        expiresAt: expectedExpiresAt,
        toDTO: jest.fn(() => ({
          id: 'media-id',
          filename: '87654321-4321-4321-8321-210987654321.mp4',
          originalName: customMetadataCommand.originalName,
          mimeType: customMetadataCommand.mimeType,
          type: MediaType.VIDEO,
          size: customMetadataCommand.size,
          url: `${baseUrl}/finance4all-temp/video/87654321-4321-4321-8321-210987654321.mp4`,
          bucket: 'finance4all-temp',
          path: 'video/87654321-4321-4321-8321-210987654321.mp4',
          metadata: customMetadataCommand.metadata,
          isTemporary: true,
          expiresAt: expectedExpiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321.mp4',
        etag: 'etag',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      await useCase.execute(customMetadataCommand);

      expect(mockStoragePort.upload).toHaveBeenCalledWith(
        customMetadataCommand.file,
        expect.objectContaining({
          metadata: {
            custom: 'value',
            another: 'data',
            temporary: 'true',
            expiresAt: expectedExpiresAt.toISOString(),
          },
        })
      );
    });

    it('should wrap storage port errors in MediaUploadError', async () => {
      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockRejectedValue(new Error('Storage failure'));

      await expect(useCase.execute(validCommand)).rejects.toThrow(MediaUploadError);
      await expect(useCase.execute(validCommand)).rejects.toThrow(
        'Media upload failed: Failed to upload temporary file: temp-video.mp4'
      );
      expect(mockMediaRepository.save).not.toHaveBeenCalled();
    });

    it('should wrap repository errors in MediaUploadError', async () => {
      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321.mp4',
        etag: 'etag',
      });
      mockMediaRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validCommand)).rejects.toThrow(MediaUploadError);
      await expect(useCase.execute(validCommand)).rejects.toThrow(
        'Media upload failed: Failed to upload temporary file: temp-video.mp4'
      );
    });

    it('should not wrap InvalidMediaTypeError in MediaUploadError', async () => {
      const invalidCommand: UploadTemporaryMediaCommand = {
        file: Buffer.from('fake data'),
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 1024,
      };

      await expect(useCase.execute(invalidCommand)).rejects.toThrow(InvalidMediaTypeError);
      await expect(useCase.execute(invalidCommand)).rejects.not.toThrow(MediaUploadError);
    });

    it('should not wrap FileSizeExceededError in MediaUploadError', async () => {
      const oversizedCommand: UploadTemporaryMediaCommand = {
        file: Buffer.from('fake large video'),
        originalName: 'large.mp4',
        mimeType: 'video/mp4',
        size: 600 * 1024 * 1024,
      };

      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(FileSizeExceededError);
      await expect(useCase.execute(oversizedCommand)).rejects.not.toThrow(MediaUploadError);
    });

    it('should handle ensureBucket errors', async () => {
      mockStoragePort.ensureBucket.mockRejectedValue(new Error('Bucket creation failed'));

      await expect(useCase.execute(validCommand)).rejects.toThrow(MediaUploadError);
      expect(mockStoragePort.upload).not.toHaveBeenCalled();
      expect(mockMediaRepository.save).not.toHaveBeenCalled();
    });

    it('should handle non-Error exceptions', async () => {
      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockRejectedValue('String error');

      await expect(useCase.execute(validCommand)).rejects.toThrow(MediaUploadError);
      await expect(useCase.execute(validCommand)).rejects.toThrow(
        'Media upload failed: Failed to upload temporary file: temp-video.mp4'
      );
    });

    it('should handle undefined metadata', async () => {
      const commandNoMetadata: UploadTemporaryMediaCommand = {
        file: Buffer.from('fake data'),
        originalName: 'test.mp4',
        mimeType: 'video/mp4',
        size: 1024,
      };

      const expectedExpiresAt = new Date('2024-01-16T10:00:00Z');

      const mockMedia = {
        id: EntityId.generate(),
        filename: '87654321-4321-4321-8321-210987654321.mp4',
        originalName: commandNoMetadata.originalName,
        mimeType: commandNoMetadata.mimeType,
        type: MediaType.VIDEO,
        size: commandNoMetadata.size,
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321.mp4',
        metadata: undefined,
        isTemporary: true,
        expiresAt: expectedExpiresAt,
        toDTO: jest.fn(() => ({
          id: 'media-id',
          filename: '87654321-4321-4321-8321-210987654321.mp4',
          originalName: commandNoMetadata.originalName,
          mimeType: commandNoMetadata.mimeType,
          type: MediaType.VIDEO,
          size: commandNoMetadata.size,
          url: `${baseUrl}/finance4all-temp/video/87654321-4321-4321-8321-210987654321.mp4`,
          bucket: 'finance4all-temp',
          path: 'video/87654321-4321-4321-8321-210987654321.mp4',
          metadata: null,
          isTemporary: true,
          expiresAt: expectedExpiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321.mp4',
        etag: 'etag',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      await useCase.execute(commandNoMetadata);

      expect(mockStoragePort.upload).toHaveBeenCalledWith(
        commandNoMetadata.file,
        expect.objectContaining({
          metadata: {
            temporary: 'true',
            expiresAt: expectedExpiresAt.toISOString(),
          },
        })
      );
    });

    it('should properly construct path with media type lowercased', async () => {
      const expectedExpiresAt = new Date('2024-01-16T10:00:00Z');

      const mockMedia = {
        id: EntityId.generate(),
        filename: '87654321-4321-4321-8321-210987654321.mp4',
        originalName: validCommand.originalName,
        mimeType: validCommand.mimeType,
        type: MediaType.VIDEO,
        size: validCommand.size,
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321.mp4',
        metadata: validCommand.metadata,
        isTemporary: true,
        expiresAt: expectedExpiresAt,
        toDTO: jest.fn(() => ({
          id: 'media-id',
          filename: '87654321-4321-4321-8321-210987654321.mp4',
          originalName: validCommand.originalName,
          mimeType: validCommand.mimeType,
          type: MediaType.VIDEO,
          size: validCommand.size,
          url: `${baseUrl}/finance4all-temp/video/87654321-4321-4321-8321-210987654321.mp4`,
          bucket: 'finance4all-temp',
          path: 'video/87654321-4321-4321-8321-210987654321.mp4',
          metadata: validCommand.metadata,
          isTemporary: true,
          expiresAt: expectedExpiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-temp',
        path: 'video/87654321-4321-4321-8321-210987654321.mp4',
        etag: 'etag',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      await useCase.execute(validCommand);

      expect(mockStoragePort.upload).toHaveBeenCalledWith(
        validCommand.file,
        expect.objectContaining({
          filename: 'video/87654321-4321-4321-8321-210987654321.mp4',
        })
      );
    });
  });
});
