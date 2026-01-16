import type { TranscodingJob } from '../../entities/TranscodingJob';
import type { TranscodingStatus } from '../../value-objects/TranscodingStatus';

export interface TranscodingJobRepository {
  save(job: TranscodingJob): Promise<TranscodingJob>;
  update(job: TranscodingJob): Promise<TranscodingJob>;
  findById(id: string): Promise<TranscodingJob | null>;
  findByMediaId(mediaId: string): Promise<TranscodingJob | null>;
  findByStatus(status: TranscodingStatus): Promise<TranscodingJob[]>;
  delete(id: string): Promise<void>;
}
