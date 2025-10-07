import type { Request, Response } from 'express';
import type { GetProductByInstitutionUseCase } from '@/application/use-cases/GetProductByInstitutionUseCase';
import type { FilterProductUseCase } from '@/application/use-cases/FilterProductUseCase';
import { ProductController } from '@/infrastructure/web/controllers/ProductController';
import { InstitutionNotFoundError } from '@/domain/errors/InstitutionNotFoundError';

function makeRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
  return res;
}

describe('ProductController', () => {
  let getUC: jest.Mocked<GetProductByInstitutionUseCase>;
  let filterUC: jest.Mocked<FilterProductUseCase>;
  let controller: ProductController;

  beforeEach(() => {
    getUC = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetProductByInstitutionUseCase>;

    filterUC = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FilterProductUseCase>;

    controller = new ProductController(getUC, filterUC);
    jest.clearAllMocks();
  });

  describe('byInstitution', () => {
    it('200 + payload en cas de succès', async () => {
      const req = { params: { institutionId: 'inst-123' } } as unknown as Request;
      const res = makeRes();

      const data = [{ id: 's1' }, { id: 's2' }];
      getUC.execute.mockResolvedValueOnce(data as any);

      await controller.byInstitution(req, res);

      expect(getUC.execute).toHaveBeenCalledWith('inst-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: data.length,
        data,
      });
    });

    it('404 si INSTITUTION_NOT_FOUND', async () => {
      const req = { params: { institutionId: 'inst-404' } } as unknown as Request;
      const res = makeRes();

      getUC.execute.mockRejectedValueOnce(new InstitutionNotFoundError('inst-404'));

      await controller.byInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'INSTITUTION_NOT_FOUND',
        message: 'Institution not found: inst-404',
      });
    });

    it('500 pour toute autre erreur', async () => {
      const req = { params: { institutionId: 'inst-bug' } } as unknown as Request;
      const res = makeRes();

      getUC.execute.mockRejectedValueOnce(new Error('DB DOWN'));

      await controller.byInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur lors de la récupération des services',
      });
    });
  });

  describe('filterByInstitution', () => {
    it('200 + payload, et passe les filtres normalisés au use-case', async () => {
      const req = {
        params: { institutionId: 'inst-123' },
        query: {
          type: ['credit', 'EPARGNE'],
          zone: 'DAKAR',
          date: 'recent',
        },
      } as unknown as Request;
      const res = makeRes();

      const data = [{ id: 's1' }];
      filterUC.execute.mockResolvedValueOnce(data as any);

      await controller.filterByInstitution(req, res);

      expect(filterUC.execute).toHaveBeenCalledWith({
        institutionId: 'inst-123',
        types: ['CREDIT', 'EPARGNE'],
        zoneCodes: ['DAKAR'],
        datePreset: 'recent',
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: data.length,
        data,
      });
    });

    it('normalise aussi quand plusieurs zones (array) et date invalide -> undefined', async () => {
      const req = {
        params: { institutionId: 'inst-123' },
        query: {
          type: 'assurance',
          zone: [' DAKAR ', 'THIES', ''],
          date: 'invalid',
        },
      } as unknown as Request;
      const res = makeRes();

      filterUC.execute.mockResolvedValueOnce([]);

      await controller.filterByInstitution(req, res);

      expect(filterUC.execute).toHaveBeenCalledWith({
        institutionId: 'inst-123',
        types: ['ASSURANCE'],
        zoneCodes: ['DAKAR', 'THIES'],
        datePreset: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 0,
        data: [],
      });
    });

    it('404 si INSTITUTION_NOT_FOUND', async () => {
      const req = {
        params: { institutionId: 'inst-404' },
        query: {},
      } as unknown as Request;
      const res = makeRes();

      filterUC.execute.mockRejectedValueOnce(new Error('INSTITUTION_NOT_FOUND'));

      await controller.filterByInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'institutionId introuvable',
      });
    });

    it('500 pour toute autre erreur', async () => {
      const req = {
        params: { institutionId: 'inst-bug' },
        query: {},
      } as unknown as Request;
      const res = makeRes();

      filterUC.execute.mockRejectedValueOnce(new Error('Erreur lors du filtrage des services'));

      await controller.filterByInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur lors du filtrage des services',
      });
    });
  });
});
