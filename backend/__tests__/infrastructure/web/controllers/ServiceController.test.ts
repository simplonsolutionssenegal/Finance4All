import type { Request, Response } from 'express';
import type { GetServicesByInstitutionUseCase } from '@/application/use-cases/GetServiceByInstitutionUseCase';
import type { FilterServicesUseCase } from '@/application/use-cases/FilterServicesUseCase';
import { InstitutionService } from '@/domain/entities/InstitutionService';
import { ServiceController } from '@/infrastructure/web/controllers/ServiceController';

// --------- helpers ----------
function makeRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
  return res;
}

function makeReq(overrides: Partial<Request> = {}): Request {
  const base: Partial<Request> = { params: {}, query: {}, body: {} };
  return { ...base, ...overrides } as Request;
}

function makeService(overrides: Partial<InstitutionService> = {}): InstitutionService {
  const now = new Date('2025-10-01T12:00:00Z');
  // NOTE: on caste type/modesRemboursement en any pour éviter d'importer les enums dans ce test
  return new InstitutionService(
    overrides.id ?? 'svc_1',
    overrides.designation ?? 'Produit A',
    overrides.montantMin ?? 1000,
    overrides.montantMax ?? 5000,
    (overrides.type as any) ?? 'CREDIT',
    (overrides.modesRemboursement as any) ?? 'AGENCE',
    overrides.institutionId ?? 'inst_ABC',
    overrides.zone ?? 'dakar',
    overrides.createdAt ?? now,
    overrides.updatedAt ?? now
  );
}
// ----------------------------

describe('ServiceController (global)', () => {
  let getServicesByInstitution: jest.Mocked<GetServicesByInstitutionUseCase>;
  let filterServices: jest.Mocked<FilterServicesUseCase>;
  let controller: ServiceController;

  beforeEach(() => {
    jest.clearAllMocks();

    getServicesByInstitution = { execute: jest.fn() } as any;
    filterServices = { execute: jest.fn() } as any;

    controller = new ServiceController(getServicesByInstitution, filterServices);
  });

  // ---------------------------------------------------
  // byInstitution
  // ---------------------------------------------------
  it('byInstitution → 200 avec UUID valide', async () => {
    const uuid = '99e13ab0-b2df-423f-ba5b-c847c1dc0fef';
    const services = [
      makeService({ id: 's1', designation: 'Alpha', zone: 'dakar' }),
      makeService({ id: 's2', designation: 'Beta', zone: 'thies' }),
    ];
    getServicesByInstitution.execute.mockResolvedValueOnce(services);

    const req = makeReq({ params: { institutionId: uuid } });
    const res = makeRes();

    await controller.byInstitution(req, res);

    expect(getServicesByInstitution.execute).toHaveBeenCalledWith(uuid);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      results: services.length,
      data: services,
    });
  });

  it('byInstitution → 400 si institutionId non-UUID', async () => {
    const req = makeReq({ params: { institutionId: '123' } }); // invalide
    const res = makeRes();

    await controller.byInstitution(req, res);

    expect(getServicesByInstitution.execute).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'institutionId invalide (UUID attendu)',
    });
  });

  it('byInstitution → 500 si use-case lève une erreur', async () => {
    const uuid = '99e13ab0-b2df-423f-ba5b-c847c1dc0fef';
    getServicesByInstitution.execute.mockRejectedValueOnce(new Error('boom'));

    const req = makeReq({ params: { institutionId: uuid } });
    const res = makeRes();

    await controller.byInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Erreur lors de la récupération des services',
    });
  });

  // ---------------------------------------------------
  // filterByInstitution
  // ---------------------------------------------------
  it('filterByInstitution → 400 si institutionId trop court (<3)', async () => {
    const req = makeReq({ params: { institutionId: 'ab' } });
    const res = makeRes();

    await controller.filterByInstitution(req, res);

    expect(filterServices.execute).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'institutionId invalide',
    });
  });

  it('filterByInstitution → 200 avec types[], zones[], date=recent', async () => {
    const services = [makeService({ id: 's1', zone: 'dakar' })];
    filterServices.execute.mockResolvedValueOnce(services);

    const req = makeReq({
      params: { institutionId: 'inst_ABC' },
      query: {
        type: ['credit', 'EPARGNE'], // casse mixte → uppercased
        zone: ['  dakar  ', 'thies', ''], // trim + filter(Boolean)
        date: 'recent',
      },
    });
    const res = makeRes();

    await controller.filterByInstitution(req, res);

    expect(filterServices.execute).toHaveBeenCalledWith({
      institutionId: 'inst_ABC',
      types: ['CREDIT', 'EPARGNE'],
      zoneCodes: ['dakar', 'thies'],
      datePreset: 'recent',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      results: services.length,
      data: services,
    });
  });

  it('filterByInstitution → 200 avec type string + zone string + date=3mois', async () => {
    const services = [makeService({ id: 's2', zone: 'pikine', type: 'MOBILE_MONEY' as any })];
    filterServices.execute.mockResolvedValueOnce(services);

    const req = makeReq({
      params: { institutionId: 'inst_DEF' },
      query: { type: 'mobile_money', zone: 'pikine', date: '3mois' },
    });
    const res = makeRes();

    await controller.filterByInstitution(req, res);

    expect(filterServices.execute).toHaveBeenCalledWith({
      institutionId: 'inst_DEF',
      types: ['MOBILE_MONEY'],
      zoneCodes: ['pikine'],
      datePreset: '3mois',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      results: services.length,
      data: services,
    });
  });

  it('filterByInstitution → 200 sans aucun filtre → uniquement institutionId', async () => {
    const services = [
      makeService({ id: 's3', zone: 'kaolack' }),
      makeService({ id: 's4', zone: 'mbour' }),
    ];
    filterServices.execute.mockResolvedValueOnce(services);

    const req = makeReq({ params: { institutionId: 'inst_ONLY' }, query: {} });
    const res = makeRes();

    await controller.filterByInstitution(req, res);

    expect(filterServices.execute).toHaveBeenCalledWith({
      institutionId: 'inst_ONLY',
      types: undefined,
      zoneCodes: undefined,
      datePreset: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      results: services.length,
      data: services,
    });
  });

  it('filterByInstitution → 200 ignore date invalide (≠ "recent"/"3mois")', async () => {
    const services = [makeService({ id: 's5', zone: 'dakar', type: 'CREDIT' as any })];
    filterServices.execute.mockResolvedValueOnce(services);

    const req = makeReq({
      params: { institutionId: 'inst_GHI' },
      query: { type: ['CREDIT'], zone: ['dakar'], date: 'hier' }, // invalide
    });
    const res = makeRes();

    await controller.filterByInstitution(req, res);

    expect(filterServices.execute).toHaveBeenCalledWith({
      institutionId: 'inst_GHI',
      types: ['CREDIT'],
      zoneCodes: ['dakar'],
      datePreset: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('filterByInstitution → 500 si use-case lève une erreur', async () => {
    filterServices.execute.mockRejectedValueOnce(new Error('kaput'));

    const req = makeReq({
      params: { institutionId: 'inst_ERR' },
      query: { type: 'credit' },
    });
    const res = makeRes();

    await controller.filterByInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'kaput', // ← le contrôleur renvoie e.message
    });
  });
});
