import { Request, Response } from 'express';
import { ResetPasswordUseCase } from '../../../application/use-cases/ResetPasswordUseCase';

export class ResetPasswordController {
  constructor(private readonly resetPasswordUseCase: ResetPasswordUseCase) {}

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { userId, newPassword } = (req.body ?? {}) as { userId: string; newPassword: string };

    try {
      const result = await this.resetPasswordUseCase.execute(userId, newPassword);
      
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
