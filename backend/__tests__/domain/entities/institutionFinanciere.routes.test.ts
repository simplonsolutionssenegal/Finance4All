// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { InstitutionFinanciere } from '../domain/entities/InstitutionFinanciere';
import { DeleteInstitutionFinanciereUseCase } from '../application/use-cases/DeleteInstitutionFinanciereUseCase';

describe('Institution Financière Entity and Use Cases', () => {
  describe('InstitutionFinanciere Entity', () => {
    it('should create an institution with correct properties', () => {
      const institution: InstitutionFinanciere = {
        id: '123',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Une banque de test',
        siteWeb: 'https://test.com',
        regionsDesservies: ['Île-de-France'],
      };

      expect(institution.id).toBe('123');
      expect(institution.nom).toBe('Banque Test');
      expect(institution.type).toBe('BANQUE');
      expect(institution.description).toBe('Une banque de test');
      expect(institution.regionsDesservies).toEqual(['Île-de-France']);
    });
  });

  describe('DeleteInstitutionFinanciereUseCase', () => {
    // Mock repository implementation
    const mockInstitutionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      getAll: jest.fn(),
      delete: jest.fn(),
    };

    it('should throw error when ID is missing', async () => {
      const deleteUseCase = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository);

      await expect(deleteUseCase.execute('')).rejects.toThrow(
        "ID de l'institution financière requis"
      );
    });

    it('should throw error when institution not found', async () => {
      const deleteUseCase = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository);
      mockInstitutionRepository.findById.mockResolvedValue(null);

      await expect(deleteUseCase.execute('999')).rejects.toThrow(
        'Institution financière non trouvée'
      );
    });

    it('should delete institution when it exists', async () => {
      const deleteUseCase = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository);
      const mockInstitution: InstitutionFinanciere = {
        id: '1',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Description test',
        siteWeb: 'https://test.com',
        regionsDesservies: ['Île-de-France'],
      };

      mockInstitutionRepository.findById.mockResolvedValue(mockInstitution);
      mockInstitutionRepository.delete.mockResolvedValue(true);

      const result = await deleteUseCase.execute('1');

      expect(result).toBe(true);
      expect(mockInstitutionRepository.findById).toHaveBeenCalledWith('1');
      expect(mockInstitutionRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should handle repository errors', async () => {
      const deleteUseCase = new DeleteInstitutionFinanciereUseCase(mockInstitutionRepository);
      const mockInstitution: InstitutionFinanciere = {
        id: '1',
        nom: 'Banque Test',
        type: 'BANQUE',
        description: 'Description test',
        siteWeb: 'https://test.com',
        regionsDesservies: ['Île-de-France'],
      };

      mockInstitutionRepository.findById.mockResolvedValue(mockInstitution);
      mockInstitutionRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(deleteUseCase.execute('1')).rejects.toThrow('Database error');
    });
  });
});
