import { Router } from 'express';
import { requireSameActiveOrg } from '../middleware/requireOrg.middleware';
import type { StreamingController } from '../controllers/StreamingController';
import {
  validateMediaId,
  validateStartTranscoding,
  validateUpdateProgress,
  validateQuality,
  validateSegment,
  validateGenerateToken,
  handleStreamingValidationErrors,
} from '../validators/streaming.validator';

export const createStreamingRoutes = (controller: StreamingController): Router => {
  const router = Router();

  const boundController = {
    startTranscoding: controller.startTranscoding.bind(controller),
    getTranscodingStatus: controller.getTranscodingStatus.bind(controller),
    getStreamManifest: controller.getStreamManifest.bind(controller),
    getMasterManifest: controller.getMasterManifest.bind(controller),
    getVariantPlaylist: controller.getVariantPlaylist.bind(controller),
    getSegment: controller.getSegment.bind(controller),
    updateProgress: controller.updateProgress.bind(controller),
    getProgress: controller.getProgress.bind(controller),
    generateStreamToken: controller.generateStreamToken.bind(controller),
  };

  // Transcoding endpoints
  router.post(
    '/:id/transcode',
    requireSameActiveOrg,
    validateMediaId,
    validateStartTranscoding,
    handleStreamingValidationErrors,
    boundController.startTranscoding
  );

  router.get(
    '/:id/transcode/status',
    requireSameActiveOrg,
    validateMediaId,
    handleStreamingValidationErrors,
    boundController.getTranscodingStatus
  );

  // Stream info endpoint
  router.get(
    '/:id/stream',
    requireSameActiveOrg,
    validateMediaId,
    handleStreamingValidationErrors,
    boundController.getStreamManifest
  );

  // HLS Streaming endpoints
  router.get(
    '/:id/stream/master.m3u8',
    validateMediaId,
    handleStreamingValidationErrors,
    boundController.getMasterManifest
  );

  router.get(
    '/:id/stream/:quality/playlist.m3u8',
    validateMediaId,
    validateQuality,
    handleStreamingValidationErrors,
    boundController.getVariantPlaylist
  );

  router.get(
    '/:id/stream/:quality/:segment',
    validateMediaId,
    validateQuality,
    validateSegment,
    handleStreamingValidationErrors,
    boundController.getSegment
  );

  // Progress tracking endpoints
  router.post(
    '/:id/progress',
    requireSameActiveOrg,
    validateMediaId,
    validateUpdateProgress,
    handleStreamingValidationErrors,
    boundController.updateProgress
  );

  router.get(
    '/:id/progress',
    requireSameActiveOrg,
    validateMediaId,
    handleStreamingValidationErrors,
    boundController.getProgress
  );

  // Stream token endpoint
  router.post(
    '/:id/stream-token',
    requireSameActiveOrg,
    validateMediaId,
    validateGenerateToken,
    handleStreamingValidationErrors,
    boundController.generateStreamToken
  );

  return router;
};
