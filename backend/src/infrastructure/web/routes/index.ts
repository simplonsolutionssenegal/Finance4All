import { Router } from 'express';
import userRoutes from './user.routes';
import { InstitutionRoutes } from './institution.routes';
import { ModuleFormationRoutes } from './module.routes';
import { ServiceRoutes } from './service.routes';
import { beneficiaryRoutes } from './beneficiary.routes';
import { MediaRoutes } from './media.routes';
import { createStreamingRoutes } from './streaming.routes';
import { container, TYPES } from '@/infrastructure/config/container';
import type { StreamingController } from '../controllers/StreamingController';

const router = Router();

router.use('/users', userRoutes);
router.use('/institutions', InstitutionRoutes());
router.use('/modules', ModuleFormationRoutes());
router.use('/services', ServiceRoutes());
router.use('/beneficiaries', beneficiaryRoutes());
router.use('/media', MediaRoutes());

// Streaming routes (mounted under /media for consistency)
const streamingController = container.get<StreamingController>(TYPES.StreamingController);
router.use('/media', createStreamingRoutes(streamingController));

// Route de test
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION ?? 'v1',
  });
});

export { router as apiRoutes };
