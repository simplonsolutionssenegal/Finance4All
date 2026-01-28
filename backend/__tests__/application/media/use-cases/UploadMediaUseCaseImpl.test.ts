import { UploadMediaUseCaseImpl } from '@/application/media/use-cases/UploadMediaUseCaseImpl';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import type { UploadMediaCommand } from '@/domain/media/ports/in/UploadMediaUseCase';
import { MediaType } from '@/domain/media/value-objects/MediaType';
import {
  InvalidMediaTypeError,
  FileSizeExceededError,
  MediaUploadError,
} from '@/domain/media/errors/MediaErrors';
import { EntityId } from '@/domain/shared/EntityId';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => '12345678-1234-4234-8234-123456789012'),
}));

describe('UploadMediaUseCaseImpl', () => {
  let useCase: UploadMediaUseCaseImpl;
  let mockMediaRepository: jest.Mocked<MediaRepository>;
  let mockStoragePort: jest.Mocked<StoragePort>;
  const baseUrl = 'https://example.com';

  beforeEach(() => {
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

    useCase = new UploadMediaUseCaseImpl(mockMediaRepository, mockStoragePort, baseUrl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validVideoCommand: UploadMediaCommand = {
      file: Buffer.from('fake video data'),
      originalName: 'test-video.mp4',
      mimeType: 'video/mp4',
      size: 1024 * 1024, // 1MB
      metadata: { userId: 'user-123' },
    };

    it('should upload video successfully', async () => {
      const mockMedia = {
        id: EntityId.generate(),
        filename: '12345678-1234-4234-8234-123456789012.mp4',
        originalName: validVideoCommand.originalName,
        mimeType: validVideoCommand.mimeType,
        type: MediaType.VIDEO,
        size: validVideoCommand.size,
        bucket: 'finance4all-media',
        path: 'video/12345678-1234-4234-8234-123456789012.mp4',
        metadata: validVideoCommand.metadata,
        toDTO: jest.fn((baseUrl: string) => ({
          id: 'media-id-123',
          filename: '12345678-1234-4234-8234-123456789012.mp4',
          originalName: validVideoCommand.originalName,
          mimeType: validVideoCommand.mimeType,
          type: MediaType.VIDEO,
          size: validVideoCommand.size,
          url: `${baseUrl}/finance4all-media/video/12345678-1234-4234-8234-123456789012.mp4`,
          bucket: 'finance4all-media',
          path: 'video/12345678-1234-4234-8234-123456789012.mp4',
          metadata: validVideoCommand.metadata,
          isTemporary: false,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-media',
        path: 'video/12345678-1234-4234-8234-123456789012.mp4',
        etag: 'etag-123',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      const result = await useCase.execute(validVideoCommand);

      expect(mockStoragePort.ensureBucket).toHaveBeenCalledWith('finance4all-media');
      expect(mockStoragePort.upload).toHaveBeenCalledWith(validVideoCommand.file, {
        bucket: 'finance4all-media',
        filename: 'video/12345678-1234-4234-8234-123456789012.mp4',
        mimeType: validVideoCommand.mimeType,
        metadata: validVideoCommand.metadata,
      });
      expect(mockMediaRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('filename', '12345678-1234-4234-8234-123456789012.mp4');
      expect(result).toHaveProperty('type', MediaType.VIDEO);
    });

    it('should upload audio successfully', async () => {
      const audioCommand: UploadMediaCommand = {
        file: Buffer.from('fake audio data'),
        originalName: 'test-audio.mp3',
        mimeType: 'audio/mpeg',
        size: 1024 * 1024,
        metadata: { userId: 'user-456' },
      };

      const mockMedia = {
        id: EntityId.generate(),
        filename: '12345678-1234-4234-8234-123456789012.mp3',
        originalName: audioCommand.originalName,
        mimeType: audioCommand.mimeType,
        type: MediaType.AUDIO,
        size: audioCommand.size,
        bucket: 'finance4all-media',
        path: 'audio/12345678-1234-4234-8234-123456789012.mp3',
        metadata: audioCommand.metadata,
        toDTO: jest.fn((baseUrl: string) => ({
          id: 'media-id-456',
          filename: '12345678-1234-4234-8234-123456789012.mp3',
          originalName: audioCommand.originalName,
          mimeType: audioCommand.mimeType,
          type: MediaType.AUDIO,
          size: audioCommand.size,
          url: `${baseUrl}/finance4all-media/audio/12345678-1234-4234-8234-123456789012.mp3`,
          bucket: 'finance4all-media',
          path: 'audio/12345678-1234-4234-8234-123456789012.mp3',
          metadata: audioCommand.metadata,
          isTemporary: false,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-media',
        path: 'audio/12345678-1234-4234-8234-123456789012.mp3',
        etag: 'etag-456',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      const result = await useCase.execute(audioCommand);

      expect(result).toHaveProperty('type', MediaType.AUDIO);
      expect(mockStoragePort.upload).toHaveBeenCalledWith(audioCommand.file, {
        bucket: 'finance4all-media',
        filename: 'audio/12345678-1234-4234-8234-123456789012.mp3',
        mimeType: audioCommand.mimeType,
        metadata: audioCommand.metadata,
      });
    });

    it('should upload PDF successfully', async () => {
      const pdfCommand: UploadMediaCommand = {
        file: Buffer.from('fake pdf data'),
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        size: 1024 * 1024,
        metadata: { userId: 'user-789' },
      };

      const mockMedia = {
        id: EntityId.generate(),
        filename: '12345678-1234-4234-8234-123456789012.pdf',
        originalName: pdfCommand.originalName,
        mimeType: pdfCommand.mimeType,
        type: MediaType.PDF,
        size: pdfCommand.size,
        bucket: 'finance4all-media',
        path: 'pdf/12345678-1234-4234-8234-123456789012.pdf',
        metadata: pdfCommand.metadata,
        toDTO: jest.fn((baseUrl: string) => ({
          id: 'media-id-789',
          filename: '12345678-1234-4234-8234-123456789012.pdf',
          originalName: pdfCommand.originalName,
          mimeType: pdfCommand.mimeType,
          type: MediaType.PDF,
          size: pdfCommand.size,
          url: `${baseUrl}/finance4all-media/pdf/12345678-1234-4234-8234-123456789012.pdf`,
          bucket: 'finance4all-media',
          path: 'pdf/12345678-1234-4234-8234-123456789012.pdf',
          metadata: pdfCommand.metadata,
          isTemporary: false,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-media',
        path: 'pdf/12345678-1234-4234-8234-123456789012.pdf',
        etag: 'etag-789',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      const result = await useCase.execute(pdfCommand);

      expect(result).toHaveProperty('type', MediaType.PDF);
      expect(mockStoragePort.upload).toHaveBeenCalledWith(pdfCommand.file, {
        bucket: 'finance4all-media',
        filename: 'pdf/12345678-1234-4234-8234-123456789012.pdf',
        mimeType: pdfCommand.mimeType,
        metadata: pdfCommand.metadata,
      });
    });

    it('should throw InvalidMediaTypeError for unsupported mime type', async () => {
      const invalidCommand: UploadMediaCommand = {
        file: Buffer.from('fake data'),
        originalName: 'test.exe',
        mimeType: 'application/x-executable',
        size: 1024,
        metadata: {},
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
      const oversizedCommand: UploadMediaCommand = {
        file: Buffer.from('fake large video'),
        originalName: 'large-video.mp4',
        mimeType: 'video/mp4',
        size: 600 * 1024 * 1024, // 600MB (exceeds 500MB limit)
        metadata: {},
      };

      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(FileSizeExceededError);
      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(
        /File size .* exceeds maximum allowed .* for VIDEO/
      );
      expect(mockStoragePort.ensureBucket).not.toHaveBeenCalled();
      expect(mockStoragePort.upload).not.toHaveBeenCalled();
    });

    it('should throw FileSizeExceededError when PDF size exceeds limit', async () => {
      const oversizedCommand: UploadMediaCommand = {
        file: Buffer.from('fake large pdf'),
        originalName: 'large-doc.pdf',
        mimeType: 'application/pdf',
        size: 60 * 1024 * 1024, // 60MB (exceeds 50MB limit)
        metadata: {},
      };

      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(FileSizeExceededError);
      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(
        /File size .* exceeds maximum allowed .* for PDF/
      );
    });

    it('should throw FileSizeExceededError when audio size exceeds limit', async () => {
      const oversizedCommand: UploadMediaCommand = {
        file: Buffer.from('fake large audio'),
        originalName: 'large-audio.mp3',
        mimeType: 'audio/mpeg',
        size: 120 * 1024 * 1024, // 120MB (exceeds 100MB limit)
        metadata: {},
      };

      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(FileSizeExceededError);
      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(
        /File size .* exceeds maximum allowed .* for AUDIO/
      );
    });

    it('should handle file without extension', async () => {
      const commandNoExt: UploadMediaCommand = {
        file: Buffer.from('fake video'),
        originalName: 'videofile',
        mimeType: 'video/mp4',
        size: 1024,
        metadata: {},
      };

      const mockMedia = {
        id: EntityId.generate(),
        filename: '12345678-1234-4234-8234-123456789012',
        originalName: commandNoExt.originalName,
        mimeType: commandNoExt.mimeType,
        type: MediaType.VIDEO,
        size: commandNoExt.size,
        bucket: 'finance4all-media',
        path: 'video/12345678-1234-4234-8234-123456789012',
        metadata: commandNoExt.metadata,
        toDTO: jest.fn((baseUrl: string) => ({
          id: 'media-id',
          filename: '12345678-1234-4234-8234-123456789012',
          originalName: commandNoExt.originalName,
          mimeType: commandNoExt.mimeType,
          type: MediaType.VIDEO,
          size: commandNoExt.size,
          url: `${baseUrl}/finance4all-media/video/12345678-1234-4234-8234-123456789012`,
          bucket: 'finance4all-media',
          path: 'video/12345678-1234-4234-8234-123456789012',
          metadata: commandNoExt.metadata,
          isTemporary: false,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-media',
        path: 'video/12345678-1234-4234-8234-123456789012',
        etag: 'etag',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      const result = await useCase.execute(commandNoExt);

      expect(mockStoragePort.upload).toHaveBeenCalledWith(commandNoExt.file, {
        bucket: 'finance4all-media',
        filename: 'video/12345678-1234-4234-8234-123456789012',
        mimeType: commandNoExt.mimeType,
        metadata: commandNoExt.metadata,
      });
      expect(result).toHaveProperty('filename', '12345678-1234-4234-8234-123456789012');
    });

    it('should handle metadata being undefined', async () => {
      const commandNoMetadata: UploadMediaCommand = {
        file: Buffer.from('fake data'),
        originalName: 'test.mp4',
        mimeType: 'video/mp4',
        size: 1024,
      };

      const mockMedia = {
        id: EntityId.generate(),
        filename: '12345678-1234-4234-8234-123456789012.mp4',
        originalName: commandNoMetadata.originalName,
        mimeType: commandNoMetadata.mimeType,
        type: MediaType.VIDEO,
        size: commandNoMetadata.size,
        bucket: 'finance4all-media',
        path: 'video/12345678-1234-4234-8234-123456789012.mp4',
        metadata: undefined,
        toDTO: jest.fn((baseUrl: string) => ({
          id: 'media-id',
          filename: '12345678-1234-4234-8234-123456789012.mp4',
          originalName: commandNoMetadata.originalName,
          mimeType: commandNoMetadata.mimeType,
          type: MediaType.VIDEO,
          size: commandNoMetadata.size,
          url: `${baseUrl}/finance4all-media/video/12345678-1234-4234-8234-123456789012.mp4`,
          bucket: 'finance4all-media',
          path: 'video/12345678-1234-4234-8234-123456789012.mp4',
          metadata: null,
          isTemporary: false,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-media',
        path: 'video/12345678-1234-4234-8234-123456789012.mp4',
        etag: 'etag',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      const result = await useCase.execute(commandNoMetadata);

      expect(result).toBeDefined();
      expect(mockStoragePort.upload).toHaveBeenCalledWith(commandNoMetadata.file, {
        bucket: 'finance4all-media',
        filename: 'video/12345678-1234-4234-8234-123456789012.mp4',
        mimeType: commandNoMetadata.mimeType,
        metadata: undefined,
      });
    });

    it('should wrap storage port errors in MediaUploadError', async () => {
      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockRejectedValue(new Error('Storage failure'));

      await expect(useCase.execute(validVideoCommand)).rejects.toThrow(MediaUploadError);
      await expect(useCase.execute(validVideoCommand)).rejects.toThrow(
        'Media upload failed: Failed to upload file: test-video.mp4'
      );
      expect(mockMediaRepository.save).not.toHaveBeenCalled();
    });

    it('should wrap repository errors in MediaUploadError', async () => {
      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-media',
        path: 'video/12345678-1234-4234-8234-123456789012.mp4',
        etag: 'etag',
      });
      mockMediaRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validVideoCommand)).rejects.toThrow(MediaUploadError);
      await expect(useCase.execute(validVideoCommand)).rejects.toThrow(
        'Media upload failed: Failed to upload file: test-video.mp4'
      );
    });

    it('should not wrap InvalidMediaTypeError in MediaUploadError', async () => {
      const invalidCommand: UploadMediaCommand = {
        file: Buffer.from('fake data'),
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 1024,
        metadata: {},
      };

      await expect(useCase.execute(invalidCommand)).rejects.toThrow(InvalidMediaTypeError);
      await expect(useCase.execute(invalidCommand)).rejects.not.toThrow(MediaUploadError);
    });

    it('should not wrap FileSizeExceededError in MediaUploadError', async () => {
      const oversizedCommand: UploadMediaCommand = {
        file: Buffer.from('fake large video'),
        originalName: 'large.mp4',
        mimeType: 'video/mp4',
        size: 600 * 1024 * 1024,
        metadata: {},
      };

      await expect(useCase.execute(oversizedCommand)).rejects.toThrow(FileSizeExceededError);
      await expect(useCase.execute(oversizedCommand)).rejects.not.toThrow(MediaUploadError);
    });

    it('should handle ensureBucket errors', async () => {
      mockStoragePort.ensureBucket.mockRejectedValue(new Error('Bucket creation failed'));

      await expect(useCase.execute(validVideoCommand)).rejects.toThrow(MediaUploadError);
      expect(mockStoragePort.upload).not.toHaveBeenCalled();
      expect(mockMediaRepository.save).not.toHaveBeenCalled();
    });

    it('should handle non-Error exceptions', async () => {
      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockRejectedValue('String error');

      await expect(useCase.execute(validVideoCommand)).rejects.toThrow(MediaUploadError);
      await expect(useCase.execute(validVideoCommand)).rejects.toThrow(
        'Media upload failed: Failed to upload file: test-video.mp4'
      );
    });

    it('should generate unique filenames based on UUID', async () => {
      const mockMedia = {
        id: EntityId.generate(),
        filename: '12345678-1234-4234-8234-123456789012.mp4',
        originalName: validVideoCommand.originalName,
        mimeType: validVideoCommand.mimeType,
        type: MediaType.VIDEO,
        size: validVideoCommand.size,
        bucket: 'finance4all-media',
        path: 'video/12345678-1234-4234-8234-123456789012.mp4',
        metadata: validVideoCommand.metadata,
        toDTO: jest.fn(() => ({
          id: 'media-id',
          filename: '12345678-1234-4234-8234-123456789012.mp4',
          originalName: validVideoCommand.originalName,
          mimeType: validVideoCommand.mimeType,
          type: MediaType.VIDEO,
          size: validVideoCommand.size,
          url: `${baseUrl}/finance4all-media/video/12345678-1234-4234-8234-123456789012.mp4`,
          bucket: 'finance4all-media',
          path: 'video/12345678-1234-4234-8234-123456789012.mp4',
          metadata: validVideoCommand.metadata,
          isTemporary: false,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-media',
        path: 'video/12345678-1234-4234-8234-123456789012.mp4',
        etag: 'etag',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      await useCase.execute(validVideoCommand);

      expect(mockStoragePort.upload).toHaveBeenCalledWith(
        validVideoCommand.file,
        expect.objectContaining({
          filename: 'video/12345678-1234-4234-8234-123456789012.mp4',
        })
      );
    });

    it('should properly construct path with media type and unique filename', async () => {
      const mockMedia = {
        id: EntityId.generate(),
        filename: '12345678-1234-4234-8234-123456789012.pdf',
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        type: MediaType.PDF,
        size: 1024,
        bucket: 'finance4all-media',
        path: 'pdf/12345678-1234-4234-8234-123456789012.pdf',
        metadata: null,
        toDTO: jest.fn(() => ({
          id: 'media-id',
          filename: '12345678-1234-4234-8234-123456789012.pdf',
          originalName: 'document.pdf',
          mimeType: 'application/pdf',
          type: MediaType.PDF,
          size: 1024,
          url: `${baseUrl}/finance4all-media/pdf/12345678-1234-4234-8234-123456789012.pdf`,
          bucket: 'finance4all-media',
          path: 'pdf/12345678-1234-4234-8234-123456789012.pdf',
          metadata: null,
          isTemporary: false,
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      const pdfCommand: UploadMediaCommand = {
        file: Buffer.from('pdf data'),
        originalName: 'document.pdf',
        mimeType: 'application/pdf',
        size: 1024,
      };

      mockStoragePort.ensureBucket.mockResolvedValue(undefined);
      mockStoragePort.upload.mockResolvedValue({
        bucket: 'finance4all-media',
        path: 'pdf/12345678-1234-4234-8234-123456789012.pdf',
        etag: 'etag',
      });
      mockMediaRepository.save.mockResolvedValue(mockMedia as any);

      await useCase.execute(pdfCommand);

      expect(mockStoragePort.upload).toHaveBeenCalledWith(
        pdfCommand.file,
        expect.objectContaining({
          filename: 'pdf/12345678-1234-4234-8234-123456789012.pdf',
        })
      );
    });
  });
});
