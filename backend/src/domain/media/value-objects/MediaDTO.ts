import type { MediaType } from './MediaType';

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
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaDTO {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  bucket: string;
  path: string;
  metadata?: Record<string, string>;
}

export interface MediaUploadResultDTO {
  media: MediaDTO;
  uploadUrl?: string;
}
