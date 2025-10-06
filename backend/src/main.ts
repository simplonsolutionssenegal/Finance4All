import 'reflect-metadata';
import { prisma } from '@/infrastructure/config/prismaClient';
import { createApp } from '@/infrastructure/web/app';
import { logger } from '@/infrastructure/utils/logger';

const PORT = process.env.PORT || 5001;

async function bootstrap() {
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

    const app = createApp();

    app.get('/health', async (req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          database: 'connected',
          environment: process.env.NODE_ENV || 'development',
        });
      } catch (_error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          error: 'Database connection failed',
        });
      }
    });

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

      try {
        await prisma.$disconnect();
        logger.info('✅ Database connections closed');
      } catch (error) {
        logger.error('❌ Error closing database connections:', error);
      }

      setTimeout(() => {
        logger.info('👋 Graceful shutdown completed');
        process.exit(0);
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

    process.exit(1);
  }
}

bootstrap();
