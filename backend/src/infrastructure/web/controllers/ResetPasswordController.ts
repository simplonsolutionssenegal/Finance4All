import { Request, Response } from 'express';
import { ResetPasswordUseCase } from '../../../application/use-cases/ResetPasswordUseCase';
import { ForgotAndResetPasswordControllerUtils } from './ControllerUtils';

export class ResetPasswordController {
  constructor(private readonly resetPasswordUseCase: ResetPasswordUseCase) {}

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { userId, newPassword } = (req.body ?? {}) as { userId: string; newPassword: string };

    try {
      const result = await this.resetPasswordUseCase.execute(userId, newPassword);
      ForgotAndResetPasswordControllerUtils.sendSuccessResponse(res, result.message, { success: result.success });
    } catch (error) {
      ForgotAndResetPasswordControllerUtils.sendErrorResponse(res, error);
    }
  }
}
