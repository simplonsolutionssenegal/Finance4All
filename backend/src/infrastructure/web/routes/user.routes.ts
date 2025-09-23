import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { RemoveUserUseCaseImpl } from '@/domain/use-cases/removeUserUseCaseImpl';
import { UpdateUserRoleUseCaseImpl } from '@/domain/use-cases/updateUserRoleUseCaseImpl';

const router = Router();
const removeUserUseCase = new RemoveUserUseCaseImpl();
const updateUserRoleUseCase = new UpdateUserRoleUseCaseImpl();
const userController = new UserController(removeUserUseCase, updateUserRoleUseCase);

router.post('/', (req, res) => userController.create(req, res));
router
  .route('/:userId')
  .delete((req, res) => userController.remove(req, res))
  .patch((req, res) => userController.updateRole(req, res));

export default router;
