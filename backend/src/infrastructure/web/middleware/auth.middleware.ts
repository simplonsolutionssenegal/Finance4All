import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  role: string;
}

export const authMiddleware = (allowedRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Accès non autorisé. Token manquant.',
        });
        return;
      }

      const token = authHeader.split(' ')[1];

      try {
        const secret = process.env.JWT_SECRET ?? 'your-secret-key';
        const decoded = jwt.verify(token, secret) as JwtPayload;

        // Attacher l'utilisateur à la requête
        req.user = {
          id: decoded.userId,
          role: decoded.role,
        };

        // Vérifier si l'utilisateur a le rôle requis
        if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
          res.status(403).json({
            success: false,
            message: 'Vous n\'avez pas les droits suffisants pour accéder à cette ressource.',
          });
          return;
        }

        next();
      } catch {
        res.status(401).json({
          success: false,
          message: 'Token invalide ou expiré.',
        });
      }
    } catch {
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
      });
    }
  };
};

// L'interface Request est étendue dans src/types/express.d.ts
