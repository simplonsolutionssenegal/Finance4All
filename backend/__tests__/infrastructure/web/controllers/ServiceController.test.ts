import type { Request, Response } from 'express';
import { ServiceController } from '@/infrastructure/web/controllers/ServiceController';
import type { GetServicesByInstitutionUseCase } from '@/application/use-cases/GetServiceByInstitutionUseCase';
import type { FilterServicesUseCase } from '@/application/use-cases/FilterServicesUseCase';
import type { ServiceType } from '@/domain/entities/types/ServiceType';

// Helpers pour mocker Response
function makeRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
}

describe('ServiceController', () => {
  let getByInstitutionUC: jest.Mocked<GetServicesByInstitutionUseCase>;
  let filterUC: jest.Mocked<FilterServicesUseCase>;
  let controller: ServiceController;

  beforeEach(() => {
    getByInstitutionUC = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetServicesByInstitutionUseCase>;

    filterUC = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FilterServicesUseCase>;

    controller = new ServiceController(getByInstitutionUC, filterUC);
    jest.clearAllMocks();
  });

  describe('byInstitution', () => {
    it('200 | retourne les services et appelle le use-case avec le bon id', async () => {
      const req = { params: { institutionId: '42' } } as unknown as Request;
      const res = makeRes();

      const services = [
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
      getByInstitutionUC.execute.mockResolvedValueOnce(services as any);

      await controller.byInstitution(req, res);

      expect(getByInstitutionUC.execute).toHaveBeenCalledWith(42);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: services,
      });
    });

    it('400 | institutionId invalide', async () => {
      const res = makeRes();

      await controller.byInstitution({ params: { institutionId: '0' } } as any, res);
      await controller.byInstitution({ params: { institutionId: 'abc' } } as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'institutionId invalide',
      });
      expect(getByInstitutionUC.execute).not.toHaveBeenCalled();
    });

    it('500 | erreur use-case', async () => {
      const req = { params: { institutionId: '42' } } as any;
      const res = makeRes();
      getByInstitutionUC.execute.mockRejectedValueOnce(new Error('DB down'));

      await controller.byInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur lors de la récupération des produits',
      });
    });
  });

  describe('filterByInstitution', () => {
    it('200 | parse type[]=CREDIT&EPARGNE&zone=10&date=recent → appelle use-case (objet)', async () => {
      const req = {
        params: { institutionId: '42' },
        query: { type: ['CREDIT', 'EPARGNE'], zone: '10', date: 'recent' },
      } as unknown as Request;
      const res = makeRes();

      const filtered = [
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
      filterUC.execute.mockResolvedValueOnce(filtered as any);

      await controller.filterByInstitution(req, res);

      expect(filterUC.execute).toHaveBeenCalledTimes(1);
      const payload = (filterUC.execute as jest.Mock).mock.calls[0][0];

      expect(payload).toEqual(
        expect.objectContaining({
          institutionId: 42,
          types: ['CREDIT', 'EPARGNE'] as ServiceType[],
          zoneId: 10,
          datePreset: 'recent',
        })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: filtered,
      });
    });

    it('200 | type unique en string (casse indifférente), zone NaN ignoré, pas de date', async () => {
      const req = {
        params: { institutionId: '7' },
        query: { type: 'credit', zone: 'NaN' }, // "credit" → toUpperCase() → "CREDIT"
      } as unknown as Request;
      const res = makeRes();

      filterUC.execute.mockResolvedValueOnce([] as any);

      await controller.filterByInstitution(req, res);

      const payload = (filterUC.execute as jest.Mock).mock.calls[0][0];
      expect(payload.institutionId).toBe(7);
      expect(payload.types).toEqual(['CREDIT']);
      expect(payload.zoneId).toBeUndefined();
      expect(payload.datePreset).toBeUndefined();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 0,
        data: [],
      });
    });

    it('200 | query vide → passe seulement institutionId', async () => {
      const req = {
        params: { institutionId: '9' },
        query: {},
      } as unknown as Request;
      const res = makeRes();

      filterUC.execute.mockResolvedValueOnce([] as any);

      await controller.filterByInstitution(req, res);

      const payload = (filterUC.execute as jest.Mock).mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({
          institutionId: 9,
          types: undefined,
          zoneId: undefined,
          datePreset: undefined,
        })
      );
    });

    it('400 | institutionId invalide', async () => {
      const res = makeRes();
      const badReq = { params: { institutionId: 'abc' }, query: {} } as any;

      await controller.filterByInstitution(badReq, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'institutionId invalide',
      });
      expect(filterUC.execute).not.toHaveBeenCalled();
    });

    it('500 | erreur use-case', async () => {
      const req = {
        params: { institutionId: '42' },
        query: {},
      } as unknown as Request;
      const res = makeRes();

      filterUC.execute.mockRejectedValueOnce(new Error('Repo KO'));

      await controller.filterByInstitution(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Repo KO',
      });
    });
  });
});
