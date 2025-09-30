// __tests__/infrastructure/database/PrismaServiceRepository.test.ts

const findMany = jest.fn();
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    product: { findMany },
  })),
}));

import { Service } from '@/domain/entities/Service';

const { PrismaServiceRepository } = require('@/infrastructure/database/PrismaServiceRepository');

describe('PrismaServiceRepository', () => {
  let repo: InstanceType<typeof PrismaServiceRepository>;

  beforeEach(() => {
    findMany.mockReset();
    repo = new PrismaServiceRepository();
  });

  it('findByInstitution → where/order + mapping', async () => {
    findMany.mockResolvedValueOnce([
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
    ]);

    const out = await repo.findByInstitution(42);

    expect(findMany).toHaveBeenCalledWith({
      where: { institutionId: 42 },
      orderBy: [{ designation: 'asc' }],
    });

    expect(out).toHaveLength(2);
    expect(out[0]).toBeInstanceOf(Service);
    expect(out[0]).toEqual(
      expect.objectContaining({
        id: 1,
        designation: 'Crédit Agricole',
        type: 'CREDIT',
        institutionId: 42,
        zoneId: 10,
      })
    );
  });

  it('findByFilters → construit where dynamiquement', async () => {
    findMany.mockResolvedValueOnce([]);
    await repo.findByFilters(1, ['EPARGNE'], 99, new Date('2025-01-15T00:00:00Z'));

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          institutionId: 1,
          type: { in: ['EPARGNE'] },
          zoneId: 99,
          createdAt: { gte: new Date('2025-01-15T00:00:00Z') },
        }),
        orderBy: [{ designation: 'asc' }],
      })
    );
  });
});
