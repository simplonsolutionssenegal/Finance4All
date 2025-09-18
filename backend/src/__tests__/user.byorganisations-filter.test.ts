// src/__tests__/user.byorganisation.filter.test.ts
import request from 'supertest';
import express from 'express';
import { UserController } from '@/infrastructure/web/controllers/UserController';
import { clerkClient } from '@clerk/express';
import { ClerkUserRepository } from '@/infrastructure/database/ClerkUserRepository';
import { GetUsersByOrganisationAndStatusUseCaseImpl } from '@/domain/use-cases/GetUsersByOrganisationAndStatusUseCaseImpl';
import { UserService } from '@/infrastructure/web/services/user.service';

// Mock du module clerk
jest.mock('@clerk/express', () => ({
  clerkClient: {
    users: {
      getUserList: jest.fn(),
    },
  },
}));

describe('UserController Integration - Filter', () => {
  let app: express.Express;

  const mockUsers = [
    {
      id: 'u1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      username: 'john_doe',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
      publicMetadata: { organisation_id: 1, role: 'admin' },
      lastSignInAt: Date.now(),
      lastActiveAt: Date.now(),
    },
    {
      id: 'u2',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      username: 'jane_smith',
      firstName: 'Jane',
      lastName: 'Smith',
      emailAddresses: [{ emailAddress: 'jane@example.com' }],
      publicMetadata: { organisation_id: 1, role: 'user' },
      lastSignInAt: null,
      lastActiveAt: null,
    },
  ];

  beforeAll(() => {
    // Mock du getUserList
    (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({ data: mockUsers });

    app = express();
    const repo = new ClerkUserRepository();
    const getUsersByOrgAndStatusUC = new GetUsersByOrganisationAndStatusUseCaseImpl(repo);
    const userService = new UserService(null as any, getUsersByOrgAndStatusUC);
    const userController = new UserController(userService);

    app.get(
      '/organisations/:organisationId/users/filter',
      (req, res) => userController.getUsersByOrganisationFilter(req, res)
    );
  });

  it('devrait retourner tous les utilisateurs avec filtre status=ACTIF', async () => {
    const res = await request(app)
      .get('/organisations/1/users/filter')
      .query({ status: 'ACTIF' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBe(1);
    expect(res.body.data[0].id).toBe('u1');
    expect(res.body.data[0].status).toBe('ACTIF');
  });

  it('devrait filtrer par role', async () => {
    const res = await request(app)
      .get('/organisations/1/users/filter')
      .query({ role: 'user' });

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.data[0].id).toBe('u2');
    expect(res.body.data[0].role).toBe('user');
  });

  it('devrait filtrer par lastLogin recent', async () => {
    const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).getTime();
    mockUsers[0].lastSignInAt = recentDate;
    mockUsers[1].lastSignInAt = recentDate - 10 * 24 * 60 * 60 * 1000;

    const res = await request(app)
      .get('/organisations/1/users/filter')
      .query({ lastLogin: 'recent' });

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.data[0].id).toBe('u1');
  });

  it('devrait retourner 400 pour organisationId invalide', async () => {
    const res = await request(app).get('/organisations/abc/users/filter');
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('devrait retourner 400 si customDate manquant pour lastLogin=custom', async () => {
    const res = await request(app)
      .get('/organisations/1/users/filter')
      .query({ lastLogin: 'custom' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('devrait filtrer par lastLogin=custom_date', async () => {
    const date = new Date();
    const res = await request(app)
      .get('/organisations/1/users/filter')
      .query({ lastLogin: 'custom', customDate: date.toISOString() });

    expect(res.status).toBe(200);
  });
});
