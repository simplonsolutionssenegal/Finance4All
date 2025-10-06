import express, { type Request, type Response, type NextFunction, type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { logger } from '@/infrastructure/utils/logger';
import { errorMiddleware } from '@/infrastructure/web/middleware/error.middleware';
import { apiRoutes } from './routes';
import { clerkMiddleware } from '@clerk/express';

export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');

  app.use(helmet()); // Sécurité
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use('/api', clerkMiddleware());

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

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

  app.use(`/api/${process.env.API_VERSION ?? 'v1'}`, apiRoutes);

  // Route de santé
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Route 404
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      status: 'error',
      message: 'Route not found',
      path: req.originalUrl,
    });
  });

  app.use(errorMiddleware);

  return app;
};
