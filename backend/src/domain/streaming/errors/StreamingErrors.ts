export class MediaNotStreamableError extends Error {
  constructor(mediaId: string, reason: string) {
    super(`Media '${mediaId}' is not streamable: ${reason}`);
    this.name = 'MediaNotStreamableError';
  }
}

export class TranscodingNotFoundError extends Error {
  constructor(mediaId: string) {
    super(`No transcoding job found for media '${mediaId}'`);
    this.name = 'TranscodingNotFoundError';
  }
}

export class TranscodingInProgressError extends Error {
  constructor(mediaId: string) {
    super(`Transcoding already in progress for media '${mediaId}'`);
    this.name = 'TranscodingInProgressError';
  }
}

export class TranscodingFailedError extends Error {
  constructor(mediaId: string, reason: string) {
    super(`Transcoding failed for media '${mediaId}': ${reason}`);
    this.name = 'TranscodingFailedError';
  }
}

export class StreamNotReadyError extends Error {
  constructor(mediaId: string) {
    super(`Stream not ready for media '${mediaId}'. Transcoding may still be in progress.`);
    this.name = 'StreamNotReadyError';
  }
}

export class InvalidStreamTokenError extends Error {
  constructor() {
    super('Invalid or expired stream token');
    this.name = 'InvalidStreamTokenError';
  }
}

export class ProgressNotFoundError extends Error {
  constructor(userId: string, mediaId: string) {
    super(`No progress found for user '${userId}' on media '${mediaId}'`);
    this.name = 'ProgressNotFoundError';
  }
}

export class SegmentNotFoundError extends Error {
  constructor(mediaId: string, segment: string) {
    super(`Segment '${segment}' not found for media '${mediaId}'`);
    this.name = 'SegmentNotFoundError';
  }
}

export class HlsVariantNotFoundError extends Error {
  constructor(mediaId: string, quality: string) {
    super(`HLS variant '${quality}' not found for media '${mediaId}'`);
    this.name = 'HlsVariantNotFoundError';
  }
}
