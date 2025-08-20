import { TokenModel } from '../models/schemas/token.schema';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanupExpiredTokens = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);

    const result = await TokenModel.deleteMany({
      expiresAt: { $lte: new Date() },
    });

    console.log(`[Worker] ${result.deletedCount} tokens expirés supprimés.`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('[Worker] Erreur lors du cleanup des tokens :', error);
    process.exit(1);
  }
};

cleanupExpiredTokens();
