import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { CreateUserUseCaseImpl } from '../../../domain/use-cases/createUserUseCaseImpl';
import { GetAllUsersUseCase } from '@/application/use-cases/GetAllUsersUseCase';
import { SearchUsersUseCase } from '@/application/use-cases/SearchUsersUseCase';

const router = Router();

const userRepository = new PrismaUserRepository();
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const searchUsersUseCase = new SearchUsersUseCase(userRepository);
const createUserUseCase = new CreateUserUseCaseImpl(userRepository);

const userController = new UserController(
  createUserUseCase,
  searchUsersUseCase,
  getAllUsersUseCase,
);

router.get('/', (req, res) => userController.getAllUsers(req, res));
router.get('/search', (req, res) => userController.search(req, res));
router.post('/create', (req, res) => userController.create(req, res));

export { router as userRoutes };
