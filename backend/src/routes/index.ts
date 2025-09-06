import { roleRoutes } from '@/infrastructure/web/routes/role.routes';
import { userRoutes } from '@/infrastructure/web/routes/user.routes';
import { Router } from 'express';

const router = Router();

router.use('/users', userRoutes);
router.use('/roles', roleRoutes);

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