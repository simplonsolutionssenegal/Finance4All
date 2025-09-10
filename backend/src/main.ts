import express from 'express';
import userRoutes from './infrastructure/web/routes/user.routes';
import institutionFinanciereRoutes from './infrastructure/web/routes/institutionFinanciere.routes';
import { errorMiddleware } from './infrastructure/web/middleware/error.middleware';
import { config } from './infrastructure/config';
import { logger } from './utils/logger';

const app = express();

// Désactiver l'en-tête X-Powered-By pour des raisons de sécurité
app.disable('x-powered-by');

app.use(express.json());

// Routes API
app.use('/users', userRoutes);
app.use('/institutions', institutionFinanciereRoutes);

// Middleware de gestion des erreurs
app.use(errorMiddleware);

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
