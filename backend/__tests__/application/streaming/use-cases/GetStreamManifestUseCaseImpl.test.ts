import { GetStreamManifestUseCaseImpl } from '@/application/streaming/use-cases/GetStreamManifestUseCaseImpl';
import type { HlsVariantRepository } from '@/domain/streaming/ports/out/HlsVariantRepository';
import type { TranscodingJobRepository } from '@/domain/streaming/ports/out/TranscodingJobRepository';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import { HlsVariant } from '@/domain/streaming/entities/HlsVariant';
import { TranscodingJob } from '@/domain/streaming/entities/TranscodingJob';
import { TranscodingStatus } from '@/domain/streaming/value-objects/TranscodingStatus';
import { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';
import { MediaNotFoundError } from '@/domain/media/errors/MediaErrors';
import {
  StreamNotReadyError,
  TranscodingNotFoundError,
} from '@/domain/streaming/errors/StreamingErrors';

describe('GetStreamManifestUseCaseImpl', () => {
  let useCase: GetStreamManifestUseCaseImpl;
  let mockHlsVariantRepository: jest.Mocked<HlsVariantRepository>;
  let mockTranscodingJobRepository: jest.Mocked<TranscodingJobRepository>;
  let mockMediaRepository: jest.Mocked<MediaRepository>;
  const baseStreamUrl = 'https://stream.example.com';

  beforeEach(() => {
    mockHlsVariantRepository = {
      save: jest.fn(),
      saveMany: jest.fn(),
      findByMediaId: jest.fn(),
      findByMediaIdAndQuality: jest.fn(),
      deleteByMediaId: jest.fn(),
    };

    mockTranscodingJobRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByMediaId: jest.fn(),
      findByStatus: jest.fn(),
      delete: jest.fn(),
    };

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

    useCase = new GetStreamManifestUseCaseImpl(
      mockHlsVariantRepository,
      mockTranscodingJobRepository,
      mockMediaRepository,
      baseStreamUrl
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validQuery = {
      mediaId: 'media-123',
      userId: 'user-456',
    };

    it('should return stream manifest when transcoding is completed', async () => {
      const mockMedia = { id: 'media-123', type: 'VIDEO' };
      const mockJob = TranscodingJob.create('media-123');
      mockJob.start();
      mockJob.complete();

      const mockVariants = [
        HlsVariant.create(
          'media-123',
          StreamQuality.Q720P,
          2928000,
          '1280x720',
          'avc1.4d001f,mp4a.40.2',
          '/streams/media-123/720p/playlist.m3u8',
          'segment',
          10.0
        ),
      ];

      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);
      mockHlsVariantRepository.findByMediaId.mockResolvedValue(mockVariants);

      const result = await useCase.execute(validQuery);

      expect(result).toHaveProperty('masterPlaylistUrl');
      expect(result).toHaveProperty('variants');
      expect(result).toHaveProperty('transcodingStatus', TranscodingStatus.COMPLETED);
      expect(result.masterPlaylistUrl).toBe(
        `${baseStreamUrl}/api/v1/media/${validQuery.mediaId}/stream/master.m3u8`
      );
    });

    it('should throw MediaNotFoundError when media does not exist', async () => {
      mockMediaRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validQuery)).rejects.toThrow(MediaNotFoundError);
    });

    it('should throw TranscodingNotFoundError when no transcoding job exists', async () => {
      const mockMedia = { id: 'media-123', type: 'VIDEO' };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(null);

      await expect(useCase.execute(validQuery)).rejects.toThrow(TranscodingNotFoundError);
    });

    it('should throw StreamNotReadyError when transcoding is pending', async () => {
      const mockMedia = { id: 'media-123', type: 'VIDEO' };
      const mockJob = TranscodingJob.create('media-123');

      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);

      await expect(useCase.execute(validQuery)).rejects.toThrow(StreamNotReadyError);
    });

    it('should throw StreamNotReadyError when transcoding is in progress', async () => {
      const mockMedia = { id: 'media-123', type: 'VIDEO' };
      const mockJob = TranscodingJob.create('media-123');
      mockJob.start();

      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);

      await expect(useCase.execute(validQuery)).rejects.toThrow(StreamNotReadyError);
    });

    it('should throw StreamNotReadyError when transcoding failed', async () => {
      const mockMedia = { id: 'media-123', type: 'VIDEO' };
      const mockJob = TranscodingJob.create('media-123');
      mockJob.start();
      mockJob.fail('Error');

      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);

      await expect(useCase.execute(validQuery)).rejects.toThrow(StreamNotReadyError);
    });

    it('should return multiple variants sorted by bandwidth', async () => {
      const mockMedia = { id: 'media-123', type: 'VIDEO' };
      const mockJob = TranscodingJob.create('media-123');
      mockJob.start();
      mockJob.complete();

      const mockVariants = [
        HlsVariant.create(
          'media-123',
          StreamQuality.Q360P,
          896000,
          '640x360',
          'avc1.42001f,mp4a.40.2',
          '/streams/720p/playlist.m3u8',
          'segment'
        ),
        HlsVariant.create(
          'media-123',
          StreamQuality.Q720P,
          2928000,
          '1280x720',
          'avc1.4d001f,mp4a.40.2',
          '/streams/720p/playlist.m3u8',
          'segment'
        ),
        HlsVariant.create(
          'media-123',
          StreamQuality.Q1080P,
          5192000,
          '1920x1080',
          'avc1.640028,mp4a.40.2',
          '/streams/1080p/playlist.m3u8',
          'segment'
        ),
      ];

      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);
      mockHlsVariantRepository.findByMediaId.mockResolvedValue(mockVariants);

      const result = await useCase.execute(validQuery);

      expect(result.variants).toHaveLength(3);
    });

    it('should return empty variants array when no variants exist', async () => {
      const mockMedia = { id: 'media-123', type: 'VIDEO' };
      const mockJob = TranscodingJob.create('media-123');
      mockJob.start();
      mockJob.complete();

      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);
      mockHlsVariantRepository.findByMediaId.mockResolvedValue([]);

      const result = await useCase.execute(validQuery);

      expect(result.variants).toHaveLength(0);
    });

    it('should include correct playlist URLs for variants', async () => {
      const mockMedia = { id: 'media-123', type: 'VIDEO' };
      const mockJob = TranscodingJob.create('media-123');
      mockJob.start();
      mockJob.complete();

      const mockVariants = [
        HlsVariant.create(
          'media-123',
          StreamQuality.Q720P,
          2928000,
          '1280x720',
          'avc1.4d001f,mp4a.40.2',
          '/streams/720p/playlist.m3u8',
          'segment'
        ),
      ];

      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);
      mockHlsVariantRepository.findByMediaId.mockResolvedValue(mockVariants);

      const result = await useCase.execute(validQuery);

      expect(result.variants[0].playlistUrl).toBe(
        `${baseStreamUrl}/api/v1/media/${validQuery.mediaId}/stream/q720p/playlist.m3u8`
      );
    });

    it('should handle repository errors', async () => {
      mockMediaRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validQuery)).rejects.toThrow('Database error');
    });
  });
});
