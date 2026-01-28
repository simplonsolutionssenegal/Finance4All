import {
  MediaNotFoundError,
  InvalidMediaTypeError,
  FileSizeExceededError,
  StorageError,
  MediaUploadError,
  MediaDeleteError,
} from '@/domain/media/errors/MediaErrors';

describe('Media Errors', () => {
  describe('MediaNotFoundError', () => {
    it('should create error with correct message', () => {
      const mediaId = 'media-123';
      const error = new MediaNotFoundError(mediaId);

      expect(error.message).toBe(`Media with id '${mediaId}' not found`);
      expect(error.name).toBe('MediaNotFoundError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error for different media IDs', () => {
      const mediaId1 = 'abc-123';
      const error1 = new MediaNotFoundError(mediaId1);
      expect(error1.message).toContain(mediaId1);

      const mediaId2 = 'xyz-456';
      const error2 = new MediaNotFoundError(mediaId2);
      expect(error2.message).toContain(mediaId2);
    });

    it('should have Error prototype', () => {
      const error = new MediaNotFoundError('test-id');
      expect(Object.getPrototypeOf(error)).toBe(MediaNotFoundError.prototype);
    });
  });

  describe('InvalidMediaTypeError', () => {
    it('should create error with correct message', () => {
      const mimeType = 'application/unknown';
      const error = new InvalidMediaTypeError(mimeType);

      expect(error.message).toBe(`Invalid or unsupported media type: ${mimeType}`);
      expect(error.name).toBe('InvalidMediaTypeError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error for different mime types', () => {
      const mimeType1 = 'image/svg';
      const error1 = new InvalidMediaTypeError(mimeType1);
      expect(error1.message).toContain(mimeType1);

      const mimeType2 = 'text/html';
      const error2 = new InvalidMediaTypeError(mimeType2);
      expect(error2.message).toContain(mimeType2);
    });
  });

  describe('FileSizeExceededError', () => {
    it('should create error with correct message', () => {
      const size = 1024 * 1024 * 100; // 100MB
      const maxSize = 1024 * 1024 * 50; // 50MB
      const mediaType = 'video';
      const error = new FileSizeExceededError(size, maxSize, mediaType);

      expect(error.message).toBe(
        `File size ${size} bytes exceeds maximum allowed ${maxSize} bytes for ${mediaType}`
      );
      expect(error.name).toBe('FileSizeExceededError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error with different size values', () => {
      const error1 = new FileSizeExceededError(1000, 500, 'pdf');
      expect(error1.message).toContain('1000');
      expect(error1.message).toContain('500');
      expect(error1.message).toContain('pdf');

      const error2 = new FileSizeExceededError(2000000, 1000000, 'audio');
      expect(error2.message).toContain('2000000');
      expect(error2.message).toContain('1000000');
      expect(error2.message).toContain('audio');
    });
  });

  describe('StorageError', () => {
    it('should create error with message only', () => {
      const message = 'Failed to connect to storage';
      const error = new StorageError(message);

      expect(error.message).toBe(`Storage error: ${message}`);
      expect(error.name).toBe('StorageError');
      expect(error.cause).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error with message and cause', () => {
      const message = 'Connection timeout';
      const cause = new Error('Network error');
      const error = new StorageError(message, cause);

      expect(error.message).toBe(`Storage error: ${message}`);
      expect(error.name).toBe('StorageError');
      expect(error.cause).toBe(cause);
    });

    it('should preserve cause error', () => {
      const originalError = new Error('Original error');
      originalError.stack = 'original stack trace';
      const error = new StorageError('Wrapped error', originalError);

      expect(error.cause).toBe(originalError);
      expect(error.cause?.message).toBe('Original error');
      expect(error.cause?.stack).toBe('original stack trace');
    });
  });

  describe('MediaUploadError', () => {
    it('should create error with message only', () => {
      const message = 'Upload failed';
      const error = new MediaUploadError(message);

      expect(error.message).toBe(`Media upload failed: ${message}`);
      expect(error.name).toBe('MediaUploadError');
      expect(error.cause).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error with message and cause', () => {
      const message = 'Invalid file format';
      const cause = new Error('File is corrupted');
      const error = new MediaUploadError(message, cause);

      expect(error.message).toBe(`Media upload failed: ${message}`);
      expect(error.name).toBe('MediaUploadError');
      expect(error.cause).toBe(cause);
    });

    it('should preserve cause error details', () => {
      const originalError = new Error('Disk full');
      const error = new MediaUploadError('Cannot save file', originalError);

      expect(error.cause).toBe(originalError);
      expect(error.cause?.message).toBe('Disk full');
    });
  });

  describe('MediaDeleteError', () => {
    it('should create error with media ID only', () => {
      const mediaId = 'media-456';
      const error = new MediaDeleteError(mediaId);

      expect(error.message).toBe(`Failed to delete media with id '${mediaId}'`);
      expect(error.name).toBe('MediaDeleteError');
      expect(error.cause).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
    });

    it('should create error with media ID and cause', () => {
      const mediaId = 'media-789';
      const cause = new Error('Permission denied');
      const error = new MediaDeleteError(mediaId, cause);

      expect(error.message).toBe(`Failed to delete media with id '${mediaId}'`);
      expect(error.name).toBe('MediaDeleteError');
      expect(error.cause).toBe(cause);
    });

    it('should preserve cause error for different media IDs', () => {
      const originalError = new Error('File locked');
      const error1 = new MediaDeleteError('media-001', originalError);
      const error2 = new MediaDeleteError('media-002', originalError);

      expect(error1.cause).toBe(originalError);
      expect(error2.cause).toBe(originalError);
      expect(error1.message).toContain('media-001');
      expect(error2.message).toContain('media-002');
    });
  });

  describe('Error inheritance', () => {
    it('should all errors extend Error', () => {
      const errors = [
        new MediaNotFoundError('id'),
        new InvalidMediaTypeError('type'),
        new FileSizeExceededError(100, 50, 'video'),
        new StorageError('message'),
        new MediaUploadError('message'),
        new MediaDeleteError('id'),
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(Error);
      });
    });

    it('should all errors have unique names', () => {
      const errors = [
        new MediaNotFoundError('id'),
        new InvalidMediaTypeError('type'),
        new FileSizeExceededError(100, 50, 'video'),
        new StorageError('message'),
        new MediaUploadError('message'),
        new MediaDeleteError('id'),
      ];

      const names = errors.map(e => e.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(errors.length);
    });

    it('should all errors have stack traces', () => {
      const errors = [
        new MediaNotFoundError('id'),
        new InvalidMediaTypeError('type'),
        new FileSizeExceededError(100, 50, 'video'),
        new StorageError('message'),
        new MediaUploadError('message'),
        new MediaDeleteError('id'),
      ];

      errors.forEach(error => {
        expect(error.stack).toBeDefined();
        expect(typeof error.stack).toBe('string');
      });
    });
  });
});
