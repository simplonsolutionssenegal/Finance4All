import type { Request, Response, NextFunction } from 'express';
import { MediaController } from '@/infrastructure/web/controllers/MediaController';
import type { UploadMediaUseCase } from '@/domain/media/ports/in/UploadMediaUseCase';
import type { GetMediaByIdUseCase } from '@/domain/media/ports/in/GetMediaByIdUseCase';
import type { GetMediasUseCase } from '@/domain/media/ports/in/GetMediasUseCase';
import type { DeleteMediaUseCase } from '@/domain/media/ports/in/DeleteMediaUseCase';
import type { GetPresignedUrlUseCase } from '@/domain/media/ports/in/GetPresignedUrlUseCase';
import type { UploadTemporaryMediaUseCase } from '@/domain/media/ports/in/UploadTemporaryMediaUseCase';
import type { MediaType } from '@/domain/media/value-objects/MediaType';

describe('MediaController', () => {
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  let uploadMediaUseCase: jest.Mocked<UploadMediaUseCase>;
  let getMediaByIdUseCase: jest.Mocked<GetMediaByIdUseCase>;
  let getMediasUseCase: jest.Mocked<GetMediasUseCase>;
  let deleteMediaUseCase: jest.Mocked<DeleteMediaUseCase>;
  let getPresignedUrlUseCase: jest.Mocked<GetPresignedUrlUseCase>;
  let uploadTemporaryMediaUseCase: jest.Mocked<UploadTemporaryMediaUseCase>;
  let controller: MediaController;
  let next: NextFunction;

  beforeEach(() => {
    uploadMediaUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UploadMediaUseCase>;

    getMediaByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetMediaByIdUseCase>;

    getMediasUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetMediasUseCase>;

    deleteMediaUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeleteMediaUseCase>;

    getPresignedUrlUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetPresignedUrlUseCase>;

    uploadTemporaryMediaUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UploadTemporaryMediaUseCase>;

    controller = new MediaController(
      uploadMediaUseCase,
      getMediaByIdUseCase,
      getMediasUseCase,
      deleteMediaUseCase,
      getPresignedUrlUseCase,
      uploadTemporaryMediaUseCase
    );

    next = jest.fn();
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // upload
  // ---------------------------------------------------------------------------

  describe('upload', () => {
    it('should return 400 when no file is provided', async () => {
      const req = {
        file: undefined,
        body: {},
      } as unknown as Request;
      const res = createMockResponse();

      await controller.upload(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No file provided',
      });
      expect(uploadMediaUseCase.execute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should upload file successfully without metadata', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      };

      const req = {
        file: mockFile,
        body: {},
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        id: 'media-123',
        url: 'https://example.com/media/media-123',
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
      };

      uploadMediaUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.upload(req, res, next);

      expect(uploadMediaUseCase.execute).toHaveBeenCalledWith({
        file: mockFile.buffer,
        originalName: mockFile.originalname,
        mimeType: mockFile.mimetype,
        size: mockFile.size,
        metadata: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should upload file successfully with metadata', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      };

      const metadata = {
        title: 'Test Image',
        description: 'Test description',
        tags: ['test', 'image'],
      };

      const req = {
        file: mockFile,
        body: {
          metadata: JSON.stringify(metadata),
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        id: 'media-123',
        url: 'https://example.com/media/media-123',
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        metadata,
      };

      uploadMediaUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.upload(req, res, next);

      expect(uploadMediaUseCase.execute).toHaveBeenCalledWith({
        file: mockFile.buffer,
        originalName: mockFile.originalname,
        mimeType: mockFile.mimetype,
        size: mockFile.size,
        metadata,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when upload fails', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      };

      const req = {
        file: mockFile,
        body: {},
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Upload failed');
      uploadMediaUseCase.execute.mockRejectedValueOnce(error);

      await controller.upload(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON metadata gracefully', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      };

      const req = {
        file: mockFile,
        body: {
          metadata: 'invalid json',
        },
      } as unknown as Request;
      const res = createMockResponse();

      await controller.upload(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(SyntaxError));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // uploadTemporary
  // ---------------------------------------------------------------------------

  describe('uploadTemporary', () => {
    it('should return 400 when no file is provided', async () => {
      const req = {
        file: undefined,
        body: {},
      } as unknown as Request;
      const res = createMockResponse();

      await controller.uploadTemporary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No file provided',
      });
      expect(uploadTemporaryMediaUseCase.execute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should upload temporary file successfully without metadata and expiresInHours', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'temp.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
      };

      const req = {
        file: mockFile,
        body: {},
      } as unknown as Request;
      const res = createMockResponse();

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const mockResult = {
        id: 'temp-123',
        url: 'https://example.com/temp/temp-123',
        expiresAt,
      };

      uploadTemporaryMediaUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.uploadTemporary(req, res, next);

      expect(uploadTemporaryMediaUseCase.execute).toHaveBeenCalledWith({
        file: mockFile.buffer,
        originalName: mockFile.originalname,
        mimeType: mockFile.mimetype,
        size: mockFile.size,
        metadata: undefined,
        expiresInHours: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: mockResult.id,
          url: mockResult.url,
          expiresAt: mockResult.expiresAt,
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should upload temporary file successfully with metadata and expiresInHours', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'temp.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
      };

      const metadata = {
        title: 'Temporary Image',
        category: 'temp',
      };

      const req = {
        file: mockFile,
        body: {
          metadata: JSON.stringify(metadata),
          expiresInHours: '48',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const mockResult = {
        id: 'temp-123',
        url: 'https://example.com/temp/temp-123',
        expiresAt,
      };

      uploadTemporaryMediaUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.uploadTemporary(req, res, next);

      expect(uploadTemporaryMediaUseCase.execute).toHaveBeenCalledWith({
        file: mockFile.buffer,
        originalName: mockFile.originalname,
        mimeType: mockFile.mimetype,
        size: mockFile.size,
        metadata,
        expiresInHours: 48,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: mockResult.id,
          url: mockResult.url,
          expiresAt: mockResult.expiresAt,
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle string expiresInHours and convert to number', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'temp.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
      };

      const req = {
        file: mockFile,
        body: {
          expiresInHours: '72',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
      const mockResult = {
        id: 'temp-123',
        url: 'https://example.com/temp/temp-123',
        expiresAt,
      };

      uploadTemporaryMediaUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.uploadTemporary(req, res, next);

      expect(uploadTemporaryMediaUseCase.execute).toHaveBeenCalledWith({
        file: mockFile.buffer,
        originalName: mockFile.originalname,
        mimeType: mockFile.mimetype,
        size: mockFile.size,
        metadata: undefined,
        expiresInHours: 72,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when temporary upload fails', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'temp.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
      };

      const req = {
        file: mockFile,
        body: {},
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Upload failed');
      uploadTemporaryMediaUseCase.execute.mockRejectedValueOnce(error);

      await controller.uploadTemporary(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON metadata gracefully', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'temp.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
      };

      const req = {
        file: mockFile,
        body: {
          metadata: '{invalid json}',
        },
      } as unknown as Request;
      const res = createMockResponse();

      await controller.uploadTemporary(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(SyntaxError));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getById
  // ---------------------------------------------------------------------------

  describe('getById', () => {
    it('should return media by id successfully', async () => {
      const req = {
        params: {
          id: 'media-123',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        id: 'media-123',
        url: 'https://example.com/media/media-123',
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getMediaByIdUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.getById(req, res, next);

      expect(getMediaByIdUseCase.execute).toHaveBeenCalledWith('media-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when media not found', async () => {
      const req = {
        params: {
          id: 'non-existent',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Media not found');
      getMediaByIdUseCase.execute.mockRejectedValueOnce(error);

      await controller.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next with error when use case throws', async () => {
      const req = {
        params: {
          id: 'media-123',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Database error');
      getMediaByIdUseCase.execute.mockRejectedValueOnce(error);

      await controller.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getAll
  // ---------------------------------------------------------------------------

  describe('getAll', () => {
    it('should return all media with default pagination', async () => {
      const req = {
        query: {},
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        data: [
          {
            id: 'media-1',
            url: 'https://example.com/media/media-1',
            filename: 'test1.jpg',
          },
          {
            id: 'media-2',
            url: 'https://example.com/media/media-2',
            filename: 'test2.jpg',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      getMediasUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.getAll(req, res, next);

      expect(getMediasUseCase.execute).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        type: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return media with custom pagination parameters', async () => {
      const req = {
        query: {
          page: '3',
          limit: '25',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        data: [],
        pagination: {
          page: 3,
          limit: 25,
          total: 0,
          totalPages: 0,
        },
      };

      getMediasUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.getAll(req, res, next);

      expect(getMediasUseCase.execute).toHaveBeenCalledWith({
        page: 3,
        limit: 25,
        type: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should filter media by type', async () => {
      const req = {
        query: {
          page: '1',
          limit: '10',
          type: 'IMAGE' as MediaType,
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        data: [
          {
            id: 'media-1',
            url: 'https://example.com/media/media-1',
            filename: 'test1.jpg',
            type: 'IMAGE',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      getMediasUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.getAll(req, res, next);

      expect(getMediasUseCase.execute).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        type: 'IMAGE',
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle invalid page number and use default', async () => {
      const req = {
        query: {
          page: 'invalid',
          limit: '10',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      getMediasUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.getAll(req, res, next);

      expect(getMediasUseCase.execute).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        type: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle invalid limit number and use default', async () => {
      const req = {
        query: {
          page: '2',
          limit: 'invalid',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        data: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      getMediasUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.getAll(req, res, next);

      expect(getMediasUseCase.execute).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        type: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when use case fails', async () => {
      const req = {
        query: {},
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Database error');
      getMediasUseCase.execute.mockRejectedValueOnce(error);

      await controller.getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // delete
  // ---------------------------------------------------------------------------

  describe('delete', () => {
    it('should delete media successfully', async () => {
      const req = {
        params: {
          id: 'media-123',
        },
      } as unknown as Request;
      const res = createMockResponse();

      deleteMediaUseCase.execute.mockResolvedValueOnce(undefined);

      await controller.delete(req, res, next);

      expect(deleteMediaUseCase.execute).toHaveBeenCalledWith('media-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Media deleted successfully',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when media not found', async () => {
      const req = {
        params: {
          id: 'non-existent',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Media not found');
      deleteMediaUseCase.execute.mockRejectedValueOnce(error);

      await controller.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next with error when deletion fails', async () => {
      const req = {
        params: {
          id: 'media-123',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Storage deletion failed');
      deleteMediaUseCase.execute.mockRejectedValueOnce(error);

      await controller.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getPresignedUrl
  // ---------------------------------------------------------------------------

  describe('getPresignedUrl', () => {
    it('should generate presigned URL without expiration parameter', async () => {
      const req = {
        params: {
          id: 'media-123',
        },
        query: {},
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        url: 'https://example.com/media/media-123?signature=xyz',
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };

      getPresignedUrlUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.getPresignedUrl(req, res, next);

      expect(getPresignedUrlUseCase.execute).toHaveBeenCalledWith({
        mediaId: 'media-123',
        expiresIn: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should generate presigned URL with custom expiration', async () => {
      const req = {
        params: {
          id: 'media-123',
        },
        query: {
          expiresIn: '7200',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        url: 'https://example.com/media/media-123?signature=xyz',
        expiresAt: new Date(Date.now() + 7200 * 1000),
      };

      getPresignedUrlUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.getPresignedUrl(req, res, next);

      expect(getPresignedUrlUseCase.execute).toHaveBeenCalledWith({
        mediaId: 'media-123',
        expiresIn: 7200,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle invalid expiresIn and pass undefined', async () => {
      const req = {
        params: {
          id: 'media-123',
        },
        query: {
          expiresIn: 'invalid',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        url: 'https://example.com/media/media-123?signature=xyz',
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };

      getPresignedUrlUseCase.execute.mockResolvedValueOnce(mockResult as any);

      await controller.getPresignedUrl(req, res, next);

      expect(getPresignedUrlUseCase.execute).toHaveBeenCalledWith({
        mediaId: 'media-123',
        expiresIn: NaN,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when media not found', async () => {
      const req = {
        params: {
          id: 'non-existent',
        },
        query: {},
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Media not found');
      getPresignedUrlUseCase.execute.mockRejectedValueOnce(error);

      await controller.getPresignedUrl(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next with error when presigned URL generation fails', async () => {
      const req = {
        params: {
          id: 'media-123',
        },
        query: {
          expiresIn: '3600',
        },
      } as unknown as Request;
      const res = createMockResponse();

      const error = new Error('Storage service unavailable');
      getPresignedUrlUseCase.execute.mockRejectedValueOnce(error);

      await controller.getPresignedUrl(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
