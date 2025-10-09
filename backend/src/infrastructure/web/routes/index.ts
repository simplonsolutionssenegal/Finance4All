import { Router } from 'express';
import userRoutes from './user.routes';
import { InstitutionRoutes } from './institution.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/institutions', InstitutionRoutes());

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
