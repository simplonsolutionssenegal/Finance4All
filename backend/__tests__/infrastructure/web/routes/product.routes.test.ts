import express from 'express';
import request from 'supertest';

jest.mock('@/infrastructure/config/PrismaProductRepository', () => {
  return {
    PrismaProductRepository: jest.fn().mockImplementation(() => ({})),
  };
});

const byInstitutionExecuteMock = jest.fn();
jest.mock('@/domain/use-cases/GetProductByInstitutionUseCaseImpl', () => {
  return {
    GetProductByInstitutionUseCaseImpl: jest.fn().mockImplementation(() => ({
      execute: byInstitutionExecuteMock,
    })),
  };
});

const filterExecuteMock = jest.fn();
jest.mock('@/domain/use-cases/FilterProductUseCaseImpl', () => {
  return {
    FilterProductUseCaseImpl: jest.fn().mockImplementation(() => ({
      execute: filterExecuteMock,
    })),
  };
});

function buildApp() {
  jest.isolateModules(() => {
    const { productRoutes } = require('@/infrastructure/web/routes/product.routes');
    app.use(express.json());
    app.use('/api/v1/product', productRoutes);
  });
}

let app: express.Express;

beforeEach(() => {
  jest.clearAllMocks();
  app = express();
  buildApp();
});

describe('productRoutes', () => {
  const VALID_UUID = '99e13ab0-b2df-423f-ba5b-c847c1dc0fef';
  const INVALID_ID = 'abc';

  describe('GET /by-institution/:institutionId', () => {
    it('200 | appelle le use-case avec le bon id (UUID) et renvoie les données', async () => {
      const fakeProducts = [
        { id: 'p1', name: 'Crédit A', type: 'CREDIT' },
        { id: 'p2', name: 'Épargne B', type: 'EPARGNE' },
      ];
      byInstitutionExecuteMock.mockResolvedValueOnce(fakeProducts);

      const res = await request(app).get(`/api/v1/product/by-institution/${VALID_UUID}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ data: fakeProducts }));
      expect(byInstitutionExecuteMock).toHaveBeenCalledTimes(1);
      expect(byInstitutionExecuteMock).toHaveBeenCalledWith(VALID_UUID);
    });

    it('500 | institutionId invalide (non-UUID) → (comportement actuel sans validation)', async () => {
      const res = await request(app).get(`/api/v1/product/by-institution/${INVALID_ID}`);
      expect(res.status).toBe(500);
    });

    it('500 | si le use-case jette une erreur', async () => {
      byInstitutionExecuteMock.mockRejectedValueOnce(new Error('boom'));
      const res = await request(app).get(`/api/v1/product/by-institution/${VALID_UUID}`);
      expect(res.status).toBe(500);
      expect(byInstitutionExecuteMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /by-institution/:institutionId/filter', () => {
    it('200 | parse type=CREDIT&type=EPARGNE&zone=dakar&date=2025-10-01 → appelle le UC avec un DTO', async () => {
      const fakeFiltered = [{ id: 'p1', name: 'Crédit A', type: 'CREDIT' }];
      filterExecuteMock.mockResolvedValueOnce(fakeFiltered);

      const res = await request(app).get(
        `/api/v1/product/by-institution/${VALID_UUID}/filter?type=CREDIT&type=EPARGNE&zone=dakar&date=2025-10-01`
      );

      expect(res.status).toBe(200);

      expect(res.body).toEqual(expect.objectContaining({ data: fakeFiltered }));

      expect(filterExecuteMock).toHaveBeenCalledTimes(1);
      expect(filterExecuteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          institutionId: VALID_UUID,
          types: ['CREDIT', 'EPARGNE'],
          zoneCodes: ['dakar'],
        })
      );
    });

    it('500 | institutionId invalide sur /filter (comportement actuel sans validation)', async () => {
      const res = await request(app).get(
        `/api/v1/product/by-institution/${INVALID_ID}/filter?type=CREDIT`
      );
      expect(res.status).toBe(500);

      expect(filterExecuteMock).toHaveBeenCalledTimes(1);
      expect(filterExecuteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          institutionId: INVALID_ID,
          types: ['CREDIT'],
        })
      );
    });

    it('500 | le use-case de filtre jette une erreur', async () => {
      filterExecuteMock.mockRejectedValueOnce(new Error('nope'));
      const res = await request(app).get(
        `/api/v1/product/by-institution/${VALID_UUID}/filter?type=CREDIT`
      );
      expect(res.status).toBe(500);
      expect(filterExecuteMock).toHaveBeenCalledTimes(1);
    });
  });
});
