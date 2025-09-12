import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/UserController';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { SignUpUserUseCaseImpl } from '@/domain/use-cases/SignUpUserUseCaseImpl';
import { NodemailerEmailService } from '@/infrastructure/adapters/NodemailerEmailService';
import { BcryptAuthService } from '@/infrastructure/adapters/BcryptAuthService';

const router = Router();
const userRepository = new PrismaUserRepository();
const emailService = new NodemailerEmailService();

const authService = new BcryptAuthService();
const SignUpUserUseCase = new SignUpUserUseCaseImpl(userRepository, emailService, authService);

const userController = new UserController(SignUpUserUseCase);

router.post('/signup', (req: Request, res: Response) => userController.signUp(req, res));

export default router;
