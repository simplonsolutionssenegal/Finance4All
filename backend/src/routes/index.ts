import { Router } from 'express';
import userRoutes from '../infrastructure/web/routes/user.routes';
import forgotPasswordRoutes from '../infrastructure/web/routes/forgot-password.routes';
import resetPasswordRoutes from '../infrastructure/web/routes/reset-password.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/auth/forgot-password', forgotPasswordRoutes);
router.use('/auth/reset-password', resetPasswordRoutes);

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
