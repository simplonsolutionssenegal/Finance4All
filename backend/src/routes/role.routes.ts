import { RoleController } from '@/controllers/roles.controller';
import { Router } from 'express';

const router = Router();
router.get('/list', RoleController.listRole);

export { router as roleRoutes };
