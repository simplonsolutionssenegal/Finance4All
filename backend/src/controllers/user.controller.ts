import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@/infrastructure/web/middleware/error.middleware';

export class UserController {
  static readonly getUsers = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      res.json({
        status: 'success',
        data: []
      });
    }
  );
}
