// src/__tests__/infrastructure/web/controllers/UserController.test.ts
import { Request, Response } from 'express';
import { UserController } from '@/infrastructure/web/controllers/UserController';
import { UserService } from '@/infrastructure/web/services/user.service';
import { UserStatus } from '@prisma/client';
import { Role } from '@/domain/entities/Role';
import { Organisation } from '@/domain/entities/Organisation';
import { User as DomainUser } from '@/domain/entities/User';

describe('UserController (unit)', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  const makeRes = () => {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    return res as Response & { status: jest.Mock; json: jest.Mock };
  };

  const makeUser = (overrides: Partial<DomainUser> = {}): DomainUser => {
    const role = new Role(1, 'ADMIN', new Date('2024-01-01'), new Date('2024-01-02'));
    const org = new Organisation(
      37,
      'OrgName',
      'avatar.png',
      'Addr',
      '0000',
      new Date('2024-01-01'),
      new Date('2024-01-02'),
    );

    const base = new DomainUser(
      10,
      'user@example.com',
      'userx',
      'John',
      'Doe',
      'avatar.png',
      'hashed',
      true,
      role,
      UserStatus.ACTIF,
      new Date('2025-01-01T00:00:00.000Z'),
      37,
      org,
      new Date('2024-02-01T00:00:00.000Z'),
      new Date('2024-02-02T00:00:00.000Z'),
    );

    return Object.assign(base, overrides);
  };

  beforeEach(() => {
    service = {
      getUsersByOrganisation: jest.fn(),
      getUsersByOrganisationAndStatus: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    controller = new UserController(service);
    jest.clearAllMocks();
  });

  describe('getUsersByOrganisation', () => {
    it('200 — renvoie la liste mappée', async () => {
      const req = { params: { organisationId: '37' } } as unknown as Request;
      const res = makeRes();

      service.getUsersByOrganisation.mockResolvedValue([makeUser()]);

      await controller.getUsersByOrganisation(req, res);

      expect(service.getUsersByOrganisation).toHaveBeenCalledWith(37);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          results: 1,
          data: [
            expect.objectContaining({
              id: 10,
              email: 'user@example.com',
              username: 'userx',
              firstName: 'John',
              lastName: 'Doe',
              status: UserStatus.ACTIF,
              role: 'ADMIN',
              organisationId: 37,
              organisation: expect.objectContaining({ id: 37, name: 'OrgName' }),
            }),
          ],
        }),
      );
    });

    it('400 — organisationId invalide', async () => {
      const req = { params: { organisationId: 'abc' } } as unknown as Request;
      const res = makeRes();

      await controller.getUsersByOrganisation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'ID organisation invalide',
      });
      expect(service.getUsersByOrganisation).not.toHaveBeenCalled();
    });

    it("400 — catch d'erreur → message générique (selon code actuel)", async () => {
      const req = { params: { organisationId: '37' } } as unknown as Request;
      const res = makeRes();

      service.getUsersByOrganisation.mockRejectedValue(new Error('DB down'));

      await controller.getUsersByOrganisation(req, res);

      // ✅ le controller courant renvoie un 400 avec message générique
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Une erreur est survenue lors du filtrage des utilisateurs',
        message: 'Erreur inconnue',
      });
    });
  });

  describe('getUsersByOrganisationFilter', () => {
    it('200 — accepte status[], role[], lastLogin=recent', async () => {
      const req = {
        params: { organisationId: '37' },
        query: {
          status: [UserStatus.ACTIF, UserStatus.EN_ATTENTE],
          role: ['ADMIN', 'USER'],
          lastLogin: 'recent',
        },
      } as unknown as Request;
      const res = makeRes();

      service.getUsersByOrganisationAndStatus.mockResolvedValue([makeUser()]);

      await controller.getUsersByOrganisationFilter(req, res);

      expect(service.getUsersByOrganisationAndStatus).toHaveBeenCalledWith(
        37,
        [UserStatus.ACTIF, UserStatus.EN_ATTENTE],
        ['ADMIN', 'USER'],
        { type: 'recent' },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'success', results: 1 }),
      );
    });

    it('200 — accepte status et role en string simples', async () => {
      const req = {
        params: { organisationId: '37' },
        query: { status: UserStatus.SUSPENDU, role: 'MANAGER' },
      } as unknown as Request;
      const res = makeRes();

      service.getUsersByOrganisationAndStatus.mockResolvedValue([makeUser()]);

      await controller.getUsersByOrganisationFilter(req, res);

      expect(service.getUsersByOrganisationAndStatus).toHaveBeenCalledWith(
        37,
        [UserStatus.SUSPENDU],
        ['MANAGER'],
        undefined,
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('400 — organisationId invalide', async () => {
      const req = { params: { organisationId: 'NaN' }, query: {} } as unknown as Request;
      const res = makeRes();

      await controller.getUsersByOrganisationFilter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'ID organisation invalide',
      });
      expect(service.getUsersByOrganisationAndStatus).not.toHaveBeenCalled();
    });

    it('400 — lastLogin=custom sans customDate', async () => {
      const req = {
        params: { organisationId: '37' },
        query: { lastLogin: 'custom' },
      } as unknown as Request;
      const res = makeRes();

      await controller.getUsersByOrganisationFilter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Le paramètre customDate est requis pour le filtre de date personnalisé',
      });
      expect(service.getUsersByOrganisationAndStatus).not.toHaveBeenCalled();
    });

    it('400 — customDate format invalide', async () => {
      const req = {
        params: { organisationId: '37' },
        query: { lastLogin: 'custom', customDate: '13-2025-01' },
      } as unknown as Request;
      const res = makeRes();

      await controller.getUsersByOrganisationFilter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Format de date invalide. Utilisez le format YYYY-MM-DD (ex: 2025-09-01)',
      });
      expect(service.getUsersByOrganisationAndStatus).not.toHaveBeenCalled();
    });

    it('400 — customDate non-parsable', async () => {
      const req = {
        params: { organisationId: '37' },
        query: { lastLogin: 'custom', customDate: '2025-13-40' },
      } as unknown as Request;
      const res = makeRes();

      await controller.getUsersByOrganisationFilter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Date invalide',
      });
      expect(service.getUsersByOrganisationAndStatus).not.toHaveBeenCalled();
    });

    it('500 — service rejette', async () => {
      const req = {
        params: { organisationId: '37' },
        query: { status: UserStatus.INACTIF, role: 'VIEWER' },
      } as unknown as Request;
      const res = makeRes();

      service.getUsersByOrganisationAndStatus.mockRejectedValue(new Error('boom'));

      await controller.getUsersByOrganisationFilter(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Une erreur est survenue lors du filtrage des utilisateurs',
      });
    });
  });
});
