export enum MediaType {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
}

export const ALLOWED_MIME_TYPES: Record<MediaType, string[]> = {
  [MediaType.VIDEO]: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
  [MediaType.PDF]: ['application/pdf'],
  [MediaType.AUDIO]: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
  ],
  [MediaType.IMAGE]: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    'image/jpg',
  ],
};

export const MAX_FILE_SIZES: Record<MediaType, number> = {
  [MediaType.VIDEO]: 500 * 1024 * 1024, // 500MB
  [MediaType.PDF]: 50 * 1024 * 1024, // 50MB
  [MediaType.AUDIO]: 100 * 1024 * 1024, // 100MB
  [MediaType.IMAGE]: 5 * 1024 * 1024, // 5MB
};

export function getMediaTypeFromMimeType(mimeType: string): MediaType | null {
  for (const [type, mimeTypes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimeTypes.includes(mimeType)) {
      return type as MediaType;
    }
  }
  return null;
}

export function isValidMimeType(mimeType: string): boolean {
  return getMediaTypeFromMimeType(mimeType) !== null;
}
