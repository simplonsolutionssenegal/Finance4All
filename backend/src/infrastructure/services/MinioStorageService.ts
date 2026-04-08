import { Client } from 'minio';
import type { Readable } from 'stream';
import type {
  StoragePort,
  UploadOptions,
  UploadResult,
  PresignedUrlOptions,
} from '@/domain/media/ports/out/StoragePort';
import { StorageError } from '@/domain/media/errors/MediaErrors';
import { logger } from '@/infrastructure/utils/logger';

export interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  publicUrl?: string;
}

/** All buckets the application needs, with their public-read setting. */
const REQUIRED_BUCKETS: { name: string; publicRead: boolean }[] = [
  { name: 'finance4all-media', publicRead: true },
  { name: 'finance4all-temp', publicRead: false },
  { name: 'finance4all-hls', publicRead: true },
];

export class MinioStorageService implements StoragePort {
  private readonly client: Client;
  private readonly publicUrl: string;

  constructor(config: MinioConfig) {
    this.client = new Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });

    this.publicUrl =
      config.publicUrl || `${config.useSSL ? 'https' : 'http'}://${config.endPoint}:${config.port}`;

    logger.info('MinIO storage service initialized', {
      endPoint: config.endPoint,
      port: config.port,
    });
  }

  async upload(file: Buffer | Readable, options: UploadOptions): Promise<UploadResult> {
    const { bucket, filename, mimeType, metadata } = options;

    try {
      const metaData: Record<string, string> = {
        'Content-Type': mimeType,
        ...metadata,
      };

      const result = await this.client.putObject(bucket, filename, file, undefined, metaData);

      logger.info('File uploaded to MinIO', {
        bucket,
        filename,
        etag: result.etag,
      });

      return {
        bucket,
        path: filename,
        etag: result.etag,
      };
    } catch (error) {
      logger.error('Failed to upload file to MinIO', {
        bucket,
        filename,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError(
        `Failed to upload file: ${filename}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async delete(bucket: string, path: string): Promise<void> {
    try {
      await this.client.removeObject(bucket, path);
      logger.info('File deleted from MinIO', { bucket, path });
    } catch (error) {
      logger.error('Failed to delete file from MinIO', {
        bucket,
        path,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError(
        `Failed to delete file: ${path}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async exists(bucket: string, path: string): Promise<boolean> {
    try {
      await this.client.statObject(bucket, path);
      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'NotFound'
      ) {
        return false;
      }
      throw new StorageError(
        `Failed to check file existence: ${path}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async getPresignedUrl(options: PresignedUrlOptions): Promise<string> {
    const { bucket, path, expiresIn = 3600 } = options;

    try {
      const url = await this.client.presignedGetObject(bucket, path, expiresIn);
      return url;
    } catch (error) {
      logger.error('Failed to generate presigned URL', {
        bucket,
        path,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError(
        `Failed to generate presigned URL for: ${path}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    return `${this.publicUrl}/${bucket}/${path}`;
  }

  async ensureBucket(bucket: string): Promise<void> {
    try {
      const exists = await this.client.bucketExists(bucket);
      if (!exists) {
        await this.client.makeBucket(bucket);
        logger.info('Bucket created', { bucket });
      }

      // Always apply the public-read policy so it survives restarts
      await this.setBucketPublicRead(bucket);
    } catch (error) {
      logger.error('Failed to ensure bucket exists', {
        bucket,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError(
        `Failed to ensure bucket exists: ${bucket}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Set a bucket policy allowing anonymous read (s3:GetObject) for all objects.
   */
  private async setBucketPublicRead(bucket: string): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    };
    await this.client.setBucketPolicy(bucket, JSON.stringify(policy));
    logger.info('Bucket policy set for public read access', { bucket });
  }

  /**
   * Called once at application startup.
   * Creates all required buckets and applies the correct access policies.
   */
  async initializeBuckets(): Promise<void> {
    for (const { name, publicRead } of REQUIRED_BUCKETS) {
      try {
        const exists = await this.client.bucketExists(name);
        if (!exists) {
          await this.client.makeBucket(name);
          logger.info('Bucket created', { bucket: name });
        }

        if (publicRead) {
          await this.setBucketPublicRead(name);
        }

        logger.info(`✅ Bucket ready: ${name}`, { publicRead });
      } catch (error) {
        logger.error(`Failed to initialize bucket: ${name}`, {
          error: error instanceof Error ? error.message : String(error),
        });
        // Non-fatal: log but don't crash the server
      }
    }
  }
}
