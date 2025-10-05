// __tests__/infrastructure/PrismaServiceRepository.test.ts
import { PrismaServiceRepository } from '@/infrastructure/database/PrismaServiceRepository';
import { InstitutionService } from '@/domain/entities/InstitutionService';
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';

// 👇 on mock PrismaClient global
jest.mock('@prisma/client', () => {
  const mPrisma = {
    institutionService: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

import { PrismaClient } from '@prisma/client';

describe('PrismaServiceRepository', () => {
  let repo: PrismaServiceRepository;
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    prisma = new PrismaClient() as unknown as jest.Mocked<PrismaClient>;
    repo = new PrismaServiceRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findByInstitution renvoie les services mappés en entités domaine', async () => {
    const mockRows = [
      {
        id: 'uuid1',
        designation: 'Crédit Test',
        montantMin: 1000,
        montantMax: 5000,
        type: 'CREDIT' as ServiceType,
        modesRemboursement: 'AGENCE' as RemboursementMode,
        institutionId: 'inst-123',
        zones: ['ZONE1'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      },
    ];

    (prisma.institutionService.findMany as jest.Mock).mockResolvedValue(mockRows);

    const result = await repo.findByInstitution('inst-123');

    expect(prisma.institutionService.findMany).toHaveBeenCalledWith({
      where: { institutionId: 'inst-123' },
      orderBy: [{ designation: 'asc' }],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(InstitutionService);
    expect(result[0].designation).toBe('Crédit Test');
    expect(result[0].zone).toBe('ZONE1');
  });

  it('findByFilters applique correctement les filtres', async () => {
    const mockRows = [
      {
        id: 'uuid2',
        designation: 'Épargne Test',
        montantMin: 200,
        montantMax: 2000,
        type: 'EPARGNE' as ServiceType,
        modesRemboursement: 'USSD' as RemboursementMode,
        institutionId: 'inst-123',
        zones: ['ZONE2'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-02'),
      },
    ];

    (prisma.institutionService.findMany as jest.Mock).mockResolvedValue(mockRows);

    const fromDate = new Date('2024-01-01');

    const result = await repo.findByFilters('inst-123', ['EPARGNE'], ['ZONE2'], fromDate);

    expect(prisma.institutionService.findMany).toHaveBeenCalledWith({
      where: {
        institutionId: 'inst-123',
        type: { in: ['EPARGNE'] },
        zones: { hasSome: ['ZONE2'] },
        createdAt: { gte: fromDate },
      },
      orderBy: [{ designation: 'asc' }],
    });

    expect(result).toHaveLength(1);
    expect(result[0].designation).toBe('Épargne Test');
  });
});
