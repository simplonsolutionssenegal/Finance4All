import { Request, Response } from 'express';
import { UserController } from '@/infrastructure/web/controllers/UserController';

// --- helpers pour mocker Response ---
function createRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock };
}

// --- user de domaine “fake” pour les retours du service ---
function makeDomainUser(overrides: Partial<any> = {}) {
  const now = new Date();
  return {
    id: 1,
    email: 'john.doe@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://example.com/img.png',
    isActive: true,
    lastLoginAt: now,
    status: 'ACTIF',
    role: { id: 10, name: 'admin', createdAt: now, updatedAt: now },
    organisationId: 37,
    organisation: {
      id: 37,
      name: 'Org X',
      avatar: null,
      address: 'Adresse',
      phone: '770000000',
      createdAt: now,
      updatedAt: now,
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('UserController', () => {
  const service = {
    getUsersByOrganisation: jest.fn(),
    getUsersByOrganisationAndStatus: jest.fn(),
  };

  let controller: UserController;

  beforeEach(() => {
    jest.resetAllMocks();
    controller = new UserController(service as any);
  });

  // ---------------- getUsersByOrganisation ----------------

  it('400 si organisationId invalide (NaN)', async () => {
    const req = { params: { organisationId: 'NaN' } } as unknown as Request;
    const res = createRes();

    await controller.getUsersByOrganisation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        message: 'ID organisation invalide',
      }),
    );
  });

  it('200 + payload mappé', async () => {
    const req = { params: { organisationId: '37' } } as unknown as Request;
    const res = createRes();

    service.getUsersByOrganisation.mockResolvedValue([makeDomainUser()]);

    await controller.getUsersByOrganisation(req, res);

    expect(service.getUsersByOrganisation).toHaveBeenCalledWith(37);
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json.mock.calls[0] as any[])[0];
    expect(payload.status).toBe('success');
    expect(payload.results).toBe(1);
    expect(payload.data[0]).toEqual(
      expect.objectContaining({
        email: 'john.doe@example.com',
        role: 'admin',
        organisationId: 37,
      }),
    );
  });

  it('400 si service throw (chemin de catch)', async () => {
    const req = { params: { organisationId: '37' } } as unknown as Request;
    const res = createRes();
    service.getUsersByOrganisation.mockRejectedValue(new Error('boom'));

    await controller.getUsersByOrganisation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Une erreur est survenue lors du filtrage des utilisateurs',
      }),
    );
  });

  // -------------- getUsersByOrganisationFilter --------------

  it('200 | filtre lastLogin=recent + status[]=ACTIF + role[]=admin', async () => {
    const req = {
      params: { organisationId: '37' },
      query: { lastLogin: 'recent', status: 'ACTIF', role: 'admin' },
    } as unknown as Request;
    const res = createRes();

    service.getUsersByOrganisationAndStatus.mockResolvedValue([makeDomainUser()]);

    await controller.getUsersByOrganisationFilter(req, res);

    expect(service.getUsersByOrganisationAndStatus).toHaveBeenCalledWith(
      37,
      ['ACTIF'],
      ['admin'],
      { type: 'recent' },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json.mock.calls[0] as any[])[0];
    expect(payload.results).toBe(1);
  });

  it('200 | filtre lastLogin=last_month (roles multiples)', async () => {
    const req = {
      params: { organisationId: '37' },
      query: { lastLogin: 'last_month', role: ['admin', 'manager'] },
    } as unknown as Request;
    const res = createRes();

    service.getUsersByOrganisationAndStatus.mockResolvedValue([makeDomainUser()]);

    await controller.getUsersByOrganisationFilter(req, res);

    expect(service.getUsersByOrganisationAndStatus).toHaveBeenCalledWith(
      37,
      [], // pas de status
      ['admin', 'manager'],
      { type: 'last_month' },
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('400 | filtre lastLogin=custom sans customDate', async () => {
    const req = {
      params: { organisationId: '37' },
      query: { lastLogin: 'custom' },
    } as unknown as Request;
    const res = createRes();

    await controller.getUsersByOrganisationFilter(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        message:
          'Le paramètre customDate est requis pour le filtre de date personnalisé',
      }),
    );
  });

  it('400 | filtre lastLogin=custom avec date invalide', async () => {
    const req = {
      params: { organisationId: '37' },
      query: { lastLogin: 'custom', customDate: '2025/09/01' }, // mauvais format
    } as unknown as Request;
    const res = createRes();

    await controller.getUsersByOrganisationFilter(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        message:
          'Format de date invalide. Utilisez YYYY-MM-DD (ex: 2025-09-01)',
      }),
    );
  });

  it('200 | filtre lastLogin=custom avec date OK', async () => {
    const req = {
      params: { organisationId: '37' },
      query: { lastLogin: 'custom', customDate: '2025-09-01' },
    } as unknown as Request;
    const res = createRes();

    service.getUsersByOrganisationAndStatus.mockResolvedValue([makeDomainUser()]);

    await controller.getUsersByOrganisationFilter(req, res);

    expect(service.getUsersByOrganisationAndStatus).toHaveBeenCalledWith(
      37,
      [], // pas de status
      undefined, // pas de role
      { type: 'custom_date', date: new Date('2025-09-01T00:00:00.000Z') },
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('500 si service throw (chemin de catch filtre)', async () => {
    const req = {
      params: { organisationId: '37' },
      query: {},
    } as unknown as Request;
    const res = createRes();

    service.getUsersByOrganisationAndStatus.mockRejectedValue(new Error('boom'));

    await controller.getUsersByOrganisationFilter(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message:
          'Une erreur est survenue lors du filtrage des utilisateurs',
      }),
    );
  });
});
