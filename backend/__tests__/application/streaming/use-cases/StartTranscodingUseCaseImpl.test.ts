import { StartTranscodingUseCaseImpl } from '@/application/streaming/use-cases/StartTranscodingUseCaseImpl';
import type { TranscodingJobRepository } from '@/domain/streaming/ports/out/TranscodingJobRepository';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { JobQueuePort } from '@/domain/streaming/ports/out/JobQueuePort';
import { TranscodingJob } from '@/domain/streaming/entities/TranscodingJob';
import { TranscodingStatus } from '@/domain/streaming/value-objects/TranscodingStatus';
import { MediaNotFoundError } from '@/domain/media/errors/MediaErrors';
import {
  TranscodingInProgressError,
  MediaNotStreamableError,
} from '@/domain/streaming/errors/StreamingErrors';
import { MediaType } from '@/domain/media/value-objects/MediaType';
import { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';

describe('StartTranscodingUseCaseImpl', () => {
  let useCase: StartTranscodingUseCaseImpl;
  let mockTranscodingJobRepository: jest.Mocked<TranscodingJobRepository>;
  let mockMediaRepository: jest.Mocked<MediaRepository>;
  let mockJobQueue: jest.Mocked<JobQueuePort>;

  beforeEach(() => {
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

    mockJobQueue = {
      addTranscodingJob: jest.fn(),
      getJobStatus: jest.fn(),
      removeJob: jest.fn(),
    };

    useCase = new StartTranscodingUseCaseImpl(
      mockTranscodingJobRepository,
      mockMediaRepository,
      mockJobQueue
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validCommand = {
      mediaId: 'media-123',
    };

    it('should start transcoding successfully for video media', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.VIDEO };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(null);
      mockTranscodingJobRepository.save.mockImplementation(async job => job);
      mockJobQueue.addTranscodingJob.mockResolvedValue('queue-job-id');

      const result = await useCase.execute(validCommand);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('mediaId', validCommand.mediaId);
      expect(result).toHaveProperty('status', TranscodingStatus.PENDING);
      expect(result).toHaveProperty('progress', 0);
    });

    it('should start transcoding successfully for audio media', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.AUDIO };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(null);
      mockTranscodingJobRepository.save.mockImplementation(async job => job);
      mockJobQueue.addTranscodingJob.mockResolvedValue('queue-job-id');

      const result = await useCase.execute(validCommand);

      expect(result.status).toBe(TranscodingStatus.PENDING);
    });

    it('should throw MediaNotFoundError when media does not exist', async () => {
      mockMediaRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validCommand)).rejects.toThrow(MediaNotFoundError);
      expect(mockTranscodingJobRepository.save).not.toHaveBeenCalled();
      expect(mockJobQueue.addTranscodingJob).not.toHaveBeenCalled();
    });

    it('should throw MediaNotStreamableError for PDF media', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.PDF };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);

      await expect(useCase.execute(validCommand)).rejects.toThrow(MediaNotStreamableError);
      await expect(useCase.execute(validCommand)).rejects.toThrow(
        `Type ${MediaType.PDF} is not streamable`
      );
    });

    it('should throw TranscodingInProgressError when transcoding is already in progress', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.VIDEO };
      const existingJob = TranscodingJob.create('media-123');
      existingJob.start();

      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(existingJob);

      await expect(useCase.execute(validCommand)).rejects.toThrow(TranscodingInProgressError);
      expect(mockTranscodingJobRepository.save).not.toHaveBeenCalled();
    });

    it('should allow starting new job when previous job is completed', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.VIDEO };
      const completedJob = TranscodingJob.create('media-123');
      completedJob.start();
      completedJob.complete();

      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(completedJob);
      mockTranscodingJobRepository.save.mockImplementation(async job => job);
      mockJobQueue.addTranscodingJob.mockResolvedValue('queue-job-id');

      const result = await useCase.execute(validCommand);

      expect(result.status).toBe(TranscodingStatus.PENDING);
    });

    it('should allow starting new job when previous job failed', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.VIDEO };
      const failedJob = TranscodingJob.create('media-123');
      failedJob.start();
      failedJob.fail('Previous error');

      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(failedJob);
      mockTranscodingJobRepository.save.mockImplementation(async job => job);
      mockJobQueue.addTranscodingJob.mockResolvedValue('queue-job-id');

      const result = await useCase.execute(validCommand);

      expect(result.status).toBe(TranscodingStatus.PENDING);
    });

    it('should save job to repository', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.VIDEO };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(null);
      mockTranscodingJobRepository.save.mockImplementation(async job => job);
      mockJobQueue.addTranscodingJob.mockResolvedValue('queue-job-id');

      await useCase.execute(validCommand);

      expect(mockTranscodingJobRepository.save).toHaveBeenCalledTimes(1);
      expect(mockTranscodingJobRepository.save).toHaveBeenCalledWith(expect.any(TranscodingJob));
    });

    it('should add job to queue with correct data', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.VIDEO };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(null);
      mockTranscodingJobRepository.save.mockImplementation(async job => job);
      mockJobQueue.addTranscodingJob.mockResolvedValue('queue-job-id');

      await useCase.execute(validCommand);

      expect(mockJobQueue.addTranscodingJob).toHaveBeenCalledWith({
        mediaId: validCommand.mediaId,
        qualities: [],
        mediaType: MediaType.VIDEO,
      });
    });

    it('should pass specified qualities to job queue', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.VIDEO };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(null);
      mockTranscodingJobRepository.save.mockImplementation(async job => job);
      mockJobQueue.addTranscodingJob.mockResolvedValue('queue-job-id');

      const commandWithQualities = {
        ...validCommand,
        qualities: [StreamQuality.Q720P, StreamQuality.Q1080P],
      };

      await useCase.execute(commandWithQualities);

      expect(mockJobQueue.addTranscodingJob).toHaveBeenCalledWith({
        mediaId: validCommand.mediaId,
        qualities: [StreamQuality.Q720P, StreamQuality.Q1080P],
        mediaType: MediaType.VIDEO,
      });
    });

    it('should handle repository save errors', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.VIDEO };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(null);
      mockTranscodingJobRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validCommand)).rejects.toThrow('Database error');
    });

    it('should handle job queue errors', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.VIDEO };
      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(null);
      mockTranscodingJobRepository.save.mockImplementation(async job => job);
      mockJobQueue.addTranscodingJob.mockRejectedValue(new Error('Queue error'));

      await expect(useCase.execute(validCommand)).rejects.toThrow('Queue error');
    });

    it('should allow starting job when previous job is pending', async () => {
      const mockMedia = { id: 'media-123', type: MediaType.VIDEO };
      const pendingJob = TranscodingJob.create('media-123');

      mockMediaRepository.findById.mockResolvedValue(mockMedia as any);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(pendingJob);
      mockTranscodingJobRepository.save.mockImplementation(async job => job);
      mockJobQueue.addTranscodingJob.mockResolvedValue('queue-job-id');

      const result = await useCase.execute(validCommand);

      expect(result.status).toBe(TranscodingStatus.PENDING);
    });
  });
});
