import 'reflect-metadata';
import { prisma } from '@/infrastructure/config/prismaClient';
import { logger } from '@/infrastructure/utils/logger';
import createApp from '@/infrastructure/web/app';
import { container, TYPES } from '@/infrastructure/config/container';
import type { MediaCleanupCronService } from '@/infrastructure/services/MediaCleanupCronService';
import type { MinioStorageService } from '@/infrastructure/services/MinioStorageService';
import type { StoragePort } from '@/domain/media/ports/out/StoragePort';

const PORT = process.env.PORT || 5001;

export const app = createApp();

export async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connection established via Prisma');

    // Vérifier que les migrations sont à jour (optionnel en dev)
    if (process.env.NODE_ENV === 'development') {
      try {
        // Tester la connexion en comptant les institutions
        const count = await prisma.institution.count();
        logger.info(`📊 Database ready with ${count} institutions`);
      } catch (_error) {
        logger.warn('⚠️ Database might need migration. Run: npm run prisma:migrate:dev');
      }
    }

    // Initialize MinIO buckets and public-read policies
    const storageService = container.get<StoragePort>(TYPES.StoragePort) as MinioStorageService;
    await storageService.initializeBuckets();
    logger.info('✅ MinIO buckets initialized');

    // Start media cleanup cron service
    const mediaCleanupCron = container.get<MediaCleanupCronService>(TYPES.MediaCleanupCronService);
    mediaCleanupCron.start();
    logger.info('✅ Media cleanup cron service started');

    const server = app.listen(PORT, () => {
      logger.info(`
╔═════════════════════════════════════════════════════════╗
║      🚀 Server Finance4All Successfully Started!        ║
╠═════════════════════════════════════════════════════════╣
║  Mode:        ${process.env.NODE_ENV || 'development'}
║  Port:        ${PORT}
║  Database:    PostgreSQL (via Prisma)
║
║  Endpoints:
║  Health:      http://localhost:${PORT}/health
║  API Base:    http://localhost:${PORT}/api/v1
║
║  Prisma Studio: npm run prisma:studio
╚════════════════════════════════════════════════════════════╝
      `);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        logger.info('✅ HTTP server closed');
      });

      // Stop media cleanup cron
      try {
        const mediaCleanupCron = container.get<MediaCleanupCronService>(
          TYPES.MediaCleanupCronService
        );
        mediaCleanupCron.stop();
        logger.info('✅ Media cleanup cron service stopped');
      } catch (error) {
        logger.error('❌ Error stopping media cleanup cron:', error);
      }

      try {
        await prisma.$disconnect();
        logger.info('✅ Database connections closed');
      } catch (error) {
        logger.error('❌ Error closing database connections:', error);
      }

      setTimeout(() => {
        logger.info('👋 Graceful shutdown completed');
        if (process.env.NODE_ENV !== 'test') {
          process.exit(0);
        }
      }, 5000); // 5 secondes max
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      if (process.env.NODE_ENV === 'production') {
        gracefulShutdown('UNHANDLED_REJECTION');
      }
    });

    process.on('uncaughtException', error => {
      logger.error('❌ Uncaught Exception:', error);
      if (process.env.NODE_ENV === 'production') {
        gracefulShutdown('UNCAUGHT_EXCEPTION');
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start application:', error);

    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      logger.error('❌ Failed to disconnect Prisma:', disconnectError);
    }

    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
