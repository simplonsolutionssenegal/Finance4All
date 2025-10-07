// __tests__/infrastructure/web/routes/product.routes.test.ts
import express from 'express';
import request from 'supertest';

const mockByInstitutionExecute = jest.fn();
const mockFilterExecute = jest.fn();

jest.mock('@/infrastructure/database/PrismaProductRepository', () => {
  return {
    PrismaProductRepository: jest.fn().mockImplementation(() => ({})),
  };
});

jest.mock('@/domain/use-cases/GetProductByInstitutionUseCaseImpl', () => {
  return {
    GetProductByInstitutionUseCaseImpl: jest.fn().mockImplementation(() => ({
      execute: mockByInstitutionExecute,
    })),
  };
});

jest.mock('@/domain/use-cases/FilterProductUseCaseImpl', () => {
  return {
    FilterProductUseCaseImpl: jest.fn().mockImplementation(() => ({
      execute: mockFilterExecute,
    })),
  };
});

const { productRoutes } = require('@/infrastructure/web/routes/product.routes');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/service', productRoutes);
  return app;
}

const INST_OK = '99e13ab0-b2df-423f-ba5b-c847c1dc0fef';
const INST_EMPTY = '4f5a2f2a-1b2c-4d5e-8a9b-0c1d2e3f4a5b';
const INST_ERR = '19f3dc54-5e2a-4a4f-9c0d-8d0f8a1b2c3d';

describe('productRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /by-institution/:institutionId', () => {
    it('200 | appelle le use-case avec le bon id (UUID) et renvoie la forme attendue', async () => {
      const fakeProducts = [
        {
          id: 'p1',
          designation: 'Crédit Agricole',
          montantMin: 1000,
          montantMax: 5000,
          type: 'CREDIT',
          modesRemboursement: 'AGENCE',
          institutionId: INST_OK,
          zone: 'Dakar',
          createdAt: new Date('2025-01-01T00:00:00Z'),
          updatedAt: new Date('2025-09-01T00:00:00Z'),
        },
        {
          id: 'p2',
          designation: 'Épargne Plus',
          montantMin: 0,
          montantMax: 0,
          type: 'EPARGNE',
          modesRemboursement: 'USSD',
          institutionId: INST_OK,
          zone: 'Thies',
          createdAt: new Date('2025-02-01T00:00:00Z'),
          updatedAt: new Date('2025-09-02T00:00:00Z'),
        },
      ];
      mockByInstitutionExecute.mockResolvedValueOnce(fakeProducts);

      const app = makeApp();
      const res = await request(app).get(`/api/v1/service/by-institution/${INST_OK}`);

      expect(res.status).toBe(200);
      expect(mockByInstitutionExecute).toHaveBeenCalledTimes(1);
      expect(mockByInstitutionExecute).toHaveBeenCalledWith(INST_OK);

      expect(res.body).toMatchObject({ status: 'success', results: 2 });
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.map((s: any) => s.designation)).toEqual([
        'Crédit Agricole',
        'Épargne Plus',
      ]);
    });

    it('200 | institution valide mais sans produits', async () => {
      mockByInstitutionExecute.mockResolvedValueOnce([]);

      const app = makeApp();
      const res = await request(app).get(`/api/v1/service/by-institution/${INST_EMPTY}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toBe(0);
      expect(res.body.data).toEqual([]);
    });

    it('500 | si le use-case jette une erreur', async () => {
      mockByInstitutionExecute.mockRejectedValueOnce(new Error('DB down'));

      const app = makeApp();
      const res = await request(app).get(`/api/v1/service/by-institution/${INST_ERR}`);

      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: 'error',
          message: expect.any(String),
        })
      );
    });
  });

  describe('GET /by-institution/:institutionId/filter', () => {
    it('200 | parse type[]=CREDIT&EPARGNE&zone=dakar&date=recent → appelle le use-case (objet)', async () => {
      const fakeFiltered = [
        {
          id: 'pX',
          designation: 'Produit X',
          montantMin: 0,
          montantMax: 0,
          type: 'CREDIT',
          modesRemboursement: 'USSD',
          institutionId: INST_OK,
          zone: 'dakar',
          createdAt: new Date('2025-02-01T00:00:00Z'),
          updatedAt: new Date('2025-09-02T00:00:00Z'),
        },
      ];
      mockFilterExecute.mockResolvedValueOnce(fakeFiltered);

      const app = makeApp();
      const res = await request(app).get(
        `/api/v1/service/by-institution/${INST_OK}/filter?type=CREDIT&type=EPARGNE&zone=  dakar  &zone=thies&date=recent`
      );

      expect(res.status).toBe(200);
      expect(mockFilterExecute).toHaveBeenCalledTimes(1);

      const payload = (mockFilterExecute as jest.Mock).mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({
          institutionId: INST_OK,
          types: ['CREDIT', 'EPARGNE'],
          zoneCodes: ['dakar', 'thies'],
          datePreset: 'recent',
        })
      );

      expect(res.body).toMatchObject({ status: 'success', results: 1 });
      expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 'pX', zone: 'dakar' }));
    });

    it('200 | query vide → passe seulement institutionId (objet)', async () => {
      mockFilterExecute.mockResolvedValueOnce([]);

      const app = makeApp();
      const res = await request(app).get('/api/v1/service/by-institution/inst_ONLY/filter');

      expect(res.status).toBe(200);
      expect(mockFilterExecute).toHaveBeenCalledTimes(1);

      const payload = (mockFilterExecute as jest.Mock).mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({
          institutionId: 'inst_ONLY',
          types: undefined,
          zoneCodes: undefined,
          datePreset: undefined,
        })
      );
    });

    it('500 | si le use-case filtre jette une erreur (renvoie le message réel)', async () => {
      mockFilterExecute.mockRejectedValueOnce(new Error('Repo KO'));

      const app = makeApp();
      const res = await request(app).get(`/api/v1/service/by-institution/${INST_OK}/filter`);

      expect(res.status).toBe(500);
      expect(res.body).toEqual(
        expect.objectContaining({
          status: 'error',
          message: 'Repo KO',
        })
      );
    });
  });
});
