// on a besoin de contrôler ce que renvoie createApp().listen()
const closeMock = jest.fn((cb?: () => void) => {
  if (cb) cb();
});
const listenMock = jest.fn((_port: number | string, cb?: () => void) => {
  if (cb) cb();
  return { close: closeMock };
});

jest.mock('@/infrastructure/config/prismaClient', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    institution: {
      count: jest.fn(),
    },
  },
}));

jest.mock('@/infrastructure/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/infrastructure/web/app', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    listen: listenMock,
  })),
}));

describe('bootstrap()', () => {
  const OLD_ENV = process.env;
  let prisma: any;
  let logger: any;

  beforeEach(() => {
    jest.resetModules(); // rechargera le module main à chaque test

    // Re-require mocks after reset to get the new instances for each test
    prisma = require('@/infrastructure/config/prismaClient').prisma;
    logger = require('@/infrastructure/utils/logger').logger;

    jest.useFakeTimers();
    process.env = { ...OLD_ENV, NODE_ENV: 'test' }; // empêcher l’auto-bootstrap
    listenMock.mockClear();
    closeMock.mockClear();
    prisma.$connect.mockReset();
    prisma.$disconnect.mockReset();
    prisma.institution.count.mockReset();
    logger.info.mockReset();
    logger.warn.mockReset();
    logger.error.mockReset();
  });

  afterEach(() => {
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGINT');
    process.removeAllListeners('unhandledRejection');
    process.removeAllListeners('uncaughtException');
    jest.useRealTimers();
    process.env = OLD_ENV;
  });

  it('démarre correctement: connecte Prisma et lance le serveur sur le port par défaut (5001)', async () => {
    const { bootstrap } = await import('@/main');

    prisma.$connect.mockResolvedValue(undefined);
    prisma.institution.count.mockResolvedValue(0);

    await bootstrap();

    expect(prisma.$connect).toHaveBeenCalledTimes(1);
    // Par défaut, PORT non défini -> 5001
    expect(listenMock).toHaveBeenCalledTimes(1);
    expect(listenMock.mock.calls[0][0]).toBe(5001);

    // quelques logs clés appelés
    expect(logger.info).toHaveBeenCalledWith('✅ Database connection established via Prisma');
  });

  it('utilise le port provenant de process.env.PORT', async () => {
    process.env.PORT = '8088';
    const { bootstrap } = await import('@/main');

    prisma.$connect.mockResolvedValue(undefined);
    prisma.institution.count.mockResolvedValue(3);

    await bootstrap();

    expect(listenMock).toHaveBeenCalledWith('8088', expect.any(Function));
  });

  it('en mode development: appelle institution.count et log le total', async () => {
    const { bootstrap } = await import('@/main');

    process.env.NODE_ENV = 'development';
    prisma.$connect.mockResolvedValue(undefined);
    prisma.institution.count.mockResolvedValue(5);

    await bootstrap();

    expect(prisma.institution.count).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('📊 Database ready with 5 institutions')
    );
  });

  it('en mode development: log un warning si count échoue (migrations manquantes)', async () => {
    const { bootstrap } = await import('@/main');

    process.env.NODE_ENV = 'development';
    prisma.$connect.mockResolvedValue(undefined);
    prisma.institution.count.mockRejectedValue(new Error('boom'));

    await bootstrap();

    expect(logger.warn).toHaveBeenCalledWith(
      '⚠️ Database might need migration. Run: npm run prisma:migrate:dev'
    );
  });

  it('si la connexion Prisma échoue au démarrage: log error et tente un disconnect', async () => {
    const { bootstrap } = await import('@/main');

    prisma.$connect.mockRejectedValue(new Error('connect failed'));
    prisma.$disconnect.mockResolvedValue(undefined);

    await bootstrap();

    expect(logger.error).toHaveBeenCalledWith('❌ Failed to start application:', expect.any(Error));
    expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
  });

  it('unhandledRejection en dev ne déclenche PAS graceful shutdown', async () => {
    const { bootstrap } = await import('@/main');

    process.env.NODE_ENV = 'development'; // not 'production'

    prisma.$connect.mockResolvedValue(undefined);
    await bootstrap();

    process.emit('unhandledRejection', new Error('oops'), Promise.resolve());

    jest.advanceTimersByTime(5000);

    expect(logger.error).toHaveBeenCalledWith(
      '❌ Unhandled Rejection at:',
      expect.any(Promise),
      'reason:',
      expect.any(Error)
    );
    // graceful shutdown should not have been called
    expect(closeMock).not.toHaveBeenCalled();
    expect(prisma.$disconnect).not.toHaveBeenCalled();
  });

  it('uncaughtException en dev ne déclenche PAS graceful shutdown', async () => {
    const { bootstrap } = await import('@/main');

    process.env.NODE_ENV = 'development'; // not 'production'

    prisma.$connect.mockResolvedValue(undefined);
    await bootstrap();

    process.emit('uncaughtException', new Error('boom'));

    jest.advanceTimersByTime(5000);

    expect(logger.error).toHaveBeenCalledWith('❌ Uncaught Exception:', expect.any(Error));
    // graceful shutdown should not have been called
    expect(closeMock).not.toHaveBeenCalled();
    expect(prisma.$disconnect).not.toHaveBeenCalled();
  });

  it('si la connexion Prisma et le disconnect échouent au démarrage: log les deux erreurs', async () => {
    const { bootstrap } = await import('@/main');

    prisma.$connect.mockRejectedValue(new Error('connect failed'));
    prisma.$disconnect.mockRejectedValue(new Error('disconnect failed'));

    await bootstrap();

    expect(logger.error).toHaveBeenCalledWith('❌ Failed to start application:', expect.any(Error));
    expect(logger.error).toHaveBeenCalledWith('❌ Failed to disconnect Prisma:', expect.any(Error));
    expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
  });

  it('si la connexion Prisma échoue en production: exit avec code 1', async () => {
    const { bootstrap } = await import('@/main');
    process.env.NODE_ENV = 'production';
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(((_code?: number) => {
      return undefined as never;
    }) as any);

    prisma.$connect.mockRejectedValue(new Error('connect failed'));

    await bootstrap();

    expect(logger.error).toHaveBeenCalledWith('❌ Failed to start application:', expect.any(Error));
    expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });
});
