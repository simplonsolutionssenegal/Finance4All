import cron from 'node-cron';
import { TokenModel } from '../models/schemas/token.schema';

export const scheduleTokenCleanup = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Nettoyage des tokens expirés en cours...');
    const result = await TokenModel.deleteMany({
      expiresAt: { $lte: new Date() },
    });
    console.log(`[CRON] ${result.deletedCount} tokens expirés supprimés.`);
  });
};
