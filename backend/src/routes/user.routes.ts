import { UserController } from '@/controllers/user.controller';
import { Router } from 'express';

const router = Router();
router.get('/list', UserController.getUsers);
router.post('/create', UserController.createUser);
router.get('/organizations/:id/users', UserController.getUsersByOrganisation);

export { router as userRoutes };
