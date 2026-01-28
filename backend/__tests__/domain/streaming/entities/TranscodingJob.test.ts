import { TranscodingJob } from '@/domain/streaming/entities/TranscodingJob';
import { TranscodingStatus } from '@/domain/streaming/value-objects/TranscodingStatus';

describe('TranscodingJob', () => {
  const mediaId = 'media-123';

  describe('create', () => {
    it('should create a new transcoding job with PENDING status', () => {
      const job = TranscodingJob.create(mediaId);

      expect(job).toBeDefined();
      expect(job.mediaId).toBe(mediaId);
      expect(job.status).toBe(TranscodingStatus.PENDING);
      expect(job.progress).toBe(0);
      expect(job.errorMessage).toBeNull();
      expect(job.startedAt).toBeNull();
      expect(job.completedAt).toBeNull();
    });

    it('should generate a unique ID for the job', () => {
      const job1 = TranscodingJob.create(mediaId);
      const job2 = TranscodingJob.create(mediaId);

      expect(job1.id).not.toBe(job2.id);
    });
  });

  describe('fromPersistence', () => {
    it('should restore a transcoding job from persisted data', () => {
      const persistedData = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        mediaId: 'media-456',
        status: TranscodingStatus.PROCESSING,
        progress: 50,
        errorMessage: null,
        startedAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: null,
        createdAt: new Date('2024-01-01T09:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      const job = TranscodingJob.fromPersistence(persistedData);

      expect(job.id.getValue()).toBe(persistedData.id);
      expect(job.mediaId).toBe(persistedData.mediaId);
      expect(job.status).toBe(persistedData.status);
      expect(job.progress).toBe(persistedData.progress);
      expect(job.errorMessage).toBeNull();
      expect(job.startedAt).toEqual(persistedData.startedAt);
      expect(job.completedAt).toBeNull();
    });

    it('should restore a failed job with error message', () => {
      const persistedData = {
        id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        mediaId: 'media-456',
        status: TranscodingStatus.FAILED,
        progress: 25,
        errorMessage: 'Transcoding failed due to unsupported codec',
        startedAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: new Date('2024-01-01T10:30:00Z'),
        createdAt: new Date('2024-01-01T09:00:00Z'),
        updatedAt: new Date('2024-01-01T10:30:00Z'),
      };

      const job = TranscodingJob.fromPersistence(persistedData);

      expect(job.status).toBe(TranscodingStatus.FAILED);
      expect(job.errorMessage).toBe(persistedData.errorMessage);
      expect(job.completedAt).toEqual(persistedData.completedAt);
    });
  });

  describe('start', () => {
    it('should transition job from PENDING to PROCESSING', () => {
      const job = TranscodingJob.create(mediaId);

      job.start();

      expect(job.status).toBe(TranscodingStatus.PROCESSING);
      expect(job.startedAt).toBeInstanceOf(Date);
    });

    it('should throw error when starting a non-pending job', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();

      expect(() => job.start()).toThrow('Can only start a pending job');
    });

    it('should throw error when starting a completed job', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();
      job.complete();

      expect(() => job.start()).toThrow('Can only start a pending job');
    });

    it('should throw error when starting a failed job', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();
      job.fail('Some error');

      expect(() => job.start()).toThrow('Can only start a pending job');
    });
  });

  describe('updateProgress', () => {
    it('should update progress for a processing job', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();

      job.updateProgress(50);

      expect(job.progress).toBe(50);
    });

    it('should cap progress at 100', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();

      job.updateProgress(150);

      expect(job.progress).toBe(100);
    });

    it('should not allow negative progress', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();

      job.updateProgress(-10);

      expect(job.progress).toBe(0);
    });

    it('should throw error when updating progress of a non-processing job', () => {
      const job = TranscodingJob.create(mediaId);

      expect(() => job.updateProgress(50)).toThrow('Can only update progress of a processing job');
    });

    it('should throw error when updating progress of a completed job', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();
      job.complete();

      expect(() => job.updateProgress(50)).toThrow('Can only update progress of a processing job');
    });
  });

  describe('complete', () => {
    it('should mark job as completed with 100% progress', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();

      job.complete();

      expect(job.status).toBe(TranscodingStatus.COMPLETED);
      expect(job.progress).toBe(100);
      expect(job.completedAt).toBeInstanceOf(Date);
    });

    it('should set completedAt timestamp', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();
      const beforeComplete = new Date();

      job.complete();

      expect(job.completedAt).toBeInstanceOf(Date);
      if (job.completedAt) {
        expect(job.completedAt.getTime()).toBeGreaterThanOrEqual(beforeComplete.getTime());
      }
    });
  });

  describe('fail', () => {
    it('should mark job as failed with error message', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();
      const errorMessage = 'Transcoding failed: codec not supported';

      job.fail(errorMessage);

      expect(job.status).toBe(TranscodingStatus.FAILED);
      expect(job.errorMessage).toBe(errorMessage);
      expect(job.completedAt).toBeInstanceOf(Date);
    });

    it('should preserve progress when failing', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();
      job.updateProgress(45);

      job.fail('Error occurred');

      expect(job.progress).toBe(45);
    });
  });

  describe('toDTO', () => {
    it('should convert job to DTO with all properties', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();
      job.updateProgress(75);

      const dto = job.toDTO();

      expect(dto).toMatchObject({
        mediaId,
        status: TranscodingStatus.PROCESSING,
        progress: 75,
        errorMessage: null,
      });
      expect(dto.id).toBeDefined();
      expect(dto.startedAt).toBeInstanceOf(Date);
      expect(dto.completedAt).toBeNull();
      expect(dto.createdAt).toBeInstanceOf(Date);
    });

    it('should convert failed job to DTO with error message', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();
      job.fail('Test error');

      const dto = job.toDTO();

      expect(dto.status).toBe(TranscodingStatus.FAILED);
      expect(dto.errorMessage).toBe('Test error');
      expect(dto.completedAt).toBeInstanceOf(Date);
    });

    it('should convert completed job to DTO', () => {
      const job = TranscodingJob.create(mediaId);
      job.start();
      job.complete();

      const dto = job.toDTO();

      expect(dto.status).toBe(TranscodingStatus.COMPLETED);
      expect(dto.progress).toBe(100);
      expect(dto.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('getters', () => {
    it('should return correct mediaId', () => {
      const job = TranscodingJob.create(mediaId);
      expect(job.mediaId).toBe(mediaId);
    });

    it('should return correct status', () => {
      const job = TranscodingJob.create(mediaId);
      expect(job.status).toBe(TranscodingStatus.PENDING);
    });

    it('should return correct progress', () => {
      const job = TranscodingJob.create(mediaId);
      expect(job.progress).toBe(0);
    });

    it('should return correct errorMessage', () => {
      const job = TranscodingJob.create(mediaId);
      expect(job.errorMessage).toBeNull();
    });

    it('should return correct startedAt', () => {
      const job = TranscodingJob.create(mediaId);
      expect(job.startedAt).toBeNull();
    });

    it('should return correct completedAt', () => {
      const job = TranscodingJob.create(mediaId);
      expect(job.completedAt).toBeNull();
    });
  });

  describe('constructor with props', () => {
    it('should correctly set createdAt from props', () => {
      const createdAt = new Date('2024-01-01T00:00:00Z');
      const job = TranscodingJob.fromPersistence({
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        mediaId,
        status: TranscodingStatus.PENDING,
        progress: 0,
        errorMessage: null,
        startedAt: null,
        completedAt: null,
        createdAt,
        updatedAt: new Date(),
      });

      expect(job.createdAt).toEqual(createdAt);
    });

    it('should correctly set updatedAt from props', () => {
      const updatedAt = new Date('2024-01-01T12:00:00Z');
      const job = TranscodingJob.fromPersistence({
        id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        mediaId,
        status: TranscodingStatus.PENDING,
        progress: 0,
        errorMessage: null,
        startedAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt,
      });

      expect(job.updatedAt).toEqual(updatedAt);
    });
  });
});
