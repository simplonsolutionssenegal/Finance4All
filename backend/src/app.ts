import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/error.middleware';
import { scheduleTokenCleanup } from './config/cron';
import organisationRoutes from './routes/organisation.routes';
import adminRoutes from './routes/admin.routes';
import countryRoutes from './routes/country.routes';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);
scheduleTokenCleanup();


// TODO: Ajouter routes ici
app.use('/api/auth', authRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/countries', countryRoutes);


app.get('/', (req, res) => {
  res.send('API fonctionnelle');
});

export default app;
