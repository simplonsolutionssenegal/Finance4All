import { Queue, Worker, type Job } from 'bullmq';
import {
  BullMQJobQueue,
  type TranscodingJobProcessor,
  type BullMQConfig,
} from '@/infrastructure/services/BullMQJobQueue';
import type { JobData } from '@/domain/streaming/ports/out/JobQueuePort';
import { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';

// Mock BullMQ
jest.mock('bullmq');

describe('BullMQJobQueue', () => {
  let bullMQJobQueue: BullMQJobQueue;
  let mockQueue: jest.Mocked<Queue<JobData>>;
  let mockWorker: jest.Mocked<Worker<JobData>>;
  let mockProcessor: jest.Mocked<TranscodingJobProcessor>;
  const redisConnection: BullMQConfig = {
    host: 'localhost',
    port: 6379,
  };
  const queueName = 'test-transcoding';

  beforeEach(() => {
    // Setup mock Queue
    mockQueue = {
      add: jest.fn(),
      getJob: jest.fn(),
      close: jest.fn(),
      on: jest.fn(),
    } as any;

    // Setup mock Worker
    mockWorker = {
      on: jest.fn().mockReturnThis(),
      close: jest.fn(),
    } as any;

    // Setup mock processor
    mockProcessor = {
      process: jest.fn(),
    };

    // Mock Queue constructor
    (Queue as jest.MockedClass<typeof Queue>).mockImplementation(() => mockQueue);

    // Mock Worker constructor
    (Worker as jest.MockedClass<typeof Worker>).mockImplementation(() => mockWorker as any);

    // Reset console mocks
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    bullMQJobQueue = new BullMQJobQueue(redisConnection, queueName);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a Queue instance with correct parameters', () => {
      expect(Queue).toHaveBeenCalledWith(queueName, {
        connection: redisConnection,
      });
    });
  });

  describe('addTranscodingJob', () => {
    it('should add a job to the queue and return job ID', async () => {
      const jobData: JobData = {
        mediaId: 'media-123',
        qualities: [StreamQuality.Q720P, StreamQuality.Q480P],
      };

      const mockJob = {
        id: 'job-123',
        data: jobData,
      } as unknown as Job<JobData>;

      mockQueue.add.mockResolvedValue(mockJob as any);

      const jobId = await bullMQJobQueue.addTranscodingJob(jobData);

      expect(mockQueue.add).toHaveBeenCalledWith('transcode', jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      });
      expect(jobId).toBe('job-123');
      expect(console.log).toHaveBeenCalledWith('Transcoding job added to queue', {
        jobId: 'job-123',
        mediaId: 'media-123',
      });
    });

    it('should handle multiple qualities', async () => {
      const jobData: JobData = {
        mediaId: 'media-456',
        qualities: [
          StreamQuality.Q1080P,
          StreamQuality.Q720P,
          StreamQuality.Q480P,
          StreamQuality.Q360P,
        ],
      };

      const mockJob = {
        id: 'job-456',
        data: jobData,
      } as unknown as Job<JobData>;

      mockQueue.add.mockResolvedValue(mockJob as any);

      const jobId = await bullMQJobQueue.addTranscodingJob(jobData);

      expect(jobId).toBe('job-456');
      expect(mockQueue.add).toHaveBeenCalledWith('transcode', jobData, expect.any(Object));
    });
  });

  describe('getJobStatus', () => {
    it('should return job status when job exists', async () => {
      const mockJob = {
        id: 'job-123',
        getState: jest.fn().mockResolvedValue('active'),
        progress: 50,
        failedReason: undefined,
      } as any;

      mockQueue.getJob.mockResolvedValue(mockJob);

      const status = await bullMQJobQueue.getJobStatus('job-123');

      expect(mockQueue.getJob).toHaveBeenCalledWith('job-123');
      expect(mockJob.getState).toHaveBeenCalled();
      expect(status).toEqual({
        status: 'active',
        progress: 50,
        error: undefined,
      });
    });

    it('should return waiting status', async () => {
      const mockJob = {
        id: 'job-123',
        getState: jest.fn().mockResolvedValue('waiting'),
        progress: undefined,
        failedReason: undefined,
      } as any;

      mockQueue.getJob.mockResolvedValue(mockJob);

      const status = await bullMQJobQueue.getJobStatus('job-123');

      expect(status).toEqual({
        status: 'waiting',
        progress: undefined,
        error: undefined,
      });
    });

    it('should return completed status with progress', async () => {
      const mockJob = {
        id: 'job-123',
        getState: jest.fn().mockResolvedValue('completed'),
        progress: 100,
        failedReason: undefined,
      } as any;

      mockQueue.getJob.mockResolvedValue(mockJob);

      const status = await bullMQJobQueue.getJobStatus('job-123');

      expect(status).toEqual({
        status: 'completed',
        progress: 100,
        error: undefined,
      });
    });

    it('should return failed status with error message', async () => {
      const mockJob = {
        id: 'job-123',
        getState: jest.fn().mockResolvedValue('failed'),
        progress: 25,
        failedReason: 'Transcoding error occurred',
      } as any;

      mockQueue.getJob.mockResolvedValue(mockJob);

      const status = await bullMQJobQueue.getJobStatus('job-123');

      expect(status).toEqual({
        status: 'failed',
        progress: 25,
        error: 'Transcoding error occurred',
      });
    });

    it('should return failed status when job not found', async () => {
      mockQueue.getJob.mockResolvedValue(null as any);

      const status = await bullMQJobQueue.getJobStatus('non-existent-job');

      expect(mockQueue.getJob).toHaveBeenCalledWith('non-existent-job');
      expect(status).toEqual({
        status: 'failed',
        error: 'Job not found',
      });
    });
  });

  describe('removeJob', () => {
    it('should remove job when it exists', async () => {
      const mockJob = {
        id: 'job-123',
        remove: jest.fn(),
      } as any;

      mockQueue.getJob.mockResolvedValue(mockJob);

      await bullMQJobQueue.removeJob('job-123');

      expect(mockQueue.getJob).toHaveBeenCalledWith('job-123');
      expect(mockJob.remove).toHaveBeenCalled();
    });

    it('should handle when job does not exist', async () => {
      mockQueue.getJob.mockResolvedValue(null as any);

      await expect(bullMQJobQueue.removeJob('non-existent-job')).resolves.not.toThrow();

      expect(mockQueue.getJob).toHaveBeenCalledWith('non-existent-job');
    });
  });

  describe('startWorker', () => {
    it('should create a worker with correct configuration', () => {
      bullMQJobQueue.startWorker(mockProcessor);

      expect(Worker).toHaveBeenCalledWith(
        queueName,
        expect.any(Function),
        expect.objectContaining({
          connection: redisConnection,
          concurrency: 2,
        })
      );
    });

    it('should register event listeners on worker', () => {
      bullMQJobQueue.startWorker(mockProcessor);

      expect(mockWorker.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(mockWorker.on).toHaveBeenCalledWith('failed', expect.any(Function));
      expect(mockWorker.on).toHaveBeenCalledWith('progress', expect.any(Function));
    });

    it('should process jobs through the processor', async () => {
      let workerProcessFn: ((job: Job<JobData>) => Promise<void>) | undefined;

      (Worker as jest.MockedClass<typeof Worker>).mockImplementation(((
        queueName: string,
        processFn: any
      ) => {
        workerProcessFn = processFn;
        return mockWorker;
      }) as any);

      bullMQJobQueue.startWorker(mockProcessor);

      const mockJob = {
        id: 'job-123',
        data: {
          mediaId: 'media-123',
          qualities: [StreamQuality.Q720P],
        },
      } as unknown as Job<JobData>;

      if (workerProcessFn) {
        await workerProcessFn(mockJob);
      }

      expect(mockProcessor.process).toHaveBeenCalledWith(mockJob);
    });

    it('should log on job completion', () => {
      let completedHandler: ((job: Job<JobData>) => void) | undefined;

      mockWorker.on.mockImplementation(((event: string, handler: any) => {
        if (event === 'completed') {
          completedHandler = handler;
        }
        return mockWorker;
      }) as any);

      bullMQJobQueue.startWorker(mockProcessor);

      const mockJob = {
        id: 'job-123',
        data: { mediaId: 'media-123', qualities: [] },
      } as unknown as Job<JobData>;

      if (completedHandler) {
        completedHandler(mockJob);
      }

      expect(console.log).toHaveBeenCalledWith('Transcoding job completed', {
        jobId: 'job-123',
        mediaId: 'media-123',
      });
    });

    it('should log on job failure', () => {
      let failedHandler: ((job: Job<JobData> | undefined, error: Error) => void) | undefined;

      mockWorker.on.mockImplementation(((event: string, handler: any) => {
        if (event === 'failed') {
          failedHandler = handler;
        }
        return mockWorker;
      }) as any);

      bullMQJobQueue.startWorker(mockProcessor);

      const mockJob = {
        id: 'job-123',
        data: { mediaId: 'media-123', qualities: [] },
      } as unknown as Job<JobData>;

      const error = new Error('Transcoding failed');

      if (failedHandler) {
        failedHandler(mockJob, error);
      }

      expect(console.error).toHaveBeenCalledWith('Transcoding job failed', {
        jobId: 'job-123',
        mediaId: 'media-123',
        error: 'Transcoding failed',
      });
    });

    it('should handle job failure with undefined job', () => {
      let failedHandler: ((job: Job<JobData> | undefined, error: Error) => void) | undefined;

      mockWorker.on.mockImplementation(((event: string, handler: any) => {
        if (event === 'failed') {
          failedHandler = handler;
        }
        return mockWorker;
      }) as any);

      bullMQJobQueue.startWorker(mockProcessor);

      const error = new Error('Unknown error');

      if (failedHandler) {
        failedHandler(undefined, error);
      }

      expect(console.error).toHaveBeenCalledWith('Transcoding job failed', {
        jobId: undefined,
        mediaId: undefined,
        error: 'Unknown error',
      });
    });

    it('should log on job progress', () => {
      let progressHandler: ((job: Job<JobData>, progress: number | object) => void) | undefined;

      mockWorker.on.mockImplementation(((event: string, handler: any) => {
        if (event === 'progress') {
          progressHandler = handler;
        }
        return mockWorker;
      }) as any);

      bullMQJobQueue.startWorker(mockProcessor);

      const mockJob = {
        id: 'job-123',
        data: { mediaId: 'media-123', qualities: [] },
      } as unknown as Job<JobData>;

      if (progressHandler) {
        progressHandler(mockJob, 75);
      }

      expect(console.log).toHaveBeenCalledWith('Transcoding job progress', {
        jobId: 'job-123',
        mediaId: 'media-123',
        progress: 75,
      });
    });
  });

  describe('shutdown', () => {
    it('should close worker and queue', async () => {
      bullMQJobQueue.startWorker(mockProcessor);

      await bullMQJobQueue.shutdown();

      expect(mockWorker.close).toHaveBeenCalled();
      expect(mockQueue.close).toHaveBeenCalled();
    });

    it('should only close queue if worker was not started', async () => {
      await bullMQJobQueue.shutdown();

      expect(mockQueue.close).toHaveBeenCalled();
      expect(mockWorker.close).not.toHaveBeenCalled();
    });
  });
});
