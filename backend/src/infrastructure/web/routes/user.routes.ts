import { Router } from 'express';
import { UserController } from '@/infrastructure/web/controllers/UserController';
import { PrismaUserRepository } from '@/infrastructure/database/PrismaUserRepository';
import { CreateUserUseCaseImpl } from '@/domain/use-cases/createUserUseCaseImpl';

const router = Router();
const userRepository = new PrismaUserRepository();
const createUserUseCase = new CreateUserUseCaseImpl(userRepository);
const userController = new UserController(createUserUseCase);

router.post('/', (req, res) => userController.create(req, res));

export default router;
