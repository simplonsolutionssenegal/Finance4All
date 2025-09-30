import { Router } from 'express';
import userRoutes from '../infrastructure/web/routes/user.routes';
import { serviceRoutes } from '@/infrastructure/web/routes/service.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/service', serviceRoutes);

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
