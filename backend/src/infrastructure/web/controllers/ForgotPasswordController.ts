import { Request, Response } from 'express';
import { ForgotPasswordUseCase } from '../../../application/use-cases/ForgotPasswordUseCase';
import { ForgotAndResetPasswordControllerUtils } from './ControllerUtils';

export class ForgotPasswordController {
  constructor(private readonly forgotPasswordUseCase: ForgotPasswordUseCase) {}

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = (req.body ?? {}) as { email: string };

    try {
      const result = await this.forgotPasswordUseCase.execute(email);
      ForgotAndResetPasswordControllerUtils.sendSuccessResponse(res, result.message, { success: result.success });
    } catch (error) {
      ForgotAndResetPasswordControllerUtils.sendErrorResponse(res, error);
    }
  }
}
