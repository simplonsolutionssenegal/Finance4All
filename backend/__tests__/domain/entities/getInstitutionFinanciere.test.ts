// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import { GetAllInstitutionsFinancieresUseCase } from '@/application/use-cases/GetAllInstitutionsFinancieresUseCase';
import { GetInstitutionFinanciereByIdUseCase } from '@/application/use-cases/GetInstitutionFinanciereByIdUseCase';

describe('Institution Financière Get Use Cases', () => {
  // Mock repository implementation
  const mockInstitutionRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    getAll: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  };

  const mockInstitutions: InstitutionFinanciere[] = [
    {
      id: '1',
      nom: 'Banque Test 1',
      type: 'BANQUE',
      description: 'Description banque 1',
      siteWeb: 'https://banque1.com',
      regionsDesservies: ['Île-de-France'],
    },
    {
      id: '2',
      nom: 'Assurance Test 2',
      type: 'ASSURANCE',
      description: 'Description assurance 2',
      siteWeb: 'https://assurance2.com',
      regionsDesservies: ['Bretagne'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GetAllInstitutionsFinancieresUseCase', () => {
    it('should return all institutions', async () => {
      const getAllUseCase = new GetAllInstitutionsFinancieresUseCase(mockInstitutionRepository);
      mockInstitutionRepository.findAll.mockResolvedValue(mockInstitutions);

      const result = await getAllUseCase.execute();

      expect(mockInstitutionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockInstitutions);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no institutions found', async () => {
      const getAllUseCase = new GetAllInstitutionsFinancieresUseCase(mockInstitutionRepository);
      mockInstitutionRepository.findAll.mockResolvedValue([]);

      const result = await getAllUseCase.execute();

      expect(mockInstitutionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle repository errors', async () => {
      const getAllUseCase = new GetAllInstitutionsFinancieresUseCase(mockInstitutionRepository);
      mockInstitutionRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(getAllUseCase.execute()).rejects.toThrow('Database error');
    });
  });

  describe('GetInstitutionFinanciereByIdUseCase', () => {
    it('should throw error when ID is missing', async () => {
      const getByIdUseCase = new GetInstitutionFinanciereByIdUseCase(mockInstitutionRepository);

      await expect(getByIdUseCase.execute('')).rejects.toThrow(
        "ID de l'institution financière requis"
      );
    });

    it('should throw error when institution not found', async () => {
      const getByIdUseCase = new GetInstitutionFinanciereByIdUseCase(mockInstitutionRepository);
      mockInstitutionRepository.findById.mockResolvedValue(null);

      await expect(getByIdUseCase.execute('999')).rejects.toThrow(
        'Institution financière non trouvée'
      );
    });

    it('should return institution when found', async () => {
      const getByIdUseCase = new GetInstitutionFinanciereByIdUseCase(mockInstitutionRepository);
      const expectedInstitution = mockInstitutions[0];
      mockInstitutionRepository.findById.mockResolvedValue(expectedInstitution);

      const result = await getByIdUseCase.execute('1');

      expect(mockInstitutionRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedInstitution);
    });

    it('should handle repository errors', async () => {
      const getByIdUseCase = new GetInstitutionFinanciereByIdUseCase(mockInstitutionRepository);
      mockInstitutionRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(getByIdUseCase.execute('1')).rejects.toThrow('Database error');
    });
  });
});
