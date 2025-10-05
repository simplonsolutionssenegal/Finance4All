import { FilterServicesUseCaseImpl } from '@/domain/use-cases/FilterServicesUseCaseImpl';
import { InstitutionService } from '@/domain/entities/InstitutionService';
import { v4 as uuidv4 } from 'uuid';

describe('FilterServicesUseCaseImpl', () => {
  const mockRepo = {
    findByFilters: jest.fn(),
  };

  let useCase: FilterServicesUseCaseImpl;
  let validInstitutionId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new FilterServicesUseCaseImpl(mockRepo as any);
    validInstitutionId = uuidv4();
  });

  it('filtre par type de service', async () => {
    const services = [
      new InstitutionService(
        '1',
        'Crédit A',
        1000,
        5000,
        'CREDIT',
        'AGENCE',
        validInstitutionId,
        'ZONE1',
        new Date(),
        new Date()
      ),
      new InstitutionService(
        '2',
        'Épargne B',
        200,
        2000,
        'EPARGNE',
        'USSD',
        validInstitutionId,
        'ZONE2',
        new Date(),
        new Date()
      ),
    ];

    mockRepo.findByFilters.mockResolvedValue(services.filter(s => s.type === 'CREDIT'));

    const result = await useCase.execute({
      institutionId: validInstitutionId,
      types: ['CREDIT'],
    });

    expect(result).toHaveLength(1);
    expect(result[0].designation).toBe('Crédit A');
  });

  it('filtre par zone', async () => {
    const services = [
      new InstitutionService(
        '1',
        'Crédit A',
        1000,
        5000,
        'CREDIT',
        'AGENCE',
        validInstitutionId,
        'ZONE1',
        new Date(),
        new Date()
      ),
      new InstitutionService(
        '2',
        'Épargne B',
        200,
        2000,
        'EPARGNE',
        'USSD',
        validInstitutionId,
        'ZONE2',
        new Date(),
        new Date()
      ),
    ];

    mockRepo.findByFilters.mockResolvedValue(services.filter(s => s.zone === 'ZONE2'));

    const result = await useCase.execute({
      institutionId: validInstitutionId,
      zoneCodes: ['ZONE2'],
    });

    expect(result).toHaveLength(1);
    expect(result[0].zone).toBe('ZONE2');
  });

  it('filtre par datePreset = "recent"', async () => {
    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 6);

    const recentDate = new Date();

    const services = [
      new InstitutionService(
        '1',
        'Ancien crédit',
        1000,
        5000,
        'CREDIT',
        'MOBILE',
        validInstitutionId,
        'ZONE1',
        oldDate,
        oldDate
      ),
      new InstitutionService(
        '2',
        'Crédit récent',
        200,
        2000,
        'CREDIT',
        'USSD',
        validInstitutionId,
        'ZONE1',
        recentDate,
        recentDate
      ),
    ];

    mockRepo.findByFilters.mockResolvedValue([services[1]]);

    const result = await useCase.execute({
      institutionId: validInstitutionId,
      datePreset: 'recent',
    });

    expect(result).toHaveLength(1);
    expect(result[0].designation).toBe('Crédit récent');
  });
});
