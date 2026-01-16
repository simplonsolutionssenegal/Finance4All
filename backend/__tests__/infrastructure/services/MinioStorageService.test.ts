import {
  MinioStorageService,
  type MinioConfig,
} from '@/infrastructure/services/MinioStorageService';
import { StorageError } from '@/domain/media/errors/MediaErrors';
import { Client } from 'minio';
import { Readable } from 'stream';

// Mock Minio client
jest.mock('minio');

// Mock logger
jest.mock('@/infrastructure/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('MinioStorageService', () => {
  let service: MinioStorageService;
  let mockMinioClient: jest.Mocked<Client>;
  let config: MinioConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    config = {
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
    };

    // Create mock client instance
    mockMinioClient = {
      putObject: jest.fn(),
      removeObject: jest.fn(),
      statObject: jest.fn(),
      presignedGetObject: jest.fn(),
      bucketExists: jest.fn(),
      makeBucket: jest.fn(),
      setBucketPolicy: jest.fn(),
    } as any;

    // Mock the Client constructor to return our mock
    (Client as jest.MockedClass<typeof Client>).mockImplementation(() => mockMinioClient);

    service = new MinioStorageService(config);
  });

  describe('constructor', () => {
    it('should initialize with correct config', () => {
      expect(Client).toHaveBeenCalledWith({
        endPoint: config.endPoint,
        port: config.port,
        useSSL: config.useSSL,
        accessKey: config.accessKey,
        secretKey: config.secretKey,
      });
    });

    it('should set publicUrl from config if provided', () => {
      const customConfig: MinioConfig = {
        ...config,
        publicUrl: 'https://cdn.example.com',
      };

      const customService = new MinioStorageService(customConfig);
      const publicUrl = customService.getPublicUrl('bucket', 'path/to/file.txt');

      expect(publicUrl).toBe('https://cdn.example.com/bucket/path/to/file.txt');
    });

    it('should generate publicUrl from config if not provided', () => {
      const publicUrl = service.getPublicUrl('bucket', 'path/to/file.txt');
      expect(publicUrl).toBe('http://localhost:9000/bucket/path/to/file.txt');
    });

    it('should use https in publicUrl when useSSL is true', () => {
      const sslConfig: MinioConfig = {
        ...config,
        useSSL: true,
      };

      const sslService = new MinioStorageService(sslConfig);
      const publicUrl = sslService.getPublicUrl('bucket', 'path/to/file.txt');

      expect(publicUrl).toBe('https://localhost:9000/bucket/path/to/file.txt');
    });
  });

  describe('upload', () => {
    const bucket = 'test-bucket';
    const filename = 'test-file.txt';
    const mimeType = 'text/plain';

    it('should upload a Buffer successfully', async () => {
      const buffer = Buffer.from('test content');
      const etag = 'test-etag-123';

      mockMinioClient.putObject.mockResolvedValue({ etag, versionId: null });

      const result = await service.upload(buffer, {
        bucket,
        filename,
        mimeType,
      });

      expect(mockMinioClient.putObject).toHaveBeenCalledWith(bucket, filename, buffer, undefined, {
        'Content-Type': mimeType,
      });

      expect(result).toEqual({
        bucket,
        path: filename,
        etag,
      });
    });

    it('should upload a Readable stream successfully', async () => {
      const stream = Readable.from(['test content']);
      const etag = 'test-etag-456';

      mockMinioClient.putObject.mockResolvedValue({ etag, versionId: null });

      const result = await service.upload(stream, {
        bucket,
        filename,
        mimeType,
      });

      expect(mockMinioClient.putObject).toHaveBeenCalledWith(bucket, filename, stream, undefined, {
        'Content-Type': mimeType,
      });

      expect(result).toEqual({
        bucket,
        path: filename,
        etag,
      });
    });

    it('should include custom metadata in upload', async () => {
      const buffer = Buffer.from('test content');
      const etag = 'test-etag-789';
      const metadata = {
        'x-amz-meta-user-id': 'user123',
        'x-amz-meta-category': 'documents',
      };

      mockMinioClient.putObject.mockResolvedValue({ etag, versionId: null });

      await service.upload(buffer, {
        bucket,
        filename,
        mimeType,
        metadata,
      });

      expect(mockMinioClient.putObject).toHaveBeenCalledWith(bucket, filename, buffer, undefined, {
        'Content-Type': mimeType,
        ...metadata,
      });
    });

    it('should throw StorageError when upload fails', async () => {
      const buffer = Buffer.from('test content');
      const uploadError = new Error('Network error');

      mockMinioClient.putObject.mockRejectedValue(uploadError);

      await expect(
        service.upload(buffer, {
          bucket,
          filename,
          mimeType,
        })
      ).rejects.toThrow(StorageError);

      await expect(
        service.upload(buffer, {
          bucket,
          filename,
          mimeType,
        })
      ).rejects.toThrow(`Failed to upload file: ${filename}`);
    });

    it('should throw StorageError with cause when upload fails', async () => {
      const buffer = Buffer.from('test content');
      const uploadError = new Error('Network error');

      mockMinioClient.putObject.mockRejectedValue(uploadError);

      try {
        await service.upload(buffer, {
          bucket,
          filename,
          mimeType,
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).cause).toBe(uploadError);
      }
    });

    it('should handle non-Error upload failures', async () => {
      const buffer = Buffer.from('test content');

      mockMinioClient.putObject.mockRejectedValue('String error');

      await expect(
        service.upload(buffer, {
          bucket,
          filename,
          mimeType,
        })
      ).rejects.toThrow(StorageError);
    });
  });

  describe('delete', () => {
    const bucket = 'test-bucket';
    const path = 'path/to/file.txt';

    it('should delete a file successfully', async () => {
      mockMinioClient.removeObject.mockResolvedValue();

      await service.delete(bucket, path);

      expect(mockMinioClient.removeObject).toHaveBeenCalledWith(bucket, path);
    });

    it('should throw StorageError when delete fails', async () => {
      const deleteError = new Error('Delete failed');

      mockMinioClient.removeObject.mockRejectedValue(deleteError);

      await expect(service.delete(bucket, path)).rejects.toThrow(StorageError);

      await expect(service.delete(bucket, path)).rejects.toThrow(`Failed to delete file: ${path}`);
    });

    it('should throw StorageError with cause when delete fails', async () => {
      const deleteError = new Error('Delete failed');

      mockMinioClient.removeObject.mockRejectedValue(deleteError);

      try {
        await service.delete(bucket, path);
        throw new Error('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).cause).toBe(deleteError);
      }
    });

    it('should handle non-Error delete failures', async () => {
      mockMinioClient.removeObject.mockRejectedValue('String error');

      await expect(service.delete(bucket, path)).rejects.toThrow(StorageError);
    });
  });

  describe('exists', () => {
    const bucket = 'test-bucket';
    const path = 'path/to/file.txt';

    it('should return true when file exists', async () => {
      mockMinioClient.statObject.mockResolvedValue({
        size: 1024,
        etag: 'test-etag',
        lastModified: new Date(),
      } as any);

      const result = await service.exists(bucket, path);

      expect(result).toBe(true);
      expect(mockMinioClient.statObject).toHaveBeenCalledWith(bucket, path);
    });

    it('should return false when file does not exist (NotFound error)', async () => {
      const notFoundError = new Error('Not found') as any;
      notFoundError.code = 'NotFound';

      mockMinioClient.statObject.mockRejectedValue(notFoundError);

      const result = await service.exists(bucket, path);

      expect(result).toBe(false);
      expect(mockMinioClient.statObject).toHaveBeenCalledWith(bucket, path);
    });

    it('should throw StorageError for non-NotFound errors', async () => {
      const error = new Error('Permission denied');

      mockMinioClient.statObject.mockRejectedValue(error);

      await expect(service.exists(bucket, path)).rejects.toThrow(StorageError);

      await expect(service.exists(bucket, path)).rejects.toThrow(
        `Failed to check file existence: ${path}`
      );
    });

    it('should throw StorageError with cause for non-NotFound errors', async () => {
      const error = new Error('Permission denied');

      mockMinioClient.statObject.mockRejectedValue(error);

      try {
        await service.exists(bucket, path);
        throw new Error('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(StorageError);
        expect((err as StorageError).cause).toBe(error);
      }
    });

    it('should handle non-Error failures', async () => {
      mockMinioClient.statObject.mockRejectedValue('String error');

      await expect(service.exists(bucket, path)).rejects.toThrow(StorageError);
    });
  });

  describe('getPresignedUrl', () => {
    const bucket = 'test-bucket';
    const path = 'path/to/file.txt';

    it('should generate a presigned URL with default expiry', async () => {
      const presignedUrl = 'https://minio.example.com/presigned-url';

      mockMinioClient.presignedGetObject.mockResolvedValue(presignedUrl);

      const result = await service.getPresignedUrl({
        bucket,
        path,
      });

      expect(result).toBe(presignedUrl);
      expect(mockMinioClient.presignedGetObject).toHaveBeenCalledWith(bucket, path, 3600);
    });

    it('should generate a presigned URL with custom expiry', async () => {
      const presignedUrl = 'https://minio.example.com/presigned-url';
      const expiresIn = 7200;

      mockMinioClient.presignedGetObject.mockResolvedValue(presignedUrl);

      const result = await service.getPresignedUrl({
        bucket,
        path,
        expiresIn,
      });

      expect(result).toBe(presignedUrl);
      expect(mockMinioClient.presignedGetObject).toHaveBeenCalledWith(bucket, path, expiresIn);
    });

    it('should throw StorageError when presigned URL generation fails', async () => {
      const error = new Error('Presign failed');

      mockMinioClient.presignedGetObject.mockRejectedValue(error);

      await expect(
        service.getPresignedUrl({
          bucket,
          path,
        })
      ).rejects.toThrow(StorageError);

      await expect(
        service.getPresignedUrl({
          bucket,
          path,
        })
      ).rejects.toThrow(`Failed to generate presigned URL for: ${path}`);
    });

    it('should throw StorageError with cause when presigned URL generation fails', async () => {
      const error = new Error('Presign failed');

      mockMinioClient.presignedGetObject.mockRejectedValue(error);

      try {
        await service.getPresignedUrl({
          bucket,
          path,
        });
        throw new Error('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(StorageError);
        expect((err as StorageError).cause).toBe(error);
      }
    });

    it('should handle non-Error failures', async () => {
      mockMinioClient.presignedGetObject.mockRejectedValue('String error');

      await expect(
        service.getPresignedUrl({
          bucket,
          path,
        })
      ).rejects.toThrow(StorageError);
    });
  });

  describe('getPublicUrl', () => {
    it('should return correctly formatted public URL', () => {
      const bucket = 'test-bucket';
      const path = 'path/to/file.txt';

      const result = service.getPublicUrl(bucket, path);

      expect(result).toBe('http://localhost:9000/test-bucket/path/to/file.txt');
    });

    it('should handle paths with special characters', () => {
      const bucket = 'test-bucket';
      const path = 'path/to/file with spaces.txt';

      const result = service.getPublicUrl(bucket, path);

      expect(result).toBe('http://localhost:9000/test-bucket/path/to/file with spaces.txt');
    });

    it('should handle nested paths', () => {
      const bucket = 'test-bucket';
      const path = 'deep/nested/path/to/file.txt';

      const result = service.getPublicUrl(bucket, path);

      expect(result).toBe('http://localhost:9000/test-bucket/deep/nested/path/to/file.txt');
    });
  });

  describe('ensureBucket', () => {
    const bucket = 'test-bucket';

    it('should do nothing if bucket already exists', async () => {
      mockMinioClient.bucketExists.mockResolvedValue(true);

      await service.ensureBucket(bucket);

      expect(mockMinioClient.bucketExists).toHaveBeenCalledWith(bucket);
      expect(mockMinioClient.makeBucket).not.toHaveBeenCalled();
      expect(mockMinioClient.setBucketPolicy).not.toHaveBeenCalled();
    });

    it('should create bucket and set policy if bucket does not exist', async () => {
      mockMinioClient.bucketExists.mockResolvedValue(false);
      mockMinioClient.makeBucket.mockResolvedValue();
      mockMinioClient.setBucketPolicy.mockResolvedValue();

      await service.ensureBucket(bucket);

      expect(mockMinioClient.bucketExists).toHaveBeenCalledWith(bucket);
      expect(mockMinioClient.makeBucket).toHaveBeenCalledWith(bucket);
      expect(mockMinioClient.setBucketPolicy).toHaveBeenCalled();

      // Verify the policy structure
      const policyCall = mockMinioClient.setBucketPolicy.mock.calls[0];
      expect(policyCall[0]).toBe(bucket);

      const policy = JSON.parse(policyCall[1] as string);
      expect(policy.Version).toBe('2012-10-17');
      expect(policy.Statement).toHaveLength(1);
      expect(policy.Statement[0].Effect).toBe('Allow');
      expect(policy.Statement[0].Principal).toEqual({ AWS: ['*'] });
      expect(policy.Statement[0].Action).toEqual(['s3:GetObject']);
      expect(policy.Statement[0].Resource).toEqual([`arn:aws:s3:::${bucket}/*`]);
    });

    it('should throw StorageError when bucketExists check fails', async () => {
      const error = new Error('Check failed');

      mockMinioClient.bucketExists.mockRejectedValue(error);

      await expect(service.ensureBucket(bucket)).rejects.toThrow(StorageError);

      await expect(service.ensureBucket(bucket)).rejects.toThrow(
        `Failed to ensure bucket exists: ${bucket}`
      );
    });

    it('should throw StorageError when bucket creation fails', async () => {
      const error = new Error('Creation failed');

      mockMinioClient.bucketExists.mockResolvedValue(false);
      mockMinioClient.makeBucket.mockRejectedValue(error);

      await expect(service.ensureBucket(bucket)).rejects.toThrow(StorageError);

      await expect(service.ensureBucket(bucket)).rejects.toThrow(
        `Failed to ensure bucket exists: ${bucket}`
      );
    });

    it('should throw StorageError when policy setting fails', async () => {
      const error = new Error('Policy failed');

      mockMinioClient.bucketExists.mockResolvedValue(false);
      mockMinioClient.makeBucket.mockResolvedValue();
      mockMinioClient.setBucketPolicy.mockRejectedValue(error);

      await expect(service.ensureBucket(bucket)).rejects.toThrow(StorageError);

      await expect(service.ensureBucket(bucket)).rejects.toThrow(
        `Failed to ensure bucket exists: ${bucket}`
      );
    });

    it('should throw StorageError with cause when operation fails', async () => {
      const error = new Error('Operation failed');

      mockMinioClient.bucketExists.mockRejectedValue(error);

      try {
        await service.ensureBucket(bucket);
        throw new Error('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(StorageError);
        expect((err as StorageError).cause).toBe(error);
      }
    });

    it('should handle non-Error failures', async () => {
      mockMinioClient.bucketExists.mockRejectedValue('String error');

      await expect(service.ensureBucket(bucket)).rejects.toThrow(StorageError);
    });
  });
});
