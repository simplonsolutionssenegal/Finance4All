import { z } from 'zod';

// On mock dotenv pour ne pas polluer process.env globalement
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Environment Schema', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // important pour recharger le module env
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should parse environment variables correctly when all are provided', async () => {
    process.env = {
      NODE_ENV: 'production',
      PORT: '8080',
      DB_HOST: 'db.example.com',
      DB_PORT: '6543',
      DB_USER: 'admin',
      DB_PASSWORD: 'secret',
      DB_NAME: 'fin4all',
      LOG_LEVEL: 'debug',
    };

    const { env } = await import('@/infrastructure/config/env.config');
    expect(env.NODE_ENV).toBe('production');
    expect(env.PORT).toBe('8080');
    expect(env.DB_HOST).toBe('db.example.com');
    expect(env.DB_PORT).toBe('6543');
    expect(env.DB_USER).toBe('admin');
    expect(env.DB_PASSWORD).toBe('secret');
    expect(env.DB_NAME).toBe('fin4all');
    expect(env.LOG_LEVEL).toBe('debug');
  });

  it('should apply default values when optional vars are missing', async () => {
    process.env = {
      DB_PASSWORD: 'secret',
    };

    const { env } = await import('@/infrastructure/config/env.config');

    expect(env.NODE_ENV).toBe('development'); // default
    expect(env.PORT).toBe('3000');
    expect(env.DB_HOST).toBe('localhost');
    expect(env.DB_PORT).toBe('5432');
    expect(env.DB_USER).toBe('postgres');
    expect(env.DB_NAME).toBe('financial4All');
    expect(env.DB_PASSWORD).toBe('secret');
    expect(env.LOG_LEVEL).toBe('info');
  });

  it('should throw if DB_PASSWORD is missing', async () => {
    process.env = {};

    // rechargement dynamique pour forcer le parse et attraper l'erreur
    await expect(import('@/infrastructure/config/env.config')).rejects.toThrow(z.ZodError);
  });

  it('should throw if NODE_ENV has invalid value', async () => {
    process.env = {
      NODE_ENV: 'staging', // ❌ invalide
      DB_PASSWORD: 'secret',
    };

    await expect(import('@/infrastructure/config/env.config')).rejects.toThrow(z.ZodError);
  });

  it('should throw if LOG_LEVEL has invalid value', async () => {
    process.env = {
      DB_PASSWORD: 'secret',
      LOG_LEVEL: 'trace', // ❌ invalide
    };

    await expect(import('@/infrastructure/config/env.config')).rejects.toThrow(z.ZodError);
  });
});
