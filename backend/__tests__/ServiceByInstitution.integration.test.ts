import request from 'supertest';
import express, { Router } from 'express';

// --- Imports depuis ton code ---

import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import { Service } from '@/domain/entities/Service';
import { GetServiceByInstitutionUseCaseImpl } from '@/domain/use-cases/GetServiceByInstitutionUseCaseImpl';
import { ServiceController } from '@/infrastructure/web/controllers/ServiceController';
import type { ServiceType } from '@/domain/entities/types/ServiceType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';

// ==== Fake repository (remplace Prisma pour le test) ====
class FakeServiceRepository implements ServiceRepository {
  private data: Service[];

  constructor() {
    this.data = [
      new Service(
        1,
        'Crédit Agricole',
        1000,
        5000,
        'CREDIT' as ServiceType,
        'MENSUEL' as RemboursementMode,
        1,
        10,
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-09-01T00:00:00Z')
      ),
      new Service(
        2,
        'Épargne Plus',
        0,
        0,
        'EPARGNE' as ServiceType,
        'AUTRE' as RemboursementMode,
        1,
        10,
        new Date('2025-02-01T00:00:00Z'),
        new Date('2025-09-02T00:00:00Z')
      ),
      new Service(
        3,
        'Crédit Express',
        500,
        2000,
        'CREDIT' as ServiceType,
        'MENSUEL' as RemboursementMode,
        2,
        11,
        new Date('2025-03-01T00:00:00Z'),
        new Date('2025-09-03T00:00:00Z')
      ),
    ];
  }

  async findByInstitution(institutionId: number): Promise<Service[]> {
    if (institutionId === 999) {
      // pour tester le 500
      throw new Error('DB down');
    }
    return this.data
      .filter(s => s.institutionId === institutionId)
      .sort((a, b) => a.designation.localeCompare(b.designation));
  }

  async findByFilters(
    _institutionId: number,
    _types?: ServiceType[],
    _zoneId?: number,
    _fromDate?: Date
  ): Promise<Service[]> {
    return []; // non utilisé dans ces tests
  }
}

// ==== Fabrique un app express câblée comme en prod ====
function makeAppWithRouter(repo: ServiceRepository) {
  const byInstitutionUC: GetServiceByInstitutionUseCaseImpl =
    new GetServiceByInstitutionUseCaseImpl(repo);

  // le controller demande aussi FilterServicesUseCase, on lui passe un stub
  const filterServicesStub = {
    execute: jest.fn(),
  } as any;

  const controller = new ServiceController(byInstitutionUC, filterServicesStub);

  const router = Router();
  router.get('/by-institution/:institutionId', (req, res) => controller.byInstitution(req, res));

  const app = express();
  app.use(express.json());
  app.use('/api/v1/service', router);

  return app;
}

describe('GET /api/v1/service/by-institution/:institutionId', () => {
  let app: express.Express;

  beforeAll(() => {
    const repo = new FakeServiceRepository();
    app = makeAppWithRouter(repo);
  });

  it('200 | retourne les services de l’institution demandée', async () => {
    const res = await request(app).get('/api/v1/service/by-institution/1');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'success',
      results: 2,
    });
    expect(Array.isArray(res.body.data)).toBe(true);
    // check tri par designation asc (Crédit Agricole, Épargne Plus)
    expect(res.body.data.map((s: any) => s.designation)).toEqual([
      'Crédit Agricole',
      'Épargne Plus',
    ]);
    // shape minimal d’un item
    expect(res.body.data[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        designation: expect.any(String),
        type: expect.any(String),
        institutionId: 1,
      })
    );
  });

  it('400 | institutionId invalide (<=0)', async () => {
    const res = await request(app).get('/api/v1/service/by-institution/0');
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'fail',
        message: 'institutionId invalide',
      })
    );
  });

  it('400 | institutionId invalide (NaN)', async () => {
    const res = await request(app).get('/api/v1/service/by-institution/abc');
    expect(res.status).toBe(400);
  });

  it('200 | institution sans services → tableau vide', async () => {
    const res = await request(app).get('/api/v1/service/by-institution/12345');
    expect(res.status).toBe(200);
    expect(res.body.results).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  it('500 | erreur interne du use-case/repo', async () => {
    const res = await request(app).get('/api/v1/service/by-institution/999');
    expect(res.status).toBe(500);
    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'error',
        message: 'Erreur lors de la récupération des produits',
      })
    );
  });
});
