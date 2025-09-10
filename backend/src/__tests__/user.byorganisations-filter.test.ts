import express from 'express';
import request from 'supertest';

// ---- MOCK PRISMA (avant d'importer les routes)
const findManyMock = jest.fn();
const prismaMock = {
  user: {
    findMany: findManyMock,
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => prismaMock),
  UserStatus: {
    ACTIF: 'ACTIF',
    INACTIF: 'INACTIF',
    SUSPENDU: 'SUSPENDU',
  },
}));

// ---- IMPORT DES ROUTES RÉELLES

import { userRoutes } from '@/infrastructure/web/routes/user.routes';

describe('GET /organisations/:organisationId/users/filter (integration)', () => {
  const app = express();
  app.use(express.json());
  app.use(userRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper: ligne Prisma simulée
  const prismaRow = (overrides: any = {}) => ({
    id: 1,
    email: 'john@example.com',
    username: 'john',
    firstName: null,
    lastName: null,
    avatar: null,
    password: 'hashed',
    isActive: true,
    status: 'ACTIF',
    lastLoginAt: new Date('2025-09-01T10:00:00Z'),
    organisationId: 10,
    roleId: 2,
    role: { id: 2, name: 'manager', createdAt: new Date(), updatedAt: new Date() },
    organisation: {
      id: 10, name: 'Acme Inc.', avatar: null, address: '1 rue X', phone: '000',
      createdAt: new Date(), updatedAt: new Date(),
    },
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-09-01T10:00:00Z'),
    ...overrides,
  });

  it('200 — filtre par status + role', async () => {
    findManyMock.mockResolvedValue([
      prismaRow({ id: 1, status: 'ACTIF', role: { id: 3, name: 'admin' } }),
      prismaRow({ id: 2, status: 'ACTIF', role: { id: 3, name: 'admin' }, email: 'jane@example.com', username: 'jane' }),
    ]);

    const res = await request(app)
      .get('/organisations/10/users/filter')
      .query({ status: 'ACTIF', role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(2);

    // Vérifie le where construit pour Prisma
    const args = findManyMock.mock.calls[0][0];
    expect(args.where).toMatchObject({
      organisationId: 10,
      status: { in: ['ACTIF'] },
      role: { name: { in: ['admin'] } },
    });
  });

  it('200 — lastLogin=recent (7 derniers jours)', async () => {
    // Fige "now" pour rendre le test déterministe
    jest.useFakeTimers().setSystemTime(new Date('2025-09-10T12:00:00Z'));

    // Mock de la réponse avec des données valides
    findManyMock.mockResolvedValue([
      prismaRow({ 
        id: 1, 
        status: 'ACTIF',
        lastLoginAt: new Date('2025-09-08T10:00:00Z') 
      })
    ]);

    const res = await request(app)
      .get('/organisations/10/users/filter')
      .query({ lastLogin: 'recent' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const args = findManyMock.mock.calls[0][0];
    expect(args).toBeDefined();
    
    if (args?.where?.lastLoginAt?.gte) {
      const gte = new Date(args.where.lastLoginAt.gte);
      const expectedGte = new Date(new Date('2025-09-10T12:00:00Z').getTime() - 7 * 24 * 60 * 60 * 1000);
      expect(gte.toISOString()).toBe(expectedGte.toISOString());
    } else {
      throw new Error('lastLoginAt.gte est manquant dans la requête');
    }

    jest.useRealTimers();
  });

  it('200 — lastLogin=last_month (mois calendaire précédent)', async () => {
    // Fige "now": 10 sept 2025 → le mois précédent = août 2025
    jest.useFakeTimers().setSystemTime(new Date('2025-09-10T12:00:00Z'));

    // Mock de la réponse avec des données valides
    findManyMock.mockResolvedValue([
      prismaRow({ 
        id: 1, 
        status: 'ACTIF',
        lastLoginAt: new Date('2025-08-15T10:00:00Z')
      })
    ]);

    const res = await request(app)
      .get('/organisations/10/users/filter')
      .query({ lastLogin: 'last_month' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);

    const args = findManyMock.mock.calls[0][0];
    expect(args).toBeDefined();
    
    if (args?.where?.lastLoginAt) {
      const gte = new Date(args.where.lastLoginAt.gte);
      const lt = new Date(args.where.lastLoginAt.lt);
      
      expect(gte.toISOString()).toBe('2025-08-01T00:00:00.000Z');
      expect(lt.toISOString()).toBe('2025-09-01T00:00:00.000Z');
    } else {
      throw new Error('lastLoginAt est manquant dans la requête');
    }

    jest.useRealTimers();
  });

  it('400 — lastLogin=custom sans customDate', async () => {
    const res = await request(app)
      .get('/organisations/10/users/filter')
      .query({ lastLogin: 'custom' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: 'fail',
      message: 'Le paramètre customDate est requis pour le filtre de date personnalisé',
    });
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it('400 — customDate au mauvais format', async () => {
    const res = await request(app)
      .get('/organisations/10/users/filter')
      .query({ lastLogin: 'custom', customDate: '09-01-2025' }); // mauvais format

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Format de date invalide/i);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it('200 — customDate correct (YYYY-MM-DD)', async () => {
    // Mock de la réponse avec des données valides
    findManyMock.mockResolvedValue([
      prismaRow({ 
        id: 1, 
        status: 'ACTIF',
        lastLoginAt: new Date('2025-09-01T15:30:00Z')
      })
    ]);

    const res = await request(app)
      .get('/organisations/10/users/filter')
      .query({ lastLogin: 'custom', customDate: '2025-09-01' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const args = findManyMock.mock.calls[0][0];
    expect(args).toBeDefined();
    
    if (args?.where?.lastLoginAt) {
      const gte = new Date(args.where.lastLoginAt.gte);
      const lt = new Date(args.where.lastLoginAt.lt);
      
      expect(gte.toISOString()).toBe('2025-09-01T00:00:00.000Z');
      expect(lt.toISOString()).toBe('2025-09-02T00:00:00.000Z');
    } else {
      throw new Error('lastLoginAt est manquant dans la requête');
    }
  });

  it('400 — organisationId invalide', async () => {
    const res = await request(app).get('/organisations/abc/users/filter');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 'fail', message: 'ID organisation invalide' });
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it('500 — repo rejette', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {}); // silence logs
    findManyMock.mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .get('/organisations/10/users/filter')
      .query({ status: 'ACTIF' });

    expect(res.status).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/filtrage des utilisateurs/i);

    spy.mockRestore();
  });
});
