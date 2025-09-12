import express from 'express';
import { errorMiddleware } from './infrastructure/web/middleware/error.middleware';
import { config } from './infrastructure/config';
import { logger } from './utils/logger';
import { userRoutes } from './infrastructure/web/routes/user.routes';

const app = express();

// Désactiver l'en-tête X-Powered-By pour des raisons de sécurité
app.disable('x-powered-by');

app.use(express.json());

app.use('/users', userRoutes);
app.use(errorMiddleware);

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});