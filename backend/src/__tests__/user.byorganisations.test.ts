import express from 'express';
import request from 'supertest';

// 👇 on mock Prisma AVANT d'importer les routes
const findManyMock = jest.fn();

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn().mockImplementation(() => ({
            user: {
                findMany: findManyMock, // on ne stub que ce qui est utilisé par la route
            },
        })),
    };
});

// (facultatif) mock d'email pour éviter tout envoi réel ailleurs
// jest.mock('@/infrastructure/email/nodemailer.email.service', () => {
//   return { NodemailerEmailService: class { send = jest.fn().mockResolvedValue(undefined) } };
// });

// 👉 maintenant on peut importer la route réelle (qui câble controller/service/use-case/repo)
import { userRoutes } from '@/infrastructure/web/routes/user.routes';

describe('GET /organisations/:organisationId/users (integration)', () => {
    const app = express();
    app.use(express.json());
    app.use(userRoutes); // on monte les routes réelles

    beforeEach(() => {
        jest.clearAllMocks();
    });

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
            createdAt: new Date(), updatedAt: new Date()
        },
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-09-01T10:00:00Z'),
        ...overrides,
    });

    it('doit renvoyer la liste des utilisateurs (200)', async () => {
        // Arrange: on contrôle la réponse Prisma
        findManyMock.mockResolvedValue([
            prismaRow({ id: 1 }),
            prismaRow({ id: 2, email: 'jane@example.com', username: 'jane' }),
        ]);

        // Act
        const res = await request(app).get('/organisations/10/users');

        // Assert
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.results).toBe(2);
        expect(res.body.data[0]).toMatchObject({
            id: 1,
            email: 'john@example.com',
            username: 'john',
            role: 'manager',
            organisationId: 10,
        });

        // bonus: on vérifie le where envoyé à Prisma via le mock
        const args = findManyMock.mock.calls[0][0];
        expect(args.where).toEqual({ organisationId: 10 });
    });

    it('retourne 400 si organisationId est invalide', async () => {
        const res = await request(app).get('/organisations/abc/users');
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ status: 'fail', message: 'ID organisation invalide' });
        expect(findManyMock).not.toHaveBeenCalled();
    });

  
    it('retourne 500 si le repository rejette', async () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => { }); // mute
        findManyMock.mockRejectedValue(new Error('DB down'));
        const res = await request(app).get(`/organisations/10/users`);
        expect(res.status).toBe(500);
        expect(res.body.status).toBe('error');
        spy.mockRestore(); // unmute
    });

});
