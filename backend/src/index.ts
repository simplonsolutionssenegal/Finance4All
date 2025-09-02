import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { logger } from '@/utils/logger';
import { errorMiddleware } from '@/infrastructure/web/middleware/error.middleware';
import { apiRoutes } from '@/routes';
import { clerkMiddleware } from '@clerk/express';

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();
const PORT = process.env.PORT ?? 5000;
app.use(clerkMiddleware());

// Middleware globaux
app.use(helmet()); // Sécurité
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    // Evite no-unsafe-assignment: on loggue comme unknown
    logger.info(`${req.method} ${req.url}`, {
      body: req.body as unknown,
      query: req.query as unknown,
      params: req.params as unknown,
    });
    next();
  });
}

// Routes
app.use(`/api/${process.env.API_VERSION ?? 'v1'}`, apiRoutes);

// Route de santé
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Route 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Middleware de gestion d'erreurs
app.use(errorMiddleware);

// Démarrage du serveur (synchrone => plus de require-await / no-floating-promises)
function startServer(): void {
  try {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const stack = err instanceof Error ? err.stack : undefined;
    logger.error('Failed to start server', { message, stack, err });
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  // Si tu dois faire de l'async ici, utilise une IIFE :
  // void (async () => { await cleanup(); process.exit(0); })();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Démarrer l'application
startServer();

export default app;
