import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { CreateUserUseCaseImpl } from '@/domain/use-cases/createUserUseCaseImpl';
import { RemoveUserUseCaseImpl } from '@/domain/use-cases/removeUserUseCaseImpl';
import { UpdateUserRoleUseCaseImpl } from '@/domain/use-cases/updateUserRoleUseCaseImpl';

const router = Router();
const userRepository = new PrismaUserRepository();
const createUserUseCase = new CreateUserUseCaseImpl(userRepository);
const removeUserUseCase = new RemoveUserUseCaseImpl();
const updateUserRoleUseCase = new UpdateUserRoleUseCaseImpl();
const userController = new UserController(createUserUseCase, removeUserUseCase, updateUserRoleUseCase);

router.post('/', (req, res) => userController.create(req, res));
router.route('/:userId')
  .delete((req, res) => userController.remove(req, res))
  .patch((req, res) => userController.updateRole(req, res));

export default router;
