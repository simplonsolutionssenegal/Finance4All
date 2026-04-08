import type { NextFunction, Request, Response } from 'express';
import { getAuth } from '@clerk/express';

/**
 * Lightweight auth guard — only checks that the request has a valid userId.
 * Use this for user-scoped endpoints that don't depend on an organization
 * (e.g. media progress tracking).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    return next();
  } catch (e) {
    return next(e);
  }
}
