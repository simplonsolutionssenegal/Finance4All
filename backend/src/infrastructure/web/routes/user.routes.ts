import { Router, Request, Response } from 'express';
import { PrismaUserRepository } from '../../database/PrismaUserRepository';
import { NodemailerEmailService } from '@/infrastructure/adapters/NodemailerEmailService';
import { RegisterClerkUserUseCaseImpl } from '@/domain/use-cases/RegisterClerkUserUseCaseImpl';
import { ClerkUserController } from '../controllers/ClerkUserController';

const router = Router();
const userRepository = new PrismaUserRepository();
const emailService = new NodemailerEmailService();

const RegisterClerkUserUseCase = new RegisterClerkUserUseCaseImpl(userRepository, emailService);

const clerkUserController = new ClerkUserController(RegisterClerkUserUseCase);

router.post('/', (_req: Request, res: Response) => {
  return res.status(400).json({
    error: 'Bad Request',
    message: 'Use POST /users/register for Clerk registration.',
  });
});

router.post('/register', (req: Request, res: Response) => clerkUserController.register(req, res));

export default router;
