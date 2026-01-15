import { Router } from 'express';
import { container, TYPES } from '@/infrastructure/config/container';
import type { MediaController } from '../controllers/MediaController';
import {
  uploadMiddleware,
  validateMediaId,
  validateGetMedias,
  validatePresignedUrl,
  validateUploadMetadata,
  handleValidationErrors,
  handleMulterError,
} from '../validators/media.validator';

export const MediaRoutes = (): Router => {
  const router = Router();
  const controller = container.get<MediaController>(TYPES.MediaController);

  const boundController = {
    upload: controller.upload.bind(controller),
    getById: controller.getById.bind(controller),
    getAll: controller.getAll.bind(controller),
    delete: controller.delete.bind(controller),
    getPresignedUrl: controller.getPresignedUrl.bind(controller),
  };

  // Upload a new media file
  router.post(
    '/',
    uploadMiddleware,
    handleMulterError,
    validateUploadMetadata,
    handleValidationErrors,
    boundController.upload
  );

  // Get all media files with pagination and optional type filter
  router.get('/', validateGetMedias, handleValidationErrors, boundController.getAll);

  // Get a specific media file by ID
  router.get('/:id', validateMediaId, handleValidationErrors, boundController.getById);

  // Get presigned URL for a media file
  router.get(
    '/:id/presigned-url',
    validatePresignedUrl,
    handleValidationErrors,
    boundController.getPresignedUrl
  );

  // Delete a media file
  router.delete('/:id', validateMediaId, handleValidationErrors, boundController.delete);

  return router;
};
