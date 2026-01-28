import type { Readable } from 'stream';

export interface UploadOptions {
  bucket: string;
  filename: string;
  mimeType: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  bucket: string;
  path: string;
  etag: string;
}

export interface PresignedUrlOptions {
  bucket: string;
  path: string;
  expiresIn?: number; // seconds
}

export interface StoragePort {
  /**
   * Upload a file to storage
   */
  upload(file: Buffer | Readable, options: UploadOptions): Promise<UploadResult>;

  /**
   * Delete a file from storage
   */
  delete(bucket: string, path: string): Promise<void>;

  /**
   * Check if a file exists in storage
   */
  exists(bucket: string, path: string): Promise<boolean>;

  /**
   * Get a presigned URL for downloading a file
   */
  getPresignedUrl(options: PresignedUrlOptions): Promise<string>;

  /**
   * Get the public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string;

  /**
   * Ensure a bucket exists, create if not
   */
  ensureBucket(bucket: string): Promise<void>;
}
