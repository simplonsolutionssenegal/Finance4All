import { Router } from 'express';
import userRoutes from '../infrastructure/web/routes/user.routes';
import institutionFinanciereRoutes from '../infrastructure/web/routes/institutionFinanciere.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/institutions', institutionFinanciereRoutes);

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
