import type { Job } from 'bullmq';
import type { JobData } from '@/domain/streaming/ports/out/JobQueuePort';
import type { TranscodingServicePort } from '@/domain/streaming/ports/out/TranscodingServicePort';
import type { TranscodingJobRepository } from '@/domain/streaming/ports/out/TranscodingJobRepository';
import type { HlsVariantRepository } from '@/domain/streaming/ports/out/HlsVariantRepository';
import type { MediaRepository } from '@/domain/media/ports/out/MediaRepository';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import { HlsVariant } from '@/domain/streaming/entities/HlsVariant';
import {
  VIDEO_QUALITY_PRESETS,
  AUDIO_QUALITY_PRESETS,
  StreamQuality,
} from '@/domain/streaming/value-objects/StreamQuality';
import type { TranscodingJobProcessor } from '../services/BullMQJobQueue';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

export class TranscodingWorker implements TranscodingJobProcessor {
  private readonly tempDir: string;
  private readonly hlsBucket: string = 'finance4all-hls';

  constructor(
    private readonly transcodingService: TranscodingServicePort,
    private readonly transcodingJobRepository: TranscodingJobRepository,
    private readonly hlsVariantRepository: HlsVariantRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly storagePort: StoragePort
  ) {
    this.tempDir = path.join(os.tmpdir(), 'f4a-transcoding');
  }

  async process(job: Job<JobData>): Promise<void> {
    const { mediaId, mediaType } = job.data;

    console.log('Starting transcoding job', { mediaId, mediaType });

    const transcodingJob = await this.transcodingJobRepository.findByMediaId(mediaId);
    if (!transcodingJob) {
      throw new Error(`Transcoding job not found for media ${mediaId}`);
    }

    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new Error(`Media not found: ${mediaId}`);
    }

    try {
      transcodingJob.start();
      await this.transcodingJobRepository.update(transcodingJob);

      const sourceUrl = await this.storagePort.getPresignedUrl({
        bucket: media.bucket,
        path: media.path,
        expiresIn: 3600,
      });

      const outputDir = path.join(this.tempDir, mediaId);
      await fs.mkdir(outputDir, { recursive: true });

      const presets =
        mediaType === 'VIDEO'
          ? this.getVideoPresets(job.data.qualities as StreamQuality[] | undefined)
          : this.getAudioPresets(job.data.qualities as StreamQuality[] | undefined);

      const result = await this.transcodingService.transcode(
        {
          inputPath: sourceUrl,
          outputDir,
          mediaId,
          mediaType: mediaType as 'VIDEO' | 'AUDIO',
          qualities: presets,
        },
        async progress => {
          transcodingJob.updateProgress(progress.progress);
          await this.transcodingJobRepository.update(transcodingJob);
          await job.updateProgress(progress.progress);
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Transcoding failed');
      }

      await this.storagePort.ensureBucket(this.hlsBucket);
      await this.uploadHlsFiles(outputDir, mediaId);

      const hlsVariants = result.variants.map(v => {
        const preset = presets.find(p => p.quality === v.quality)!;
        return HlsVariant.create(
          mediaId,
          v.quality,
          preset.bandwidth,
          preset.resolution,
          preset.codecs,
          v.playlistPath,
          v.segmentPrefix,
          10.0
        );
      });

      for (let i = 0; i < hlsVariants.length; i++) {
        hlsVariants[i].updateSegmentCount(result.variants[i].segmentCount);
      }

      await this.hlsVariantRepository.saveMany(hlsVariants);

      transcodingJob.complete();
      await this.transcodingJobRepository.update(transcodingJob);

      await fs.rm(outputDir, { recursive: true, force: true });

      console.log('Transcoding completed', { mediaId, variantCount: hlsVariants.length });
    } catch (error) {
      transcodingJob.fail(error instanceof Error ? error.message : 'Unknown error');
      await this.transcodingJobRepository.update(transcodingJob);
      throw error;
    }
  }

  private getVideoPresets(requestedQualities?: StreamQuality[]) {
    const defaultQualities = [StreamQuality.Q360P, StreamQuality.Q480P, StreamQuality.Q720P];

    const qualities = requestedQualities?.length ? requestedQualities : defaultQualities;
    return qualities.filter(q => q in VIDEO_QUALITY_PRESETS).map(q => VIDEO_QUALITY_PRESETS[q]);
  }

  private getAudioPresets(requestedQualities?: StreamQuality[]) {
    const defaultQualities = [
      StreamQuality.AUDIO_LOW,
      StreamQuality.AUDIO_MEDIUM,
      StreamQuality.AUDIO_HIGH,
    ];

    const qualities = requestedQualities?.length ? requestedQualities : defaultQualities;
    return qualities.filter(q => q in AUDIO_QUALITY_PRESETS).map(q => AUDIO_QUALITY_PRESETS[q]);
  }

  private async uploadHlsFiles(localDir: string, mediaId: string): Promise<void> {
    const files = await this.getFilesRecursively(localDir);

    for (const file of files) {
      const relativePath = path.relative(localDir, file);
      const storagePath = `${mediaId}/${relativePath}`;
      const content = await fs.readFile(file);

      const mimeType = file.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T';

      await this.storagePort.upload(content, {
        bucket: this.hlsBucket,
        filename: storagePath,
        mimeType,
      });
    }
  }

  private async getFilesRecursively(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await this.getFilesRecursively(fullPath)));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }
}
