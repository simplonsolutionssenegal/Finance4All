import { Request, Response } from 'express';
import { ForgotPasswordUseCase } from '../../../application/use-cases/ForgotPasswordUseCase';

export class ForgotPasswordController {
  constructor(private readonly forgotPasswordUseCase: ForgotPasswordUseCase) {}

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body as { email: string };

    try {
      const result = await this.forgotPasswordUseCase.execute(email);
      
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: {
          success: result.success,
        },
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        data: {
          success: false,
        },
      });
    }
  }
}
