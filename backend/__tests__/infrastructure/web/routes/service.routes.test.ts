// __tests__/infrastructure/web/routes/service.routes.test.ts
import express from 'express';
import request from 'supertest';

// 1) Définir d'abord les fonctions mock pour éviter la TDZ
const mockByInstitutionExecute = jest.fn();
const mockFilterExecute = jest.fn();

// 2) Mocker les dépendances AVANT d'importer le routeur
jest.mock('@/infrastructure/database/PrismaServiceRepository', () => {
  return {
    PrismaServiceRepository: jest.fn().mockImplementation(() => ({})),
  };
});

jest.mock('@/domain/use-cases/GetServiceByInstitutionUseCaseImpl', () => {
  return {
    GetServiceByInstitutionUseCaseImpl: jest.fn().mockImplementation(() => ({
      execute: mockByInstitutionExecute, // ← utilise les constantes déjà définies
    })),
  };
});

jest.mock('@/domain/use-cases/FilterServicesUseCaseImpl', () => {
  return {
    FilterServicesUseCaseImpl: jest.fn().mockImplementation(() => ({
      execute: mockFilterExecute,
    })),
  };
});

// 3) Importer le routeur APRÈS les mocks (avec require pour garantir l'ordre)
const { serviceRoutes } = require('@/infrastructure/web/routes/service.routes');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/service', serviceRoutes);
  return app;
}

describe('serviceRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /by-institution/:institutionId', () => {
    it('200 | appelle le use-case avec le bon id et renvoie la forme attendue', async () => {
      const fakeServices = [
        {
          id: 1,
          designation: 'Crédit Agricole',
          montantMin: 1000,
          montantMax: 5000,
          type: 'CREDIT',
          modesRemboursement: 'AGENCE',
          institutionId: 42,
          zoneId: 10,
          createdAt: new Date('2025-01-01T00:00:00Z'),
          updatedAt: new Date('2025-09-01T00:00:00Z'),
        },
      ];
      mockByInstitutionExecute.mockResolvedValueOnce(fakeServices);

      const app = makeApp();
      const res = await request(app).get('/api/v1/service/by-institution/42');

      expect(res.status).toBe(200);
      expect(mockByInstitutionExecute).toHaveBeenCalledTimes(1);
      expect(mockByInstitutionExecute).toHaveBeenCalledWith(42);

      expect(res.body).toMatchObject({ status: 'success', results: 1 });
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toEqual(
        expect.objectContaining({ id: 1, designation: 'Crédit Agricole', institutionId: 42 })
      );
    });

    it('400 | institutionId invalide → ne doit pas appeler le use-case', async () => {
      const app = makeApp();

      const res1 = await request(app).get('/api/v1/service/by-institution/0');
      const res2 = await request(app).get('/api/v1/service/by-institution/abc');

      expect(res1.status).toBe(400);
      expect(res2.status).toBe(400);
      expect(mockByInstitutionExecute).not.toHaveBeenCalled();
    });

    it('500 | si le use-case jette une erreur', async () => {
      mockByInstitutionExecute.mockRejectedValueOnce(new Error('DB down'));

      const app = makeApp();
      const res = await request(app).get('/api/v1/service/by-institution/42');

      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({ status: 'error', message: expect.any(String) })
      );
    });
  });

  describe('GET /by-institution/:institutionId/filter', () => {
    it('200 | parse type[]=CREDIT&EPARGNE&zone=10&from=2025-01-01 et appelle le bon use-case (objet)', async () => {
      const fakeFiltered = [
        {
          id: 2,
          designation: 'Épargne Plus',
          montantMin: 0,
          montantMax: 0,
          type: 'EPARGNE',
          modesRemboursement: 'USSD',
          institutionId: 42,
          zoneId: 10,
          createdAt: new Date('2025-02-01T00:00:00Z'),
          updatedAt: new Date('2025-09-02T00:00:00Z'),
        },
      ];
      mockFilterExecute.mockResolvedValueOnce(fakeFiltered);

      const app = makeApp();
      const res = await request(app).get(
        '/api/v1/service/by-institution/42/filter?type=CREDIT&type=EPARGNE&zone=10&from=2025-01-01'
      );

      expect(res.status).toBe(200);
      expect(mockFilterExecute).toHaveBeenCalledTimes(1);

      const payload = (mockFilterExecute as jest.Mock).mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({
          institutionId: 42,
          types: ['CREDIT', 'EPARGNE'],
          zoneId: 10,
        })
      );

      // fromDate si le contrôleur la transmet
      if (payload.fromDate !== undefined) {
        expect(payload.fromDate).toBeInstanceOf(Date);
        expect(payload.fromDate.toISOString().slice(0, 10)).toBe('2025-01-01');
      }

      expect(res.body).toMatchObject({ status: 'success', results: 1 });
      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          id: 2,
          designation: 'Épargne Plus',
          type: 'EPARGNE',
          institutionId: 42,
          zoneId: 10,
        })
      );
    });

    it('400 | institutionId invalide sur /filter', async () => {
      const app = makeApp();
      const res = await request(app).get('/api/v1/service/by-institution/abc/filter');

      expect(res.status).toBe(400);
      expect(mockFilterExecute).not.toHaveBeenCalled();
    });

    it('200 | query vide → passe seulement institutionId (objet)', async () => {
      mockFilterExecute.mockResolvedValueOnce([]);

      const app = makeApp();
      const res = await request(app).get('/api/v1/service/by-institution/7/filter');

      expect(res.status).toBe(200);
      expect(mockFilterExecute).toHaveBeenCalledTimes(1);

      const payload = (mockFilterExecute as jest.Mock).mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({
          institutionId: 7,
          types: undefined,
          zoneId: undefined,
        })
      );
      expect(payload.fromDate).toBeUndefined();
    });

    it('500 | si le use-case filtre jette une erreur', async () => {
      mockFilterExecute.mockRejectedValueOnce(new Error('Repo KO'));

      const app = makeApp();
      const res = await request(app).get('/api/v1/service/by-institution/42/filter');

      expect(res.status).toBe(500);
      expect(res.body.status).toBe('error');
    });
  });
});
