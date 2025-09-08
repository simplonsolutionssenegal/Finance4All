import { Router } from 'express';
import { ForgotPasswordController } from '../controllers/ForgotPasswordController';
import { ForgotPasswordUseCaseImpl } from '../../../domain/use-cases/ForgotPasswordUseCaseImpl';

const router = Router();
const forgotPasswordUseCase = new ForgotPasswordUseCaseImpl();
const forgotPasswordController = new ForgotPasswordController(forgotPasswordUseCase);

router.post('/', (req, res) => forgotPasswordController.forgotPassword(req, res));

export default router;
