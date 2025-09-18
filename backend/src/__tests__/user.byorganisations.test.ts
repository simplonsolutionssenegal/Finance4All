// src/__tests__/user.byorganisations.test.ts
import request from 'supertest';
import express from 'express';
import { UserController } from '@/infrastructure/web/controllers/UserController';
import { clerkClient } from '@clerk/express';
import { ClerkUserRepository } from '@/infrastructure/database/ClerkUserRepository';
import { GetUsersByOrganisationUseCaseImpl } from '@/domain/use-cases/GetUsersByOrganisationUseCaseImpl';
import { UserService } from '@/infrastructure/web/services/user.service';

// ✅ Mock complet de clerkClient
jest.mock('@clerk/express', () => ({
  clerkClient: {
    users: {
      getUserList: jest.fn(),
    },
  },
}));

describe('UserController Integration', () => {
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
      publicMetadata: { organisation_id: 2, role: 'user' },
      lastSignInAt: null,
      lastActiveAt: null,
    },
  ];

  beforeAll(() => {
    // On cast pour TypeScript
    (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
      data: mockUsers,
    });

    app = express();
    const repo = new ClerkUserRepository();
    const getUsersUC = new GetUsersByOrganisationUseCaseImpl(repo);
    const userService = new UserService(getUsersUC, null as any);
    const userController = new UserController(userService);

    app.get(
      '/organisations/:organisationId/users',
      (req, res) => userController.getUsersByOrganisation(req, res)
    );
  });

  it('devrait retourner tous les utilisateurs d’une organisation', async () => {
    const res = await request(app).get('/organisations/1/users');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBe(1);
    expect(res.body.data[0].id).toBe('u1');
    expect(res.body.data[0].email).toBe('john@example.com');
    expect(res.body.data[0].role).toBe('admin');
    expect(res.body.data[0].status).toBe('ACTIF');
  });

  it('devrait retourner 400 pour un organisationId invalide', async () => {
    const res = await request(app).get('/organisations/abc/users');
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});
