import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { CreateUserUseCase } from '../../../application/use-cases/CreateUserUseCase';

const router = Router();
const userRepository = new PrismaUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);
const userController = new UserController(createUserUseCase);

router.post('/', (req, res) => userController.create(req, res));

export default router;
