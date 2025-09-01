import { UserController } from '@/controllers/user.controller';
import { Router } from 'express';

const router = Router();
router.get('/list', UserController.getUsers);
router.post('/create', UserController.createUser);
router.get('/organizations/:id/users', UserController.getUsersByOrganisation);
router.get('/organizations/:id/users/filter', UserController.getUsersByOrganisationFilter);

export { router as userRoutes };
