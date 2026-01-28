import { GetTranscodingStatusUseCaseImpl } from '@/application/streaming/use-cases/GetTranscodingStatusUseCaseImpl';
import type { TranscodingJobRepository } from '@/domain/streaming/ports/out/TranscodingJobRepository';
import { TranscodingJob } from '@/domain/streaming/entities/TranscodingJob';
import { TranscodingStatus } from '@/domain/streaming/value-objects/TranscodingStatus';
import { TranscodingNotFoundError } from '@/domain/streaming/errors/StreamingErrors';

describe('GetTranscodingStatusUseCaseImpl', () => {
  let useCase: GetTranscodingStatusUseCaseImpl;
  let mockTranscodingJobRepository: jest.Mocked<TranscodingJobRepository>;

  beforeEach(() => {
    mockTranscodingJobRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByMediaId: jest.fn(),
      findByStatus: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetTranscodingStatusUseCaseImpl(mockTranscodingJobRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mediaId = 'media-123';

    it('should return transcoding status when job exists', async () => {
      const mockJob = TranscodingJob.create(mediaId);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);

      const result = await useCase.execute(mediaId);

      expect(result).toMatchObject({
        mediaId,
        status: TranscodingStatus.PENDING,
        progress: 0,
        errorMessage: null,
      });
    });

    it('should throw TranscodingNotFoundError when job does not exist', async () => {
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(null);

      await expect(useCase.execute(mediaId)).rejects.toThrow(TranscodingNotFoundError);
      await expect(useCase.execute(mediaId)).rejects.toThrow(
        `No transcoding job found for media '${mediaId}'`
      );
    });

    it('should return processing job status with progress', async () => {
      const mockJob = TranscodingJob.create(mediaId);
      mockJob.start();
      mockJob.updateProgress(50);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);

      const result = await useCase.execute(mediaId);

      expect(result.status).toBe(TranscodingStatus.PROCESSING);
      expect(result.progress).toBe(50);
      expect(result.startedAt).toBeInstanceOf(Date);
    });

    it('should return completed job status', async () => {
      const mockJob = TranscodingJob.create(mediaId);
      mockJob.start();
      mockJob.complete();
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);

      const result = await useCase.execute(mediaId);

      expect(result.status).toBe(TranscodingStatus.COMPLETED);
      expect(result.progress).toBe(100);
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should return failed job status with error message', async () => {
      const errorMessage = 'Transcoding failed: codec not supported';
      const mockJob = TranscodingJob.create(mediaId);
      mockJob.start();
      mockJob.fail(errorMessage);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);

      const result = await useCase.execute(mediaId);

      expect(result.status).toBe(TranscodingStatus.FAILED);
      expect(result.errorMessage).toBe(errorMessage);
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should query repository with correct mediaId', async () => {
      const mockJob = TranscodingJob.create(mediaId);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);

      await useCase.execute(mediaId);

      expect(mockTranscodingJobRepository.findByMediaId).toHaveBeenCalledWith(mediaId);
    });

    it('should handle repository errors', async () => {
      mockTranscodingJobRepository.findByMediaId.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(mediaId)).rejects.toThrow('Database error');
    });

    it('should return correct DTO structure', async () => {
      const mockJob = TranscodingJob.create(mediaId);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);

      const result = await useCase.execute(mediaId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('mediaId');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('progress');
      expect(result).toHaveProperty('errorMessage');
      expect(result).toHaveProperty('startedAt');
      expect(result).toHaveProperty('completedAt');
      expect(result).toHaveProperty('createdAt');
    });

    it('should return pending job with null timestamps', async () => {
      const mockJob = TranscodingJob.create(mediaId);
      mockTranscodingJobRepository.findByMediaId.mockResolvedValue(mockJob);

      const result = await useCase.execute(mediaId);

      expect(result.startedAt).toBeNull();
      expect(result.completedAt).toBeNull();
    });
  });
});
