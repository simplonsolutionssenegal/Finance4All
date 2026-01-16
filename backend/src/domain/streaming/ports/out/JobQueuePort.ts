export interface JobData {
  mediaId: string;
  mediaType?: 'VIDEO' | 'AUDIO';
  qualities?: string[];
  [key: string]: unknown;
}

export interface JobStatus {
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

export interface JobQueuePort {
  addTranscodingJob(data: JobData): Promise<string>;
  getJobStatus(jobId: string): Promise<JobStatus>;
  removeJob(jobId: string): Promise<void>;
}
