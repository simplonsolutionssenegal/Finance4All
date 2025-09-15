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

router.post('/register', (req: Request, res: Response) => clerkUserController.register(req, res));

export default router;
