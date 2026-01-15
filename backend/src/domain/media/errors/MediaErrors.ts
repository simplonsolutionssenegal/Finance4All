export class MediaNotFoundError extends Error {
  constructor(mediaId: string) {
    super(`Media with id '${mediaId}' not found`);
    this.name = 'MediaNotFoundError';
  }
}

export class InvalidMediaTypeError extends Error {
  constructor(mimeType: string) {
    super(`Invalid or unsupported media type: ${mimeType}`);
    this.name = 'InvalidMediaTypeError';
  }
}

export class FileSizeExceededError extends Error {
  constructor(size: number, maxSize: number, mediaType: string) {
    super(`File size ${size} bytes exceeds maximum allowed ${maxSize} bytes for ${mediaType}`);
    this.name = 'FileSizeExceededError';
  }
}

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(`Storage error: ${message}`);
    this.name = 'StorageError';
  }
}

export class MediaUploadError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(`Media upload failed: ${message}`);
    this.name = 'MediaUploadError';
  }
}

export class MediaDeleteError extends Error {
  constructor(
    mediaId: string,
    public readonly cause?: Error
  ) {
    super(`Failed to delete media with id '${mediaId}'`);
    this.name = 'MediaDeleteError';
  }
}
