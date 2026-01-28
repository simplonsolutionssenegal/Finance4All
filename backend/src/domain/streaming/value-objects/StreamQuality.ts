export enum StreamQuality {
  Q360P = 'Q360P',
  Q480P = 'Q480P',
  Q720P = 'Q720P',
  Q1080P = 'Q1080P',
  AUDIO_LOW = 'AUDIO_LOW',
  AUDIO_MEDIUM = 'AUDIO_MEDIUM',
  AUDIO_HIGH = 'AUDIO_HIGH',
}

export interface QualityPreset {
  quality: StreamQuality;
  resolution: string | null;
  videoBitrate: number | null;
  audioBitrate: number;
  bandwidth: number;
  codecs: string;
}

export const VIDEO_QUALITY_PRESETS: Record<string, QualityPreset> = {
  [StreamQuality.Q360P]: {
    quality: StreamQuality.Q360P,
    resolution: '640x360',
    videoBitrate: 800,
    audioBitrate: 96,
    bandwidth: 896000,
    codecs: 'avc1.42001f,mp4a.40.2',
  },
  [StreamQuality.Q480P]: {
    quality: StreamQuality.Q480P,
    resolution: '854x480',
    videoBitrate: 1400,
    audioBitrate: 128,
    bandwidth: 1528000,
    codecs: 'avc1.4d001f,mp4a.40.2',
  },
  [StreamQuality.Q720P]: {
    quality: StreamQuality.Q720P,
    resolution: '1280x720',
    videoBitrate: 2800,
    audioBitrate: 128,
    bandwidth: 2928000,
    codecs: 'avc1.4d001f,mp4a.40.2',
  },
  [StreamQuality.Q1080P]: {
    quality: StreamQuality.Q1080P,
    resolution: '1920x1080',
    videoBitrate: 5000,
    audioBitrate: 192,
    bandwidth: 5192000,
    codecs: 'avc1.640028,mp4a.40.2',
  },
};

export const AUDIO_QUALITY_PRESETS: Record<string, QualityPreset> = {
  [StreamQuality.AUDIO_LOW]: {
    quality: StreamQuality.AUDIO_LOW,
    resolution: null,
    videoBitrate: null,
    audioBitrate: 64,
    bandwidth: 64000,
    codecs: 'mp4a.40.2',
  },
  [StreamQuality.AUDIO_MEDIUM]: {
    quality: StreamQuality.AUDIO_MEDIUM,
    resolution: null,
    videoBitrate: null,
    audioBitrate: 128,
    bandwidth: 128000,
    codecs: 'mp4a.40.2',
  },
  [StreamQuality.AUDIO_HIGH]: {
    quality: StreamQuality.AUDIO_HIGH,
    resolution: null,
    videoBitrate: null,
    audioBitrate: 256,
    bandwidth: 256000,
    codecs: 'mp4a.40.2',
  },
};

export function isVideoQuality(quality: StreamQuality): boolean {
  return quality in VIDEO_QUALITY_PRESETS;
}

export function isAudioQuality(quality: StreamQuality): boolean {
  return quality in AUDIO_QUALITY_PRESETS;
}

export function getQualityPreset(quality: StreamQuality): QualityPreset | null {
  return VIDEO_QUALITY_PRESETS[quality] || AUDIO_QUALITY_PRESETS[quality] || null;
}
