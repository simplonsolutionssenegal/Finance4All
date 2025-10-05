import { GetServiceByInstitutionUseCaseImpl } from '@/domain/use-cases/GetServiceByInstitutionUseCaseImpl';

// __tests__/application/use-cases/GetServiceByInstitutionUseCaseImpl.test.ts
import { InstitutionService } from '@/domain/entities/InstitutionService';
import { v4 as uuidv4 } from 'uuid';

describe('GetServiceByInstitutionUseCaseImpl', () => {
  const mockRepo = {
    findByInstitution: jest.fn(),
  };

  let useCase: GetServiceByInstitutionUseCaseImpl;
  let institutionId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetServiceByInstitutionUseCaseImpl(mockRepo as any);
    institutionId = uuidv4();
  });

  it('retourne les services liés à une institution', async () => {
    const services = [
      new InstitutionService(
        '1',
        'Crédit A',
        1000,
        5000,
        'CREDIT',
        'AGENCE',
        institutionId,
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
        institutionId,
        'ZONE2',
        new Date(),
        new Date()
      ),
    ];

    mockRepo.findByInstitution.mockResolvedValue(services);

    const result = await useCase.execute(institutionId);

    expect(mockRepo.findByInstitution).toHaveBeenCalledWith(institutionId);
    expect(result).toHaveLength(2);
    expect(result[0].designation).toBe('Crédit A');
  });

  it('retourne un tableau vide si aucun service trouvé', async () => {
    mockRepo.findByInstitution.mockResolvedValue([]);

    const result = await useCase.execute(institutionId);

    expect(result).toEqual([]);
  });
});
