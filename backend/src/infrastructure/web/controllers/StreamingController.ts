import type { Request, Response, NextFunction } from 'express';
import type { StartTranscodingUseCase } from '@/domain/streaming/ports/in/StartTranscodingUseCase';
import type { GetTranscodingStatusUseCase } from '@/domain/streaming/ports/in/GetTranscodingStatusUseCase';
import type { GetStreamManifestUseCase } from '@/domain/streaming/ports/in/GetStreamManifestUseCase';
import type { UpdateProgressUseCase } from '@/domain/streaming/ports/in/UpdateProgressUseCase';
import type { GetProgressUseCase } from '@/domain/streaming/ports/in/GetProgressUseCase';
import type { GenerateStreamTokenUseCase } from '@/domain/streaming/ports/in/GenerateStreamTokenUseCase';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';
import type { HlsVariantRepository } from '@/domain/streaming/ports/out/HlsVariantRepository';
import { HlsManifestGenerator } from '@/application/streaming/services/HlsManifestGenerator';
import type { StreamQuality } from '@/domain/streaming/value-objects/StreamQuality';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId?: string;
  };
}

export class StreamingController {
  private readonly manifestGenerator: HlsManifestGenerator;

  constructor(
    private readonly startTranscodingUseCase: StartTranscodingUseCase,
    private readonly getTranscodingStatusUseCase: GetTranscodingStatusUseCase,
    private readonly getStreamManifestUseCase: GetStreamManifestUseCase,
    private readonly updateProgressUseCase: UpdateProgressUseCase,
    private readonly getProgressUseCase: GetProgressUseCase,
    private readonly generateStreamTokenUseCase: GenerateStreamTokenUseCase,
    private readonly storagePort: StoragePort,
    private readonly hlsVariantRepository: HlsVariantRepository,
    private readonly hlsBucket: string,
    private readonly baseStreamUrl: string
  ) {
    this.manifestGenerator = new HlsManifestGenerator();
  }

  async startTranscoding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: mediaId } = req.params;
      const { qualities } = req.body;

      const result = await this.startTranscodingUseCase.execute({
        mediaId,
        qualities,
      });

      res.status(202).json({
        success: true,
        data: result,
        message: 'Transcoding job started',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTranscodingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: mediaId } = req.params;
      const result = await this.getTranscodingStatusUseCase.execute(mediaId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStreamManifest(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: mediaId } = req.params;
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await this.getStreamManifestUseCase.execute({
        mediaId,
        userId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMasterManifest(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: mediaId } = req.params;

      const variants = await this.hlsVariantRepository.findByMediaId(mediaId);

      if (variants.length === 0) {
        res.status(404).json({ success: false, message: 'No stream variants found' });
        return;
      }

      const manifest = this.manifestGenerator.generateMasterPlaylist(
        variants,
        `${this.baseStreamUrl}/api/v1/media/${mediaId}/stream`
      );

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'max-age=3600');
      res.send(manifest);
    } catch (error) {
      next(error);
    }
  }

  async getVariantPlaylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: mediaId, quality } = req.params;

      const qualityUpper = quality.toUpperCase() as StreamQuality;
      const variant = await this.hlsVariantRepository.findByMediaIdAndQuality(
        mediaId,
        qualityUpper
      );

      if (!variant) {
        res.status(404).json({ success: false, message: 'Variant not found' });
        return;
      }

      const manifest = this.manifestGenerator.generateVariantPlaylist(
        variant,
        `${this.baseStreamUrl}/api/v1/media/${mediaId}/stream/${quality.toLowerCase()}`
      );

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'max-age=3600');
      res.send(manifest);
    } catch (error) {
      next(error);
    }
  }

  async getSegment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: mediaId, quality, segment } = req.params;
      const storagePath = `${mediaId}/${quality.toLowerCase()}/${segment}`;

      const url = await this.storagePort.getPresignedUrl({
        bucket: this.hlsBucket,
        path: storagePath,
        expiresIn: 300,
      });

      res.redirect(302, url);
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: mediaId } = req.params;
      const userId = req.auth?.userId;
      const { currentPosition, duration } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await this.updateProgressUseCase.execute({
        userId,
        mediaId,
        currentPosition,
        duration,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: mediaId } = req.params;
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await this.getProgressUseCase.execute({
        userId,
        mediaId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateStreamToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: mediaId } = req.params;
      const userId = req.auth?.userId;
      const { expiresInSeconds } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await this.generateStreamTokenUseCase.execute({
        userId,
        mediaId,
        expiresInSeconds,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
