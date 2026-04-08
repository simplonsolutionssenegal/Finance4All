import IORedis from 'ioredis';
import { Queue, Worker, type Job } from 'bullmq';
import type { JobQueuePort, JobData, JobStatus } from '@/domain/streaming/ports/out/JobQueuePort';

export interface TranscodingJobProcessor {
  process(job: Job<JobData>): Promise<void>;
}

export interface BullMQConfig {
  host: string;
  port: number;
  password?: string;
}

export class BullMQJobQueue implements JobQueuePort {
  private queue: Queue<JobData>;
  private worker: Worker<JobData> | null = null;

  constructor(
    private readonly redisConnection: BullMQConfig,
    private readonly queueName: string = 'transcoding'
  ) {
    this.queue = new Queue(this.queueName, {
      connection: this.redisConnection,
    });
  }

  async addTranscodingJob(data: JobData): Promise<string> {
    const job = await this.queue.add('transcode', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    console.log('Transcoding job added to queue', {
      jobId: job.id,
      mediaId: data.mediaId,
    });

    return job.id!;
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      return { status: 'failed', error: 'Job not found' };
    }

    const state = await job.getState();
    return {
      status: state as 'waiting' | 'active' | 'completed' | 'failed',
      progress: job.progress as number | undefined,
      error: job.failedReason,
    };
  }

  async removeJob(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  startWorker(processor: TranscodingJobProcessor): void {
    this.worker = new Worker<JobData>(
      this.queueName,
      async job => {
        await processor.process(job);
      },
      {
        connection: this.redisConnection,
        concurrency: 2,
      }
    );

    this.worker.on('completed', job => {
      console.log('Transcoding job completed', { jobId: job.id, mediaId: job.data.mediaId });
    });

    this.worker.on('failed', (job, error) => {
      console.error('Transcoding job failed', {
        jobId: job?.id,
        mediaId: job?.data.mediaId,
        error: error.message,
      });
    });

    this.worker.on('progress', (job, progress) => {
      console.log('Transcoding job progress', {
        jobId: job.id,
        mediaId: job.data.mediaId,
        progress,
      });
    });
  }

  /**
   * Verify Redis connectivity by sending a PING command.
   * Throws if Redis is unreachable.
   */
  async ping(): Promise<void> {
    const redis = new IORedis({
      host: this.redisConnection.host,
      port: this.redisConnection.port,
      password: this.redisConnection.password,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
    });

    try {
      await redis.connect();
      const result = await redis.ping();
      if (result !== 'PONG') {
        throw new Error(`Unexpected Redis PING response: ${result}`);
      }
    } finally {
      await redis.quit().catch(() => {});
    }
  }

  async shutdown(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
    await this.queue.close();
  }
}
