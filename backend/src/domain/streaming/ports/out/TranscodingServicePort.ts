import type { StreamQuality, QualityPreset } from '../../value-objects/StreamQuality';

export interface TranscodingInput {
  inputPath: string;
  outputDir: string;
  mediaId: string;
  mediaType: 'VIDEO' | 'AUDIO';
  qualities: QualityPreset[];
}

export interface TranscodingProgress {
  mediaId: string;
  progress: number;
  currentQuality: StreamQuality | null;
}

export interface TranscodingResult {
  mediaId: string;
  success: boolean;
  variants: {
    quality: StreamQuality;
    playlistPath: string;
    segmentPrefix: string;
    segmentCount: number;
  }[];
  error?: string;
}

export interface MediaProbeResult {
  duration: number;
  hasVideo: boolean;
  hasAudio: boolean;
  width?: number;
  height?: number;
}

export interface TranscodingServicePort {
  transcode(
    input: TranscodingInput,
    onProgress?: (progress: TranscodingProgress) => void
  ): Promise<TranscodingResult>;

  probe(inputPath: string): Promise<MediaProbeResult>;

  cancelJob(mediaId: string): Promise<void>;
}
