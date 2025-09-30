// __tests__/domain/repositories/ServiceRepository.interface.test.ts
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import { Service } from '@/domain/entities/Service';
import type { ServiceType } from '@/domain/entities/types/ServiceType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';

describe('ServiceRepository Interface', () => {
  it('should define the correct contract', () => {
    const mockImplementation: ServiceRepository = {
      findByInstitution: jest.fn(),
      findByFilters: jest.fn(),
    };

    expect(mockImplementation.findByInstitution).toBeDefined();
    expect(mockImplementation.findByFilters).toBeDefined();
    expect(typeof mockImplementation.findByInstitution).toBe('function');
    expect(typeof mockImplementation.findByFilters).toBe('function');
  });

  it('should have findByInstitution with correct signature and return type', async () => {
    const services: Service[] = [
      new Service(
        1,
        'Crédit Agricole',
        1000,
        5000,
        'CREDIT' as ServiceType,
        'AGENCE' as RemboursementMode,
        42,
        10,
        new Date('2025-01-01'),
        new Date('2025-09-01')
      ),
      new Service(
        2,
        'Épargne Plus',
        0,
        0,
        'EPARGNE' as ServiceType,
        'USSD' as RemboursementMode,
        42,
        10,
        new Date('2025-02-01'),
        new Date('2025-09-02')
      ),
    ];

    const mockImplementation: ServiceRepository = {
      findByInstitution: jest.fn().mockResolvedValue(services),
      findByFilters: jest.fn(),
    };

    const result = await mockImplementation.findByInstitution(42);

    expect(mockImplementation.findByInstitution).toHaveBeenCalledWith(42);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(Service);
  });

  it('should have findByFilters with full signature (types, zoneId, fromDate)', async () => {
    const filtered: Service[] = [
      new Service(
        2,
        'Épargne Plus',
        0,
        0,
        'EPARGNE' as ServiceType,
        'USSD' as RemboursementMode,
        42,
        10,
        new Date('2025-02-10'),
        new Date('2025-09-02')
      ),
    ];

    const mockImplementation: ServiceRepository = {
      findByInstitution: jest.fn(),
      findByFilters: jest.fn().mockResolvedValue(filtered),
    };

    const types: ServiceType[] = ['EPARGNE'];
    const zoneId = 10;
    const fromDate = new Date('2025-02-01');

    const result = await mockImplementation.findByFilters(42, types, zoneId, fromDate);

    expect(mockImplementation.findByFilters).toHaveBeenCalledWith(42, types, zoneId, fromDate);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toBeInstanceOf(Service);
    expect(result[0].type).toBe('EPARGNE');
  });

  it('autorise un appel minimal à findByFilters (seulement institutionId)', async () => {
    const allForInst: Service[] = [
      new Service(
        1,
        'Crédit Agricole',
        1000,
        5000,
        'CREDIT' as ServiceType,
        'AGENCE' as RemboursementMode,
        42,
        10,
        new Date('2025-01-10'),
        new Date('2025-09-01')
      ),
      new Service(
        3,
        'Mobile Cash',
        0,
        0,
        'MOBILE_MONEY' as ServiceType,
        'MOBILE' as RemboursementMode,
        42,
        11,
        new Date('2025-03-10'),
        new Date('2025-09-03')
      ),
    ];

    const mockImplementation: ServiceRepository = {
      findByInstitution: jest.fn(),
      findByFilters: jest.fn().mockResolvedValue(allForInst),
    };

    const result = await mockImplementation.findByFilters(42);

    const calls = (mockImplementation.findByFilters as jest.Mock).mock.calls;
    if (calls.length !== 1) {
      throw new Error(
        `Échec: findByFilters doit être appelée exactement 1 fois. Appels: ${calls.length}`
      );
    }

    const args = calls[0];
    if (args[0] !== 42) {
      throw new Error(`Échec: premier argument attendu = 42. Reçu: ${JSON.stringify(args[0])}`);
    }

    if (args.length > 1) {
      if (args[1] !== undefined)
        throw new Error(`Échec: types doit être undefined. Reçu: ${JSON.stringify(args[1])}`);
      if (args[2] !== undefined)
        throw new Error(`Échec: zoneId doit être undefined. Reçu: ${JSON.stringify(args[2])}`);
      if (args[3] !== undefined)
        throw new Error(`Échec: fromDate doit être undefined. Reçu: ${JSON.stringify(args[3])}`);
    }

    expect(result.map(s => s.institutionId).every(id => id === 42)).toBe(true);
  });

  it('should accept undefined/empty types and omit zoneId/fromDate', async () => {
    const mockImplementation: ServiceRepository = {
      findByInstitution: jest.fn(),
      findByFilters: jest.fn().mockResolvedValue([]),
    };

    await mockImplementation.findByFilters(7, undefined, undefined, undefined);
    expect(mockImplementation.findByFilters).toHaveBeenCalledWith(
      7,
      undefined,
      undefined,
      undefined
    );

    await mockImplementation.findByFilters(7, [], undefined, undefined);
    expect(mockImplementation.findByFilters).toHaveBeenCalledWith(7, [], undefined, undefined);
  });
});
