import {
  MediaNotStreamableError,
  TranscodingNotFoundError,
  TranscodingInProgressError,
  TranscodingFailedError,
  StreamNotReadyError,
  InvalidStreamTokenError,
  ProgressNotFoundError,
  SegmentNotFoundError,
  HlsVariantNotFoundError,
} from '@/domain/streaming/errors/StreamingErrors';

describe('StreamingErrors', () => {
  describe('MediaNotStreamableError', () => {
    it('should create error with correct message', () => {
      const mediaId = 'media-123';
      const reason = 'Invalid format';
      const error = new MediaNotStreamableError(mediaId, reason);

      expect(error.message).toBe(`Media '${mediaId}' is not streamable: ${reason}`);
      expect(error.name).toBe('MediaNotStreamableError');
    });

    it('should be instance of Error', () => {
      const error = new MediaNotStreamableError('media-123', 'test reason');
      expect(error).toBeInstanceOf(Error);
    });

    it('should preserve stack trace', () => {
      const error = new MediaNotStreamableError('media-123', 'test');
      expect(error.stack).toBeDefined();
    });
  });

  describe('TranscodingNotFoundError', () => {
    it('should create error with correct message', () => {
      const mediaId = 'media-456';
      const error = new TranscodingNotFoundError(mediaId);

      expect(error.message).toBe(`No transcoding job found for media '${mediaId}'`);
      expect(error.name).toBe('TranscodingNotFoundError');
    });

    it('should be instance of Error', () => {
      const error = new TranscodingNotFoundError('media-456');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('TranscodingInProgressError', () => {
    it('should create error with correct message', () => {
      const mediaId = 'media-789';
      const error = new TranscodingInProgressError(mediaId);

      expect(error.message).toBe(`Transcoding already in progress for media '${mediaId}'`);
      expect(error.name).toBe('TranscodingInProgressError');
    });

    it('should be instance of Error', () => {
      const error = new TranscodingInProgressError('media-789');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('TranscodingFailedError', () => {
    it('should create error with correct message', () => {
      const mediaId = 'media-abc';
      const reason = 'Codec not supported';
      const error = new TranscodingFailedError(mediaId, reason);

      expect(error.message).toBe(`Transcoding failed for media '${mediaId}': ${reason}`);
      expect(error.name).toBe('TranscodingFailedError');
    });

    it('should be instance of Error', () => {
      const error = new TranscodingFailedError('media-abc', 'test reason');
      expect(error).toBeInstanceOf(Error);
    });

    it('should include detailed failure reason', () => {
      const detailedReason = 'FFmpeg process exited with code 1: Unsupported input format';
      const error = new TranscodingFailedError('media-123', detailedReason);

      expect(error.message).toContain(detailedReason);
    });
  });

  describe('StreamNotReadyError', () => {
    it('should create error with correct message', () => {
      const mediaId = 'media-def';
      const error = new StreamNotReadyError(mediaId);

      expect(error.message).toBe(
        `Stream not ready for media '${mediaId}'. Transcoding may still be in progress.`
      );
      expect(error.name).toBe('StreamNotReadyError');
    });

    it('should be instance of Error', () => {
      const error = new StreamNotReadyError('media-def');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('InvalidStreamTokenError', () => {
    it('should create error with correct message', () => {
      const error = new InvalidStreamTokenError();

      expect(error.message).toBe('Invalid or expired stream token');
      expect(error.name).toBe('InvalidStreamTokenError');
    });

    it('should be instance of Error', () => {
      const error = new InvalidStreamTokenError();
      expect(error).toBeInstanceOf(Error);
    });

    it('should not require any parameters', () => {
      expect(() => new InvalidStreamTokenError()).not.toThrow();
    });
  });

  describe('ProgressNotFoundError', () => {
    it('should create error with correct message', () => {
      const userId = 'user-123';
      const mediaId = 'media-456';
      const error = new ProgressNotFoundError(userId, mediaId);

      expect(error.message).toBe(`No progress found for user '${userId}' on media '${mediaId}'`);
      expect(error.name).toBe('ProgressNotFoundError');
    });

    it('should be instance of Error', () => {
      const error = new ProgressNotFoundError('user-123', 'media-456');
      expect(error).toBeInstanceOf(Error);
    });

    it('should include both userId and mediaId in message', () => {
      const error = new ProgressNotFoundError('specific-user', 'specific-media');

      expect(error.message).toContain('specific-user');
      expect(error.message).toContain('specific-media');
    });
  });

  describe('SegmentNotFoundError', () => {
    it('should create error with correct message', () => {
      const mediaId = 'media-xyz';
      const segment = 'segment005.ts';
      const error = new SegmentNotFoundError(mediaId, segment);

      expect(error.message).toBe(`Segment '${segment}' not found for media '${mediaId}'`);
      expect(error.name).toBe('SegmentNotFoundError');
    });

    it('should be instance of Error', () => {
      const error = new SegmentNotFoundError('media-xyz', 'segment.ts');
      expect(error).toBeInstanceOf(Error);
    });

    it('should include segment identifier in message', () => {
      const error = new SegmentNotFoundError('media-123', 'segment042.ts');

      expect(error.message).toContain('segment042.ts');
    });
  });

  describe('HlsVariantNotFoundError', () => {
    it('should create error with correct message', () => {
      const mediaId = 'media-hls';
      const quality = '720p';
      const error = new HlsVariantNotFoundError(mediaId, quality);

      expect(error.message).toBe(`HLS variant '${quality}' not found for media '${mediaId}'`);
      expect(error.name).toBe('HlsVariantNotFoundError');
    });

    it('should be instance of Error', () => {
      const error = new HlsVariantNotFoundError('media-hls', '1080p');
      expect(error).toBeInstanceOf(Error);
    });

    it('should work with different quality values', () => {
      const qualities = ['360p', '480p', '720p', '1080p', 'AUDIO_LOW', 'AUDIO_HIGH'];

      for (const quality of qualities) {
        const error = new HlsVariantNotFoundError('media-123', quality);
        expect(error.message).toContain(quality);
      }
    });
  });

  describe('error inheritance', () => {
    it('all errors should extend Error', () => {
      const errors = [
        new MediaNotStreamableError('id', 'reason'),
        new TranscodingNotFoundError('id'),
        new TranscodingInProgressError('id'),
        new TranscodingFailedError('id', 'reason'),
        new StreamNotReadyError('id'),
        new InvalidStreamTokenError(),
        new ProgressNotFoundError('user', 'media'),
        new SegmentNotFoundError('media', 'segment'),
        new HlsVariantNotFoundError('media', 'quality'),
      ];

      for (const error of errors) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('all errors should have name property set', () => {
      const errorsWithNames = [
        { error: new MediaNotStreamableError('id', 'reason'), name: 'MediaNotStreamableError' },
        { error: new TranscodingNotFoundError('id'), name: 'TranscodingNotFoundError' },
        { error: new TranscodingInProgressError('id'), name: 'TranscodingInProgressError' },
        { error: new TranscodingFailedError('id', 'reason'), name: 'TranscodingFailedError' },
        { error: new StreamNotReadyError('id'), name: 'StreamNotReadyError' },
        { error: new InvalidStreamTokenError(), name: 'InvalidStreamTokenError' },
        { error: new ProgressNotFoundError('user', 'media'), name: 'ProgressNotFoundError' },
        { error: new SegmentNotFoundError('media', 'segment'), name: 'SegmentNotFoundError' },
        { error: new HlsVariantNotFoundError('media', 'quality'), name: 'HlsVariantNotFoundError' },
      ];

      for (const { error, name } of errorsWithNames) {
        expect(error.name).toBe(name);
      }
    });
  });

  describe('error throwing and catching', () => {
    it('should be catchable by name', () => {
      try {
        throw new MediaNotStreamableError('media-123', 'test');
      } catch (error) {
        if (error instanceof Error) {
          expect(error.name).toBe('MediaNotStreamableError');
        }
      }
    });

    it('should be catchable by instanceof', () => {
      expect(() => {
        throw new TranscodingNotFoundError('media-123');
      }).toThrow(TranscodingNotFoundError);
    });

    it('should preserve error chain in async code', async () => {
      const asyncFunction = async () => {
        throw new StreamNotReadyError('media-async');
      };

      await expect(asyncFunction()).rejects.toThrow(StreamNotReadyError);
      await expect(asyncFunction()).rejects.toThrow('Stream not ready');
    });
  });
});
