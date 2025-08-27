import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { logger } from '@/utils/logger';
import { errorMiddleware } from '@/middleware/error.middleware';
import { apiRoutes } from '@/routes';

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();
const PORT = process.env.PORT ?? 5000;

// Middleware globaux
app.use(helmet()); // Sécurité
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  });
}

// Routes
app.use(`/api/${process.env.API_VERSION ?? 'v1'}`, apiRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Middleware de gestion d'erreurs
app.use(errorMiddleware);

// Démarrage du serveur
const startServer = async () => {
  try {
    // Démarrer le serveur
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');

  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');

  process.exit(0);
});

// Démarrer l'application
startServer();

export default app;
