export type MediaType = 'VIDEO' | 'PDF' | 'AUDIO' | 'IMAGE';

export type StreamQuality =
  | 'Q360P'
  | 'Q480P'
  | 'Q720P'
  | 'Q1080P'
  | 'AUDIO_LOW'
  | 'AUDIO_MEDIUM'
  | 'AUDIO_HIGH';

export type TranscodingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface MediaDTO {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  type: MediaType;
  size: number;
  url: string;
  bucket: string;
  path: string;
  metadata: Record<string, string> | null;
  isTemporary: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HlsVariantDTO {
  id: string;
  mediaId: string;
  quality: StreamQuality;
  bandwidth: number;
  resolution: string | null;
  codecs: string;
  playlistUrl: string;
}

export interface StreamManifestDTO {
  masterPlaylistUrl: string;
  variants: HlsVariantDTO[];
  transcodingStatus: TranscodingStatus;
}

export interface MediaProgressDTO {
  id: string;
  userId: string;
  mediaId: string;
  currentPosition: number;
  duration: number;
  completionRate: number;
  isCompleted: boolean;
  lastWatchedAt: string;
}
