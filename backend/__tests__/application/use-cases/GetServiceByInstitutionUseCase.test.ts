import type { GetServicesByInstitutionUseCase } from '@/application/use-cases/GetServiceByInstitutionUseCase';
import { Service } from '@/domain/entities/Service';
import type { ServiceType } from '@/domain/entities/types/ServiceType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';

describe('Interface GetServicesByInstitutionUseCase', () => {
  it('doit définir le contrat correct', () => {
    // On vérifie que l’interface impose bien une méthode execute
    const mockImplementation: GetServicesByInstitutionUseCase = {
      execute: jest.fn().mockResolvedValue([]),
    };

    expect(mockImplementation.execute).toBeDefined();
    expect(typeof mockImplementation.execute).toBe('function');
  });

  it('doit avoir une méthode execute avec la bonne signature et le bon type de retour', async () => {
    // Préparation d’un résultat conforme au domaine
    const exemples: Service[] = [
      new Service(
        1,
        'Crédit Agricole',
        1000,
        5000,
        'CREDIT' as ServiceType,
        'MENSUEL' as RemboursementMode,
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
        'AUTRE' as RemboursementMode,
        42,
        10,
        new Date('2025-02-01'),
        new Date('2025-09-02')
      ),
    ];

    const mockImplementation: GetServicesByInstitutionUseCase = {
      execute: jest.fn().mockResolvedValue(exemples),
    };

    const resultat = await mockImplementation.execute(42);

    // Vérifie la signature : un seul paramètre number (institutionId)
    expect(mockImplementation.execute).toHaveBeenCalledWith(42);

    // Vérifie le type de retour (Promise<Service[]>)
    expect(Array.isArray(resultat)).toBe(true);
    expect(resultat).toHaveLength(2);
    expect(resultat[0]).toBeInstanceOf(Service);
    expect(resultat[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        designation: 'Crédit Agricole',
        institutionId: 42,
      })
    );
  });
});
