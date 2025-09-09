import { Router } from 'express';
import { ResetPasswordController } from '../controllers/ResetPasswordController';
import { ResetPasswordUseCaseImpl } from '../../../domain/use-cases/ResetPasswordUseCaseImpl';

const router = Router();
const resetPasswordUseCase = new ResetPasswordUseCaseImpl();
const resetPasswordController = new ResetPasswordController(resetPasswordUseCase);

router.post('/', (req, res) => resetPasswordController.resetPassword(req, res));

export default router;
