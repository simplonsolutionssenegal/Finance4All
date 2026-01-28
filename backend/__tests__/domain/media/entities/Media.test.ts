import { Media } from '@/domain/media/entities/Media';
import { EntityId } from '@/domain/shared/EntityId';
import { MediaType } from '@/domain/media/value-objects/MediaType';

describe('Media Entity', () => {
  const validMediaId = EntityId.generate();
  const validProps = {
    id: validMediaId,
    filename: 'test-file.pdf',
    originalName: 'original-test.pdf',
    mimeType: 'application/pdf',
    type: MediaType.PDF,
    size: 1024 * 1024, // 1MB
    bucket: 'test-bucket',
    path: 'documents/test-file.pdf',
    metadata: { key: 'value' },
    isTemporary: false,
    expiresAt: null,
  };

  describe('constructor', () => {
    it('should create a valid media instance with all properties', () => {
      const media = new Media(validProps);

      expect(media.id).toEqual(validMediaId);
      expect(media.filename).toBe('test-file.pdf');
      expect(media.originalName).toBe('original-test.pdf');
      expect(media.mimeType).toBe('application/pdf');
      expect(media.type).toBe(MediaType.PDF);
      expect(media.size).toBe(1024 * 1024);
      expect(media.bucket).toBe('test-bucket');
      expect(media.path).toBe('documents/test-file.pdf');
      expect(media.metadata).toEqual({ key: 'value' });
      expect(media.isTemporary).toBe(false);
      expect(media.expiresAt).toBeNull();
    });

    it('should create media with default values for optional properties', () => {
      const propsWithoutOptional = {
        id: validMediaId,
        filename: 'test-file.pdf',
        originalName: 'original-test.pdf',
        mimeType: 'application/pdf',
        type: MediaType.PDF,
        size: 1024,
        bucket: 'test-bucket',
        path: 'documents/test-file.pdf',
        metadata: null,
      };

      const media = new Media(propsWithoutOptional);

      expect(media.isTemporary).toBe(false);
      expect(media.expiresAt).toBeNull();
      expect(media.metadata).toBeNull();
    });

    it('should create temporary media with expiration date', () => {
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      const tempProps = {
        ...validProps,
        isTemporary: true,
        expiresAt,
      };

      const media = new Media(tempProps);

      expect(media.isTemporary).toBe(true);
      expect(media.expiresAt).toEqual(expiresAt);
    });

    it('should accept createdAt and updatedAt when provided', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');
      const propsWithDates = {
        ...validProps,
        createdAt,
        updatedAt,
      };

      const media = new Media(propsWithDates);

      expect(media.createdAt).toEqual(createdAt);
      expect(media.updatedAt).toEqual(updatedAt);
    });

    it('should throw error for invalid mime type', () => {
      const invalidProps = {
        ...validProps,
        mimeType: 'invalid/mime-type',
      };

      expect(() => new Media(invalidProps)).toThrow(
        "Invalid mime type 'invalid/mime-type' for media type 'PDF'"
      );
    });

    it('should throw error for file size exceeding maximum', () => {
      const invalidProps = {
        ...validProps,
        size: 1024 * 1024 * 1024 * 100, // 100GB - exceeds limit
      };

      expect(() => new Media(invalidProps)).toThrow(/File size .+ exceeds maximum allowed size/);
    });

    it('should validate video mime types correctly', () => {
      const videoProps = {
        ...validProps,
        mimeType: 'video/mp4',
        type: MediaType.VIDEO,
        size: 1024 * 1024 * 50, // 50MB
      };

      const media = new Media(videoProps);
      expect(media.mimeType).toBe('video/mp4');
      expect(media.type).toBe(MediaType.VIDEO);
    });

    it('should validate audio mime types correctly', () => {
      const audioProps = {
        ...validProps,
        mimeType: 'audio/mpeg',
        type: MediaType.AUDIO,
        size: 1024 * 1024 * 5, // 5MB
      };

      const media = new Media(audioProps);
      expect(media.mimeType).toBe('audio/mpeg');
      expect(media.type).toBe(MediaType.AUDIO);
    });

    it('should reject invalid video mime type', () => {
      const invalidProps = {
        ...validProps,
        mimeType: 'audio/mpeg',
        type: MediaType.VIDEO,
      };

      expect(() => new Media(invalidProps)).toThrow(
        "Invalid mime type 'audio/mpeg' for media type 'VIDEO'"
      );
    });
  });

  describe('getters', () => {
    it('should provide access to all properties via getters', () => {
      const media = new Media(validProps);

      expect(media.filename).toBe(validProps.filename);
      expect(media.originalName).toBe(validProps.originalName);
      expect(media.mimeType).toBe(validProps.mimeType);
      expect(media.type).toBe(validProps.type);
      expect(media.size).toBe(validProps.size);
      expect(media.bucket).toBe(validProps.bucket);
      expect(media.path).toBe(validProps.path);
      expect(media.metadata).toEqual(validProps.metadata);
      expect(media.isTemporary).toBe(validProps.isTemporary);
      expect(media.expiresAt).toBe(validProps.expiresAt);
    });

    it('should return correct fullPath', () => {
      const media = new Media(validProps);

      expect(media.fullPath).toBe('test-bucket/documents/test-file.pdf');
    });
  });

  describe('isExpired', () => {
    it('should return false for permanent media', () => {
      const media = new Media({
        ...validProps,
        isTemporary: false,
        expiresAt: null,
      });

      expect(media.isExpired).toBe(false);
    });

    it('should return false for temporary media without expiration date', () => {
      const media = new Media({
        ...validProps,
        isTemporary: true,
        expiresAt: null,
      });

      expect(media.isExpired).toBe(false);
    });

    it('should return false for temporary media not yet expired', () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour in future
      const media = new Media({
        ...validProps,
        isTemporary: true,
        expiresAt: futureDate,
      });

      expect(media.isExpired).toBe(false);
    });

    it('should return true for expired temporary media', () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour in past
      const media = new Media({
        ...validProps,
        isTemporary: true,
        expiresAt: pastDate,
      });

      expect(media.isExpired).toBe(true);
    });
  });

  describe('updateMetadata', () => {
    it('should update metadata and set updatedAt', () => {
      const media = new Media(validProps);

      const newMetadata = { newKey: 'newValue' };
      media.updateMetadata(newMetadata);

      expect(media.metadata).toEqual({
        key: 'value',
        newKey: 'newValue',
      });
      expect(media.updatedAt).toBeDefined();
      expect(media.updatedAt).toBeInstanceOf(Date);
    });

    it('should merge new metadata with existing metadata', () => {
      const media = new Media({
        ...validProps,
        metadata: { existingKey: 'existingValue' },
      });

      media.updateMetadata({ newKey: 'newValue' });

      expect(media.metadata).toEqual({
        existingKey: 'existingValue',
        newKey: 'newValue',
      });
    });

    it('should handle null metadata', () => {
      const media = new Media({
        ...validProps,
        metadata: null,
      });

      media.updateMetadata({ key: 'value' });

      expect(media.metadata).toEqual({ key: 'value' });
    });
  });

  describe('markAsPermanent', () => {
    it('should mark temporary media as permanent', () => {
      const expiresAt = new Date(Date.now() + 3600000);
      const media = new Media({
        ...validProps,
        isTemporary: true,
        expiresAt,
      });

      media.markAsPermanent();

      expect(media.isTemporary).toBe(false);
      expect(media.expiresAt).toBeNull();
      expect(media.updatedAt).toBeDefined();
    });

    it('should update updatedAt timestamp', () => {
      const media = new Media({
        ...validProps,
        isTemporary: true,
        expiresAt: new Date(),
      });

      media.markAsPermanent();

      expect(media.updatedAt).toBeDefined();
      expect(media.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('toDTO', () => {
    it('should convert to DTO with correct URL', () => {
      const media = new Media(validProps);
      const baseUrl = 'https://example.com/media';

      const dto = media.toDTO(baseUrl);

      expect(dto).toEqual({
        id: validMediaId.getValue(),
        filename: 'test-file.pdf',
        originalName: 'original-test.pdf',
        mimeType: 'application/pdf',
        type: MediaType.PDF,
        size: 1024 * 1024,
        url: 'https://example.com/media/test-bucket/documents/test-file.pdf',
        bucket: 'test-bucket',
        path: 'documents/test-file.pdf',
        metadata: { key: 'value' },
        isTemporary: false,
        expiresAt: null,
        createdAt: media.createdAt,
        updatedAt: media.updatedAt,
      });
    });

    it('should include all timestamps in DTO', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');
      const media = new Media({
        ...validProps,
        createdAt,
        updatedAt,
      });

      const dto = media.toDTO('https://example.com');

      expect(dto.createdAt).toEqual(createdAt);
      expect(dto.updatedAt).toEqual(updatedAt);
    });

    it('should handle null metadata in DTO', () => {
      const media = new Media({
        ...validProps,
        metadata: null,
      });

      const dto = media.toDTO('https://example.com');

      expect(dto.metadata).toBeNull();
    });
  });

  describe('create static method', () => {
    it('should create media with generated ID', () => {
      const media = Media.create(
        'test-file.pdf',
        'original-test.pdf',
        'application/pdf',
        1024 * 1024,
        'test-bucket',
        'documents/test-file.pdf'
      );

      expect(media.id).toBeDefined();
      expect(media.filename).toBe('test-file.pdf');
      expect(media.originalName).toBe('original-test.pdf');
      expect(media.mimeType).toBe('application/pdf');
      expect(media.type).toBe(MediaType.PDF);
      expect(media.size).toBe(1024 * 1024);
      expect(media.bucket).toBe('test-bucket');
      expect(media.path).toBe('documents/test-file.pdf');
      expect(media.isTemporary).toBe(false);
    });

    it('should create temporary media when specified', () => {
      const expiresAt = new Date(Date.now() + 3600000);
      const media = Media.create(
        'test-file.pdf',
        'original-test.pdf',
        'application/pdf',
        1024 * 1024,
        'test-bucket',
        'temp/test-file.pdf',
        { key: 'value' },
        true,
        expiresAt
      );

      expect(media.isTemporary).toBe(true);
      expect(media.expiresAt).toEqual(expiresAt);
      expect(media.metadata).toEqual({ key: 'value' });
    });

    it('should throw error for unsupported mime type', () => {
      expect(() =>
        Media.create(
          'test-file.xyz',
          'original-test.xyz',
          'application/xyz',
          1024,
          'test-bucket',
          'documents/test-file.xyz'
        )
      ).toThrow('Unsupported mime type: application/xyz');
    });

    it('should create media with video mime type', () => {
      const media = Media.create(
        'test-video.mp4',
        'original-video.mp4',
        'video/mp4',
        1024 * 1024 * 50,
        'test-bucket',
        'videos/test-video.mp4'
      );

      expect(media.type).toBe(MediaType.VIDEO);
      expect(media.mimeType).toBe('video/mp4');
    });

    it('should create media with audio mime type', () => {
      const media = Media.create(
        'test-audio.mp3',
        'original-audio.mp3',
        'audio/mpeg',
        1024 * 1024 * 5,
        'test-bucket',
        'audios/test-audio.mp3'
      );

      expect(media.type).toBe(MediaType.AUDIO);
      expect(media.mimeType).toBe('audio/mpeg');
    });

    it('should handle metadata being undefined', () => {
      const media = Media.create(
        'test-file.pdf',
        'original-test.pdf',
        'application/pdf',
        1024,
        'test-bucket',
        'documents/test-file.pdf',
        undefined
      );

      expect(media.metadata).toBeNull();
    });

    it('should handle expiresAt being undefined', () => {
      const media = Media.create(
        'test-file.pdf',
        'original-test.pdf',
        'application/pdf',
        1024,
        'test-bucket',
        'temp/test-file.pdf',
        undefined,
        true,
        undefined
      );

      expect(media.isTemporary).toBe(true);
      expect(media.expiresAt).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty metadata object', () => {
      const media = new Media({
        ...validProps,
        metadata: {},
      });

      expect(media.metadata).toEqual({});
    });

    it('should handle very small file sizes', () => {
      const media = new Media({
        ...validProps,
        size: 1,
      });

      expect(media.size).toBe(1);
    });

    it('should handle PDF mime type', () => {
      const media = new Media({
        ...validProps,
        mimeType: 'application/pdf',
        type: MediaType.PDF,
      });
      expect(media.mimeType).toBe('application/pdf');
    });
  });
});
