import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { CreateUserUseCaseImpl } from '../../../domain/use-cases/createUserUseCaseImpl';

const router = Router();
const userRepository = new PrismaUserRepository();
const createUserUseCase = new CreateUserUseCaseImpl(userRepository);
const userController = new UserController(createUserUseCase);

router.post('/', (req, res) => userController.create(req, res));

export default router;
