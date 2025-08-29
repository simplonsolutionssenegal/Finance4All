import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';

const router = Router();
const userController = new UserController();

router.post('/', (req, res) => userController.create(req, res));

export default router;
