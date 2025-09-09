import { Response } from 'express';

export class ForgotAndResetPasswordControllerUtils {
  static sendSuccessResponse(res: Response, message: string, data: Record<string, unknown>): void {
    res.status(200).json({ status: 'success', message, data });
  }

  static sendErrorResponse(res: Response, error: unknown): void {
    res.status(400).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      data: { success: false },
    });
  }
}
