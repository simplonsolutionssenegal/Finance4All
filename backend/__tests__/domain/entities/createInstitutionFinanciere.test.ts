// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import { CreateInstitutionFinanciereUseCase } from '@/application/use-cases/CreateInstitutionFinanciereUseCase';

describe('CreateInstitutionFinanciereUseCase', () => {
  // Mock repository implementation
  const mockInstitutionRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    getAll: jest.fn(),
    delete: jest.fn(),
    create: jest.fn((institution) => Promise.resolve({ ...institution, id: '123' })),
  };

  const validInstitutionData: InstitutionFinanciere = {
    nom: 'Banque Test',
    type: 'BANQUE',
    description: 'Une description valide avec plus de 10 caractères',
    siteWeb: 'https://www.banquetest.com',
    regionsDesservies: ['Île-de-France'],
    contactEmail: 'contact@banquetest.com',
    contactTelephone: '+33123456789',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation errors', () => {
    it('should throw error when nom is missing', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, nom: '' };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        "Le nom de l'institution doit contenir entre 2 et 100 caractères"
      );
    });

    it('should throw error when nom is too short', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, nom: 'A' };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        "Le nom de l'institution doit contenir entre 2 et 100 caractères"
      );
    });

    it('should throw error when nom is too long', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, nom: 'A'.repeat(101) };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        "Le nom de l'institution doit contenir entre 2 et 100 caractères"
      );
    });

    it('should throw error when type is missing', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, type: '' };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        "Le type d'institution est requis et doit faire moins de 50 caractères"
      );
    });

    it('should throw error when type is too long', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, type: 'A'.repeat(51) };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        "Le type d'institution est requis et doit faire moins de 50 caractères"
      );
    });

    it('should throw error when description is missing', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, description: '' };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        'La description doit contenir entre 10 et 1000 caractères'
      );
    });

    it('should throw error when description is too short', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, description: 'court' };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        'La description doit contenir entre 10 et 1000 caractères'
      );
    });

    it('should throw error when description is too long', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, description: 'A'.repeat(1001) };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        'La description doit contenir entre 10 et 1000 caractères'
      );
    });

    it('should throw error when siteWeb is missing', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, siteWeb: '' };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        'Une URL valide est requise pour le site web'
      );
    });

    it('should throw error when siteWeb is invalid URL', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, siteWeb: 'invalid-url' };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        'Une URL valide est requise pour le site web'
      );
    });

    it('should throw error when regionsDesservies is empty', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, regionsDesservies: [] };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        'Entre 1 et 20 régions desservies doivent être spécifiées'
      );
    });

    it('should throw error when contactEmail is invalid', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, contactEmail: 'invalid-email' };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        "L'adresse email du contact n'est pas valide"
      );
    });

    it('should throw error when contactTelephone is too short', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, contactTelephone: '123' };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        "Le numéro de téléphone doit contenir entre 8 et 20 caractères"
      );
    });

    it('should throw error when contactTelephone is too long', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, contactTelephone: '1'.repeat(21) };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        "Le numéro de téléphone doit contenir entre 8 et 20 caractères"
      );
    });

    it('should throw error when regionsDesservies is too many', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, regionsDesservies: Array(21).fill('Region') };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        'Entre 1 et 20 régions desservies doivent être spécifiées'
      );
    });

    it('should throw error when region name is too long', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, regionsDesservies: ['A'.repeat(101)] };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        'Chaque région desservie doit faire moins de 100 caractères'
      );
    });

    it('should throw error when siteWeb URL is too long', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const longUrl = 'https://example.com/' + 'a'.repeat(2048);
      const invalidData = { ...validInstitutionData, siteWeb: longUrl };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        'Une URL valide est requise pour le site web'
      );
    });

    it('should throw error when siteWeb protocol is invalid', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, siteWeb: 'ftp://example.com' };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        'Une URL valide est requise pour le site web'
      );
    });

    it('should throw error when email is too long', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const longEmail = 'a'.repeat(250) + '@example.com';
      const invalidData = { ...validInstitutionData, contactEmail: longEmail };

      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        "L'adresse email du contact n'est pas valide"
      );
  });

    it('should throw error when contactNom is too long', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, contactNom: 'a'.repeat(101) };
      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        "Le nom du contact doit faire moins de 100 caractères"
      );
    });

    it('should throw error when logo URL is too long', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const invalidData = { ...validInstitutionData, logo: 'https://example.com/' + 'a'.repeat(501) };
      await expect(createUseCase.execute(invalidData)).rejects.toThrow(
        "L'URL du logo doit faire moins de 500 caractères"
      );
    });
  });

  describe('Successful creation', () => {
    it('should create institution when all data is valid', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);

      const result = await createUseCase.execute(validInstitutionData);

      expect(mockInstitutionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nom: validInstitutionData.nom,
          type: validInstitutionData.type,
          description: validInstitutionData.description,
          siteWeb: validInstitutionData.siteWeb,
          regionsDesservies: validInstitutionData.regionsDesservies,
          contactEmail: validInstitutionData.contactEmail,
          contactTelephone: validInstitutionData.contactTelephone,
          id: '', // normalized before repository call
        })
      );
      expect(result.id).toBe('123');
      expect(result.nom).toBe(validInstitutionData.nom);
    });

    it('should accept institution without optional contact fields', async () => {
      const createUseCase = new CreateInstitutionFinanciereUseCase(mockInstitutionRepository);
      const dataWithoutContact = {
        ...validInstitutionData,
        contactEmail: undefined,
        contactTelephone: undefined,
      };

      const result = await createUseCase.execute(dataWithoutContact);

      expect(mockInstitutionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nom: dataWithoutContact.nom,
          contactEmail: null,
          contactTelephone: null,
          contactNom: null,
          id: '',
        })
      );
      expect(result.id).toBe('123');
    });
  });
});
