import type { Request, Response, NextFunction } from 'express';
import type { UploadMediaUseCase } from '@/domain/media/ports/in/UploadMediaUseCase';
import type { GetMediaByIdUseCase } from '@/domain/media/ports/in/GetMediaByIdUseCase';
import type { GetMediasUseCase } from '@/domain/media/ports/in/GetMediasUseCase';
import type { DeleteMediaUseCase } from '@/domain/media/ports/in/DeleteMediaUseCase';
import type { GetPresignedUrlUseCase } from '@/domain/media/ports/in/GetPresignedUrlUseCase';
import type { MediaType } from '@/domain/media/value-objects/MediaType';

export class MediaController {
  constructor(
    private readonly uploadMediaUseCase: UploadMediaUseCase,
    private readonly getMediaByIdUseCase: GetMediaByIdUseCase,
    private readonly getMediasUseCase: GetMediasUseCase,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
    private readonly getPresignedUrlUseCase: GetPresignedUrlUseCase
  ) {}

  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No file provided',
        });
        return;
      }

      const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : undefined;

      const result = await this.uploadMediaUseCase.execute({
        file: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        metadata,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.getMediaByIdUseCase.execute(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as MediaType | undefined;

      const result = await this.getMediasUseCase.execute({
        page,
        limit,
        type,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.deleteMediaUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Media deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const expiresIn = req.query.expiresIn ? parseInt(req.query.expiresIn as string) : undefined;

      const result = await this.getPresignedUrlUseCase.execute({
        mediaId: id,
        expiresIn,
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
