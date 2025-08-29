import express from 'express';
import userRoutes from './infrastructure/web/routes/user.routes';
import { errorMiddleware } from './infrastructure/web/middleware/error.middleware';
import { config } from './config';

const app = express();
app.use(express.json());

app.use('/users', userRoutes);
app.use(errorMiddleware);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
