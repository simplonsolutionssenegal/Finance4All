import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

router.post('/', (_req: Request, res: Response) => {
  return res.status(400).json({
    error: 'Bad Request',
    message: 'Use POST /users/register for user registration.',
  });
});

router.post('/register', (req: Request, res: Response) => authController.register(req, res));

export default router;
