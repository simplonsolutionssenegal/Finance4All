import type { Request, Response, NextFunction } from 'express';
import { StreamingController } from '@/infrastructure/web/controllers/StreamingController';
import type { StartTranscodingUseCase } from '@/domain/streaming/ports/in/StartTranscodingUseCase';
import type { GetTranscodingStatusUseCase } from '@/domain/streaming/ports/in/GetTranscodingStatusUseCase';
import type { GetStreamManifestUseCase } from '@/domain/streaming/ports/in/GetStreamManifestUseCase';
import type { UpdateProgressUseCase } from '@/domain/streaming/ports/in/UpdateProgressUseCase';
import type { GetProgressUseCase } from '@/domain/streaming/ports/in/GetProgressUseCase';
import type { GenerateStreamTokenUseCase } from '@/domain/streaming/ports/in/GenerateStreamTokenUseCase';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import type { HlsVariantRepository } from '@/domain/streaming/ports/out/HlsVariantRepository';
import { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';
import { TranscodingStatus } from '@/domain/streaming/value-objects/TranscodingStatus';
import { HlsVariant } from '@/domain/streaming/entities/HlsVariant';
import { EntityId } from '@/domain/shared/EntityId';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId?: string;
  };
}

describe('StreamingController', () => {
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  let startTranscodingUseCase: jest.Mocked<StartTranscodingUseCase>;
  let getTranscodingStatusUseCase: jest.Mocked<GetTranscodingStatusUseCase>;
  let getStreamManifestUseCase: jest.Mocked<GetStreamManifestUseCase>;
  let updateProgressUseCase: jest.Mocked<UpdateProgressUseCase>;
  let getProgressUseCase: jest.Mocked<GetProgressUseCase>;
  let generateStreamTokenUseCase: jest.Mocked<GenerateStreamTokenUseCase>;
  let storagePort: jest.Mocked<StoragePort>;
  let hlsVariantRepository: jest.Mocked<HlsVariantRepository>;
  let controller: StreamingController;
  let next: NextFunction;
  const hlsBucket = 'test-hls-bucket';
  const baseStreamUrl = 'https://stream.example.com';

  beforeEach(() => {
    startTranscodingUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<StartTranscodingUseCase>;

    getTranscodingStatusUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetTranscodingStatusUseCase>;

    getStreamManifestUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetStreamManifestUseCase>;

    updateProgressUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateProgressUseCase>;

    getProgressUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetProgressUseCase>;

    generateStreamTokenUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GenerateStreamTokenUseCase>;

    storagePort = {
      upload: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      getPresignedUrl: jest.fn(),
      getPublicUrl: jest.fn(),
      ensureBucket: jest.fn(),
    } as jest.Mocked<StoragePort>;

    hlsVariantRepository = {
      save: jest.fn(),
      findByMediaId: jest.fn(),
      findByMediaIdAndQuality: jest.fn(),
      deleteByMediaId: jest.fn(),
    } as unknown as jest.Mocked<HlsVariantRepository>;

    controller = new StreamingController(
      startTranscodingUseCase,
      getTranscodingStatusUseCase,
      getStreamManifestUseCase,
      updateProgressUseCase,
      getProgressUseCase,
      generateStreamTokenUseCase,
      storagePort,
      hlsVariantRepository,
      hlsBucket,
      baseStreamUrl
    );

    next = jest.fn();
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // startTranscoding
  // ---------------------------------------------------------------------------

  describe('startTranscoding', () => {
    it('should start transcoding successfully', async () => {
      const req = {
        params: { id: 'media-123' },
        body: { qualities: [StreamQuality.Q720P, StreamQuality.Q480P] },
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        id: 'job-123',
        mediaId: 'media-123',
        status: TranscodingStatus.PENDING,
        progress: 0,
        errorMessage: null,
        startedAt: null,
        completedAt: null,
        createdAt: new Date(),
      };

      startTranscodingUseCase.execute.mockResolvedValue(mockResult);

      await controller.startTranscoding(req, res, next);

      expect(startTranscodingUseCase.execute).toHaveBeenCalledWith({
        mediaId: 'media-123',
        qualities: [StreamQuality.Q720P, StreamQuality.Q480P],
      });
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Transcoding job started',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = {
        params: { id: 'media-123' },
        body: { qualities: [StreamQuality.Q720P] },
      } as unknown as Request;
      const res = createMockResponse();
      const error = new Error('Transcoding failed');

      startTranscodingUseCase.execute.mockRejectedValue(error);

      await controller.startTranscoding(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getTranscodingStatus
  // ---------------------------------------------------------------------------

  describe('getTranscodingStatus', () => {
    it('should get transcoding status successfully', async () => {
      const req = {
        params: { id: 'media-123' },
      } as unknown as Request;
      const res = createMockResponse();

      const mockResult = {
        id: 'job-123',
        mediaId: 'media-123',
        status: TranscodingStatus.COMPLETED,
        progress: 100,
        errorMessage: null,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
      };

      getTranscodingStatusUseCase.execute.mockResolvedValue(mockResult);

      await controller.getTranscodingStatus(req, res, next);

      expect(getTranscodingStatusUseCase.execute).toHaveBeenCalledWith('media-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = {
        params: { id: 'media-123' },
      } as unknown as Request;
      const res = createMockResponse();
      const error = new Error('Status fetch failed');

      getTranscodingStatusUseCase.execute.mockRejectedValue(error);

      await controller.getTranscodingStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getStreamManifest
  // ---------------------------------------------------------------------------

  describe('getStreamManifest', () => {
    it('should get stream manifest successfully', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: { userId: 'user-123' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      const mockResult = {
        masterPlaylistUrl: 'https://example.com/manifest.m3u8',
        variants: [],
        transcodingStatus: TranscodingStatus.COMPLETED,
      };

      getStreamManifestUseCase.execute.mockResolvedValue(mockResult);

      await controller.getStreamManifest(req, res, next);

      expect(getStreamManifestUseCase.execute).toHaveBeenCalledWith({
        mediaId: 'media-123',
        userId: 'user-123',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when userId is missing', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: {},
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await controller.getStreamManifest(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
      expect(getStreamManifestUseCase.execute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when auth is missing', async () => {
      const req = {
        params: { id: 'media-123' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await controller.getStreamManifest(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
      expect(getStreamManifestUseCase.execute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: { userId: 'user-123' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();
      const error = new Error('Manifest fetch failed');

      getStreamManifestUseCase.execute.mockRejectedValue(error);

      await controller.getStreamManifest(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getMasterManifest
  // ---------------------------------------------------------------------------

  describe('getMasterManifest', () => {
    it('should get master manifest successfully', async () => {
      const req = {
        params: { id: 'media-123' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      const mockVariants = [
        new HlsVariant({
          id: EntityId.from('d4468873-437e-494d-8871-1624fd8ba867'),
          mediaId: 'media-123',
          quality: StreamQuality.Q720P,
          bandwidth: 2500000,
          resolution: '1280x720',
          codecs: 'avc1.4d001f,mp4a.40.2',
          playlistPath: 'hls/media-123/hd720p/playlist.m3u8',
          segmentPrefix: 'segment',
          segmentCount: 2,
          segmentDuration: 10,
        }),
        new HlsVariant({
          id: EntityId.from('12345678-1234-4234-8234-123456789012'),
          mediaId: 'media-123',
          quality: StreamQuality.Q480P,
          bandwidth: 1000000,
          resolution: '854x480',
          codecs: 'avc1.4d001f,mp4a.40.2',
          playlistPath: 'hls/media-123/sd480p/playlist.m3u8',
          segmentPrefix: 'segment',
          segmentCount: 2,
          segmentDuration: 10,
        }),
      ];

      hlsVariantRepository.findByMediaId.mockResolvedValue(mockVariants);

      await controller.getMasterManifest(req, res, next);

      expect(hlsVariantRepository.findByMediaId).toHaveBeenCalledWith('media-123');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/vnd.apple.mpegurl');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'max-age=3600');
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 when no variants found', async () => {
      const req = {
        params: { id: 'media-123' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      hlsVariantRepository.findByMediaId.mockResolvedValue([]);

      await controller.getMasterManifest(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No stream variants found',
      });
      expect(res.send).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = {
        params: { id: 'media-123' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();
      const error = new Error('Variant fetch failed');

      hlsVariantRepository.findByMediaId.mockRejectedValue(error);

      await controller.getMasterManifest(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getVariantPlaylist
  // ---------------------------------------------------------------------------

  describe('getVariantPlaylist', () => {
    it('should get variant playlist successfully', async () => {
      const req = {
        params: { id: 'media-123', quality: 'q720p' },
      } as unknown as Request;
      const res = createMockResponse();

      const mockVariant = new HlsVariant({
        id: EntityId.from('d4468873-437e-494d-8871-1624fd8ba867'),
        mediaId: 'media-123',
        quality: StreamQuality.Q720P,
        bandwidth: 2500000,
        resolution: '1280x720',
        codecs: 'avc1.4d001f,mp4a.40.2',
        playlistPath: 'hls/media-123/q720p/playlist.m3u8',
        segmentPrefix: 'segment',
        segmentCount: 2,
        segmentDuration: 10,
      });

      hlsVariantRepository.findByMediaIdAndQuality.mockResolvedValue(mockVariant);

      await controller.getVariantPlaylist(req, res, next);

      expect(hlsVariantRepository.findByMediaIdAndQuality).toHaveBeenCalledWith(
        'media-123',
        StreamQuality.Q720P
      );
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/vnd.apple.mpegurl');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'max-age=3600');
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 when variant not found', async () => {
      const req = {
        params: { id: 'media-123', quality: 'q720p' },
      } as unknown as Request;
      const res = createMockResponse();

      hlsVariantRepository.findByMediaIdAndQuality.mockResolvedValue(null);

      await controller.getVariantPlaylist(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Variant not found',
      });
      expect(res.send).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = {
        params: { id: 'media-123', quality: 'q720p' },
      } as unknown as Request;
      const res = createMockResponse();
      const error = new Error('Variant fetch failed');

      hlsVariantRepository.findByMediaIdAndQuality.mockRejectedValue(error);

      await controller.getVariantPlaylist(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getSegment
  // ---------------------------------------------------------------------------

  describe('getSegment', () => {
    it('should redirect to presigned URL for segment', async () => {
      const req = {
        params: { id: 'media-123', quality: 'q720p', segment: 'segment0.ts' },
      } as unknown as Request;
      const res = createMockResponse();

      const mockPresignedUrl = 'https://storage.example.com/signed-url';
      storagePort.getPresignedUrl.mockResolvedValue(mockPresignedUrl);

      await controller.getSegment(req, res, next);

      expect(storagePort.getPresignedUrl).toHaveBeenCalledWith({
        bucket: hlsBucket,
        path: 'media-123/q720p/segment0.ts',
        expiresIn: 300,
      });
      expect(res.redirect).toHaveBeenCalledWith(302, mockPresignedUrl);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = {
        params: { id: 'media-123', quality: 'q720p', segment: 'segment0.ts' },
      } as unknown as Request;
      const res = createMockResponse();
      const error = new Error('Storage error');

      storagePort.getPresignedUrl.mockRejectedValue(error);

      await controller.getSegment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // updateProgress
  // ---------------------------------------------------------------------------

  describe('updateProgress', () => {
    it('should update progress successfully', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: { userId: 'user-123' },
        body: { currentPosition: 120, duration: 300 },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      const mockResult = {
        id: 'progress-123',
        userId: 'user-123',
        mediaId: 'media-123',
        currentPosition: 120,
        duration: 300,
        completionRate: 40,
        isCompleted: false,
        lastWatchedAt: new Date(),
      };

      updateProgressUseCase.execute.mockResolvedValue(mockResult);

      await controller.updateProgress(req, res, next);

      expect(updateProgressUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        mediaId: 'media-123',
        currentPosition: 120,
        duration: 300,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when userId is missing', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: {},
        body: { currentPosition: 120, duration: 300 },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await controller.updateProgress(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
      expect(updateProgressUseCase.execute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: { userId: 'user-123' },
        body: { currentPosition: 120, duration: 300 },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();
      const error = new Error('Progress update failed');

      updateProgressUseCase.execute.mockRejectedValue(error);

      await controller.updateProgress(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getProgress
  // ---------------------------------------------------------------------------

  describe('getProgress', () => {
    it('should get progress successfully', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: { userId: 'user-123' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      const mockResult = {
        id: 'progress-123',
        userId: 'user-123',
        mediaId: 'media-123',
        currentPosition: 120,
        duration: 300,
        completionRate: 40,
        isCompleted: false,
        lastWatchedAt: new Date(),
      };

      getProgressUseCase.execute.mockResolvedValue(mockResult);

      await controller.getProgress(req, res, next);

      expect(getProgressUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        mediaId: 'media-123',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when userId is missing', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: {},
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await controller.getProgress(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
      expect(getProgressUseCase.execute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: { userId: 'user-123' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();
      const error = new Error('Progress fetch failed');

      getProgressUseCase.execute.mockRejectedValue(error);

      await controller.getProgress(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // generateStreamToken
  // ---------------------------------------------------------------------------

  describe('generateStreamToken', () => {
    it('should generate stream token successfully', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: { userId: 'user-123' },
        body: { expiresInSeconds: 3600 },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      const mockResult = {
        token: 'token-123',
        expiresAt: new Date('2024-01-01T12:00:00Z'),
      };

      generateStreamTokenUseCase.execute.mockResolvedValue(mockResult);

      await controller.generateStreamToken(req, res, next);

      expect(generateStreamTokenUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        mediaId: 'media-123',
        expiresInSeconds: 3600,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when userId is missing', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: {},
        body: { expiresInSeconds: 3600 },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await controller.generateStreamToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
      expect(generateStreamTokenUseCase.execute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = {
        params: { id: 'media-123' },
        auth: { userId: 'user-123' },
        body: { expiresInSeconds: 3600 },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();
      const error = new Error('Token generation failed');

      generateStreamTokenUseCase.execute.mockRejectedValue(error);

      await controller.generateStreamToken(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
