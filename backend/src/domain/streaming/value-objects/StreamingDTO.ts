import type { StreamQuality } from './StreamQuality';
import type { TranscodingStatus } from './TranscodingStatus';

export interface HlsVariantDTO {
  id: string;
  mediaId: string;
  quality: StreamQuality;
  bandwidth: number;
  resolution: string | null;
  codecs: string;
  playlistUrl: string;
}

export interface TranscodingJobDTO {
  id: string;
  mediaId: string;
  status: TranscodingStatus;
  progress: number;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface MediaProgressDTO {
  id: string;
  userId: string;
  mediaId: string;
  currentPosition: number;
  duration: number;
  completionRate: number;
  isCompleted: boolean;
  lastWatchedAt: Date;
}

export interface StreamManifestDTO {
  masterPlaylistUrl: string;
  variants: HlsVariantDTO[];
  transcodingStatus: TranscodingStatus;
}

export interface StreamTokenDTO {
  token: string;
  expiresAt: Date;
}

export interface UpdateProgressCommand {
  userId: string;
  mediaId: string;
  currentPosition: number;
  duration: number;
}

export interface StartTranscodingCommand {
  mediaId: string;
  qualities?: StreamQuality[];
}

export interface GetStreamManifestQuery {
  mediaId: string;
  userId: string;
}

export interface GetProgressQuery {
  userId: string;
  mediaId: string;
}

export interface GenerateStreamTokenCommand {
  userId: string;
  mediaId: string;
  expiresInSeconds?: number;
}
