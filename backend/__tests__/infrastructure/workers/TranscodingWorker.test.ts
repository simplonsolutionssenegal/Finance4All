import { TranscodingWorker } from '@/infrastructure/workers/TranscodingWorker';
import { TranscodingJob } from '@/domain/streaming/entities/TranscodingJob';
import { Media } from '@/domain/media/entities/Media';
import { EntityId } from '@/domain/shared/EntityId';
import { MediaType } from '@/domain/media/value-objects/MediaType';
import { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';
import { TranscodingStatus } from '@/domain/streaming/value-objects/TranscodingStatus';
import type { TranscodingServicePort } from '@/domain/streaming/ports/out/TranscodingServicePort';
import type { TranscodingJobRepository } from '@/domain/streaming/ports/out/TranscodingJobRepository';
import type { HlsVariantRepository } from '@/domain/streaming/ports/out/HlsVariantRepository';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import type { Job } from 'bullmq';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';

jest.mock('fs/promises');

describe('TranscodingWorker', () => {
  let worker: TranscodingWorker;
  let mockTranscodingService: jest.Mocked<TranscodingServicePort>;
  let mockTranscodingJobRepository: jest.Mocked<TranscodingJobRepository>;
  let mockHlsVariantRepository: jest.Mocked<HlsVariantRepository>;
  let mockMediaRepository: jest.Mocked<MediaRepository>;
  let mockStoragePort: jest.Mocked<StoragePort>;
  let mockMkdir: jest.MockedFunction<typeof fs.mkdir>;
  let mockReaddir: jest.MockedFunction<typeof fs.readdir>;
  let mockReadFile: jest.MockedFunction<typeof fs.readFile>;
  let mockRm: jest.MockedFunction<typeof fs.rm>;

  const testMediaId = randomUUID();

  beforeEach(() => {
    mockTranscodingService = {
      transcode: jest.fn(),
      probe: jest.fn(),
      cancelJob: jest.fn(),
    };

    mockTranscodingJobRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByMediaId: jest.fn(),
      findByStatus: jest.fn(),
      delete: jest.fn(),
    };

    mockHlsVariantRepository = {
      save: jest.fn(),
      saveMany: jest.fn(),
      findByMediaId: jest.fn(),
      findByMediaIdAndQuality: jest.fn(),
      deleteByMediaId: jest.fn(),
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

    mockStoragePort = {
      upload: jest.fn(),
      delete: jest.fn(),
      getPresignedUrl: jest.fn(),
      getPublicUrl: jest.fn(),
      ensureBucket: jest.fn(),
      exists: jest.fn(),
    };

    mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;
    mockReaddir = fs.readdir as jest.MockedFunction<typeof fs.readdir>;
    mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;
    mockRm = fs.rm as jest.MockedFunction<typeof fs.rm>;

    mockMkdir.mockResolvedValue(undefined);
    mockReaddir.mockResolvedValue([]);
    mockReadFile.mockResolvedValue(Buffer.from('test content'));
    mockRm.mockResolvedValue(undefined);

    worker = new TranscodingWorker(
      mockTranscodingService,
      mockTranscodingJobRepository,
      mockHlsVariantRepository,
      mockMediaRepository,
      mockStoragePort
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockJob = (
    mediaId: string,
    mediaType: 'VIDEO' | 'AUDIO',
    qualities?: StreamQuality[]
  ): Job =>
    ({
      id: 'job-1',
      data: {
        mediaId,
        mediaType,
        qualities,
      },
      updateProgress: jest.fn(),
      name: 'transcoding',
      queueName: 'transcoding-queue',
    }) as any;

  const createMockTranscodingJob = (mediaId: string): TranscodingJob => {
    return TranscodingJob.create(mediaId);
  };

  const createMockMedia = (id: string): Media => {
    return new Media({
      id: EntityId.from(id),
      filename: 'video.mp4',
      originalName: 'original-video.mp4',
      mimeType: 'video/mp4',
      type: MediaType.VIDEO,
      size: 10000000,
      bucket: 'finance4all-media',
      path: `uploads/${id}/video.mp4`,
      metadata: null,
      isTemporary: false,
      expiresAt: null,
    });
  };

  describe('process', () => {
    it('should process video transcoding job successfully', async () => {
      const mockBullJob = createMockJob(testMediaId, 'VIDEO');
      const transcodingJob = createMockTranscodingJob(testMediaId);
      const media = createMockMedia(testMediaId);

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(transcodingJob);
      mockMediaRepository.findById.mockResolvedValue(media);
      mockStoragePort.getPresignedUrl.mockResolvedValue('https://storage/presigned-url');
      mockTranscodingService.transcode.mockResolvedValue({
        mediaId: testMediaId,
        success: true,
        variants: [
          {
            quality: StreamQuality.Q720P,
            playlistPath: `${testMediaId}/q720p/playlist.m3u8`,
            segmentPrefix: `${testMediaId}/q720p/segment`,
            segmentCount: 10,
          },
        ],
      });
      mockHlsVariantRepository.saveMany.mockResolvedValue([]);
      mockTranscodingJobRepository.update.mockResolvedValue(transcodingJob);
      mockStoragePort.ensureBucket.mockResolvedValue();

      await worker.process(mockBullJob);

      expect(mockTranscodingJobRepository.findByMediaId).toHaveBeenCalledWith(testMediaId);
      expect(mockMediaRepository.findById).toHaveBeenCalledWith(testMediaId);
      expect(mockStoragePort.getPresignedUrl).toHaveBeenCalled();
      expect(mockTranscodingService.transcode).toHaveBeenCalled();
      expect(mockHlsVariantRepository.saveMany).toHaveBeenCalled();
      expect(mockTranscodingJobRepository.update).toHaveBeenCalled();
    });

    it('should process audio transcoding job successfully', async () => {
      const mockBullJob = createMockJob(testMediaId, 'AUDIO');
      const transcodingJob = createMockTranscodingJob(testMediaId);
      const media = new Media({
        id: EntityId.from(testMediaId),
        filename: 'audio.mp3',
        originalName: 'original-audio.mp3',
        mimeType: 'audio/mpeg',
        type: MediaType.AUDIO,
        size: 5000000,
        bucket: 'finance4all-media',
        path: `uploads/${testMediaId}/audio.mp3`,
        metadata: null,
        isTemporary: false,
        expiresAt: null,
      });

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(transcodingJob);
      mockMediaRepository.findById.mockResolvedValue(media);
      mockStoragePort.getPresignedUrl.mockResolvedValue('https://storage/presigned-url');
      mockTranscodingService.transcode.mockResolvedValue({
        mediaId: testMediaId,
        success: true,
        variants: [
          {
            quality: StreamQuality.AUDIO_MEDIUM,
            playlistPath: `${testMediaId}/audio_medium/playlist.m3u8`,
            segmentPrefix: `${testMediaId}/audio_medium/segment`,
            segmentCount: 5,
          },
        ],
      });
      mockHlsVariantRepository.saveMany.mockResolvedValue([]);
      mockTranscodingJobRepository.update.mockResolvedValue(transcodingJob);
      mockStoragePort.ensureBucket.mockResolvedValue();

      await worker.process(mockBullJob);

      expect(mockTranscodingService.transcode).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaType: 'AUDIO',
        }),
        expect.any(Function)
      );
    });

    it('should throw error when transcoding job not found', async () => {
      const mockBullJob = createMockJob(testMediaId, 'VIDEO');

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(null);

      await expect(worker.process(mockBullJob)).rejects.toThrow(
        `Transcoding job not found for media ${testMediaId}`
      );
    });

    it('should throw error when media not found', async () => {
      const mockBullJob = createMockJob(testMediaId, 'VIDEO');
      const transcodingJob = createMockTranscodingJob(testMediaId);

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(transcodingJob);
      mockMediaRepository.findById.mockResolvedValue(null);

      await expect(worker.process(mockBullJob)).rejects.toThrow(`Media not found: ${testMediaId}`);
    });

    it('should handle transcoding failure', async () => {
      const mockBullJob = createMockJob(testMediaId, 'VIDEO');
      const transcodingJob = createMockTranscodingJob(testMediaId);
      const media = createMockMedia(testMediaId);

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(transcodingJob);
      mockMediaRepository.findById.mockResolvedValue(media);
      mockStoragePort.getPresignedUrl.mockResolvedValue('https://storage/presigned-url');
      mockTranscodingService.transcode.mockResolvedValue({
        mediaId: testMediaId,
        success: false,
        variants: [],
        error: 'FFmpeg error',
      });
      mockTranscodingJobRepository.update.mockResolvedValue(transcodingJob);
      mockStoragePort.ensureBucket.mockResolvedValue();

      await expect(worker.process(mockBullJob)).rejects.toThrow('FFmpeg error');

      expect(mockTranscodingJobRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          _status: TranscodingStatus.FAILED,
        })
      );
    });

    it('should update job progress during transcoding', async () => {
      const mockBullJob = createMockJob(testMediaId, 'VIDEO');
      const transcodingJob = createMockTranscodingJob(testMediaId);
      const media = createMockMedia(testMediaId);

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(transcodingJob);
      mockMediaRepository.findById.mockResolvedValue(media);
      mockStoragePort.getPresignedUrl.mockResolvedValue('https://storage/presigned-url');

      mockTranscodingService.transcode.mockImplementation(async (input, onProgress) => {
        if (onProgress) {
          await onProgress({
            mediaId: testMediaId,
            progress: 50,
            currentQuality: StreamQuality.Q720P,
          });
        }
        return {
          mediaId: testMediaId,
          success: true,
          variants: [],
        };
      });
      mockHlsVariantRepository.saveMany.mockResolvedValue([]);
      mockTranscodingJobRepository.update.mockResolvedValue(transcodingJob);
      mockStoragePort.ensureBucket.mockResolvedValue();

      await worker.process(mockBullJob);

      expect(mockBullJob.updateProgress).toHaveBeenCalled();
    });

    it('should process with custom qualities', async () => {
      const customQualities = [StreamQuality.Q360P, StreamQuality.Q720P];
      const mockBullJob = createMockJob(testMediaId, 'VIDEO', customQualities);
      const transcodingJob = createMockTranscodingJob(testMediaId);
      const media = createMockMedia(testMediaId);

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(transcodingJob);
      mockMediaRepository.findById.mockResolvedValue(media);
      mockStoragePort.getPresignedUrl.mockResolvedValue('https://storage/presigned-url');
      mockTranscodingService.transcode.mockResolvedValue({
        mediaId: testMediaId,
        success: true,
        variants: [
          {
            quality: StreamQuality.Q360P,
            playlistPath: `${testMediaId}/q360p/playlist.m3u8`,
            segmentPrefix: `${testMediaId}/q360p/segment`,
            segmentCount: 10,
          },
          {
            quality: StreamQuality.Q720P,
            playlistPath: `${testMediaId}/q720p/playlist.m3u8`,
            segmentPrefix: `${testMediaId}/q720p/segment`,
            segmentCount: 10,
          },
        ],
      });
      mockHlsVariantRepository.saveMany.mockResolvedValue([]);
      mockTranscodingJobRepository.update.mockResolvedValue(transcodingJob);
      mockStoragePort.ensureBucket.mockResolvedValue();

      await worker.process(mockBullJob);

      expect(mockTranscodingService.transcode).toHaveBeenCalledWith(
        expect.objectContaining({
          qualities: expect.arrayContaining([
            expect.objectContaining({ quality: StreamQuality.Q360P }),
            expect.objectContaining({ quality: StreamQuality.Q720P }),
          ]),
        }),
        expect.any(Function)
      );
    });

    it('should upload HLS files to storage', async () => {
      const mockBullJob = createMockJob(testMediaId, 'VIDEO');
      const transcodingJob = createMockTranscodingJob(testMediaId);
      const media = createMockMedia(testMediaId);

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(transcodingJob);
      mockMediaRepository.findById.mockResolvedValue(media);
      mockStoragePort.getPresignedUrl.mockResolvedValue('https://storage/presigned-url');

      // Mock directory structure
      mockReaddir.mockImplementation(async (dir: any) => {
        const dirStr = dir.toString();
        if (dirStr.includes('q720p')) {
          return [
            { name: 'playlist.m3u8', isDirectory: () => false },
            { name: 'segment000.ts', isDirectory: () => false },
          ] as any;
        }
        return [{ name: 'q720p', isDirectory: () => true }] as any;
      });

      mockTranscodingService.transcode.mockResolvedValue({
        mediaId: testMediaId,
        success: true,
        variants: [
          {
            quality: StreamQuality.Q720P,
            playlistPath: `${testMediaId}/q720p/playlist.m3u8`,
            segmentPrefix: `${testMediaId}/q720p/segment`,
            segmentCount: 1,
          },
        ],
      });
      mockHlsVariantRepository.saveMany.mockResolvedValue([]);
      mockTranscodingJobRepository.update.mockResolvedValue(transcodingJob);
      mockStoragePort.ensureBucket.mockResolvedValue();

      await worker.process(mockBullJob);

      expect(mockStoragePort.ensureBucket).toHaveBeenCalledWith('finance4all-hls');
      expect(mockStoragePort.upload).toHaveBeenCalled();
    });

    it('should clean up temp directory after processing', async () => {
      const mockBullJob = createMockJob(testMediaId, 'VIDEO');
      const transcodingJob = createMockTranscodingJob(testMediaId);
      const media = createMockMedia(testMediaId);

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(transcodingJob);
      mockMediaRepository.findById.mockResolvedValue(media);
      mockStoragePort.getPresignedUrl.mockResolvedValue('https://storage/presigned-url');
      mockTranscodingService.transcode.mockResolvedValue({
        mediaId: testMediaId,
        success: true,
        variants: [],
      });
      mockHlsVariantRepository.saveMany.mockResolvedValue([]);
      mockTranscodingJobRepository.update.mockResolvedValue(transcodingJob);
      mockStoragePort.ensureBucket.mockResolvedValue();

      await worker.process(mockBullJob);

      expect(mockRm).toHaveBeenCalledWith(expect.stringContaining(testMediaId), {
        recursive: true,
        force: true,
      });
    });

    it('should mark job as failed on error', async () => {
      const mockBullJob = createMockJob(testMediaId, 'VIDEO');
      const transcodingJob = createMockTranscodingJob(testMediaId);
      const media = createMockMedia(testMediaId);

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(transcodingJob);
      mockMediaRepository.findById.mockResolvedValue(media);
      mockStoragePort.getPresignedUrl.mockRejectedValue(new Error('Storage error'));
      mockTranscodingJobRepository.update.mockResolvedValue(transcodingJob);

      await expect(worker.process(mockBullJob)).rejects.toThrow('Storage error');

      // The job should be marked as failed
      expect(mockTranscodingJobRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          _status: TranscodingStatus.FAILED,
          _errorMessage: 'Storage error',
        })
      );
    });

    it('should use default video qualities when none specified', async () => {
      const mockBullJob = createMockJob(testMediaId, 'VIDEO');
      const transcodingJob = createMockTranscodingJob(testMediaId);
      const media = createMockMedia(testMediaId);

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(transcodingJob);
      mockMediaRepository.findById.mockResolvedValue(media);
      mockStoragePort.getPresignedUrl.mockResolvedValue('https://storage/presigned-url');
      mockTranscodingService.transcode.mockResolvedValue({
        mediaId: testMediaId,
        success: true,
        variants: [],
      });
      mockHlsVariantRepository.saveMany.mockResolvedValue([]);
      mockTranscodingJobRepository.update.mockResolvedValue(transcodingJob);
      mockStoragePort.ensureBucket.mockResolvedValue();

      await worker.process(mockBullJob);

      expect(mockTranscodingService.transcode).toHaveBeenCalledWith(
        expect.objectContaining({
          qualities: expect.arrayContaining([
            expect.objectContaining({ quality: StreamQuality.Q360P }),
            expect.objectContaining({ quality: StreamQuality.Q480P }),
            expect.objectContaining({ quality: StreamQuality.Q720P }),
          ]),
        }),
        expect.any(Function)
      );
    });

    it('should use default audio qualities when none specified', async () => {
      const mockBullJob = createMockJob(testMediaId, 'AUDIO');
      const transcodingJob = createMockTranscodingJob(testMediaId);
      const media = createMockMedia(testMediaId);

      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(transcodingJob);
      mockMediaRepository.findById.mockResolvedValue(media);
      mockStoragePort.getPresignedUrl.mockResolvedValue('https://storage/presigned-url');
      mockTranscodingService.transcode.mockResolvedValue({
        mediaId: testMediaId,
        success: true,
        variants: [],
      });
      mockHlsVariantRepository.saveMany.mockResolvedValue([]);
      mockTranscodingJobRepository.update.mockResolvedValue(transcodingJob);
      mockStoragePort.ensureBucket.mockResolvedValue();

      await worker.process(mockBullJob);

      expect(mockTranscodingService.transcode).toHaveBeenCalledWith(
        expect.objectContaining({
          qualities: expect.arrayContaining([
            expect.objectContaining({ quality: StreamQuality.AUDIO_LOW }),
            expect.objectContaining({ quality: StreamQuality.AUDIO_MEDIUM }),
            expect.objectContaining({ quality: StreamQuality.AUDIO_HIGH }),
          ]),
        }),
        expect.any(Function)
      );
    });
  });
});
