// backend/__tests__/application/formations/CreateModuleFormationUseCase.test.ts

import { CreateModuleUseCaseImpl } from '@/application/formations/use-cases/CreateModuleFormationUseCase';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { CreateModuleDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import {
  Module,
  ModuleStatus,
  DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';
import { Thematic } from '@/domain/formations/value-objects/Thematic';

// Mock du repository
const mockModuleRepository: jest.Mocked<ModuleRepository> = {
  save: jest.fn(),
  findAll: jest.fn(),
  findByTitle: jest.fn(),
};

// Mock d'EntityId
jest.mock('@/domain/shared/EntityId', () => ({
  EntityId: {
    generate: jest.fn(),
  },
}));

describe('CreateModuleUseCaseImpl', () => {
  let useCase: CreateModuleUseCaseImpl;
  let mockEntityId: jest.MockedFunction<typeof EntityId.generate>;

  beforeEach(() => {
    useCase = new CreateModuleUseCaseImpl(mockModuleRepository);
    mockEntityId = EntityId.generate as jest.MockedFunction<typeof EntityId.generate>;

    // Reset des mocks
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validCreateModuleDTO: CreateModuleDTO = {
      title: 'Introduction aux Finances',
      description: "Module d'introduction aux concepts financiers de base pour débutants",
      thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT],
      imageUrl: 'https://example.com/image.jpg',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
    };

    // Créer un mock d'EntityId valide
    const mockGeneratedId = {
      getValue: () => 'mock-uuid-12345678-1234-1234-1234-123456789abc',
    } as EntityId;

    beforeEach(() => {
      mockEntityId.mockReturnValue(mockGeneratedId);
    });

    it('devrait créer un module avec succès', async () => {
      // Arrange
      const expectedModule = new Module({
        id: mockGeneratedId,
        title: validCreateModuleDTO.title,
        description: validCreateModuleDTO.description,
        imageUrl: validCreateModuleDTO.imageUrl,
        thematics: validCreateModuleDTO.thematics,
        difficultyLevel: validCreateModuleDTO.difficultyLevel,
        estimatedDuration: validCreateModuleDTO.estimatedDuration,
        status: ModuleStatus.DRAFT,
      });

      const savedModule = new Module({
        ...expectedModule.toDTO(),
        id: mockGeneratedId,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);

      // Act
      const result = await useCase.execute(validCreateModuleDTO);

      // Assert
      expect(EntityId.generate).toHaveBeenCalledTimes(1);
      expect(mockModuleRepository.save).toHaveBeenCalledTimes(1);

      const savedModuleArg = mockModuleRepository.save.mock.calls[0][0];
      expect(savedModuleArg).toBeInstanceOf(Module);
      expect(savedModuleArg.toDTO()).toMatchObject({
        id: mockGeneratedId.getValue(),
        title: validCreateModuleDTO.title,
        description: validCreateModuleDTO.description,
        imageUrl: validCreateModuleDTO.imageUrl,
        thematics: validCreateModuleDTO.thematics,
        difficultyLevel: validCreateModuleDTO.difficultyLevel,
        estimatedDuration: validCreateModuleDTO.estimatedDuration,
        status: ModuleStatus.DRAFT,
      });

      expect(result).toEqual(savedModule.toDTO());
    });

    it('devrait créer un module avec imageUrl null', async () => {
      // Arrange
      const inputWithoutImage: CreateModuleDTO = {
        ...validCreateModuleDTO,
        imageUrl: null,
      };

      const savedModule = new Module({
        id: mockGeneratedId,
        title: inputWithoutImage.title,
        description: inputWithoutImage.description,
        imageUrl: null,
        thematics: inputWithoutImage.thematics,
        difficultyLevel: inputWithoutImage.difficultyLevel,
        estimatedDuration: inputWithoutImage.estimatedDuration,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);

      // Act
      const result = await useCase.execute(inputWithoutImage);

      // Assert
      expect(result.imageUrl).toBeNull();
      expect(mockModuleRepository.save).toHaveBeenCalledTimes(1);
    });

    it('devrait créer un module avec plusieurs thématiques', async () => {
      // Arrange
      const inputWithMultipleThematics: CreateModuleDTO = {
        ...validCreateModuleDTO,
        thematics: [
          Thematic.FINANCIAL_EDUCATION,
          Thematic.INVESTMENT,
          Thematic.SAVING,
          Thematic.BUDGET_MANAGEMENT,
        ],
      };

      const savedModule = new Module({
        id: mockGeneratedId,
        title: inputWithMultipleThematics.title,
        description: inputWithMultipleThematics.description,
        imageUrl: inputWithMultipleThematics.imageUrl,
        thematics: inputWithMultipleThematics.thematics,
        difficultyLevel: inputWithMultipleThematics.difficultyLevel,
        estimatedDuration: inputWithMultipleThematics.estimatedDuration,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);

      // Act
      const result = await useCase.execute(inputWithMultipleThematics);

      // Assert
      expect(result.thematics).toHaveLength(4);
      expect(result.thematics).toEqual(inputWithMultipleThematics.thematics);
    });

    it('devrait créer un module avec niveau de difficulté EXPERT', async () => {
      // Arrange
      const inputExpert: CreateModuleDTO = {
        ...validCreateModuleDTO,
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 180, // 3 heures pour un niveau expert
      };

      const savedModule = new Module({
        id: mockGeneratedId,
        title: inputExpert.title,
        description: inputExpert.description,
        imageUrl: inputExpert.imageUrl,
        thematics: inputExpert.thematics,
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 180,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);

      // Act
      const result = await useCase.execute(inputExpert);

      // Assert
      expect(result.difficultyLevel).toBe(DifficultyLevel.EXPERT);
      expect(result.estimatedDuration).toBe(180);
    });

    it('devrait toujours créer un module avec le statut DRAFT', async () => {
      // Arrange
      const savedModule = new Module({
        id: mockGeneratedId,
        title: validCreateModuleDTO.title,
        description: validCreateModuleDTO.description,
        imageUrl: validCreateModuleDTO.imageUrl,
        thematics: validCreateModuleDTO.thematics,
        difficultyLevel: validCreateModuleDTO.difficultyLevel,
        estimatedDuration: validCreateModuleDTO.estimatedDuration,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);

      // Act
      const result = await useCase.execute(validCreateModuleDTO);

      // Assert
      expect(result.status).toBe(ModuleStatus.DRAFT);

      const savedModuleArg = mockModuleRepository.save.mock.calls[0][0];
      expect(savedModuleArg.toDTO().status).toBe(ModuleStatus.DRAFT);
    });

    it('devrait propager les erreurs du repository', async () => {
      // Arrange
      const repositoryError = new Error('Erreur de base de données');
      mockModuleRepository.save.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(validCreateModuleDTO)).rejects.toThrow(
        'Erreur de base de données'
      );
      expect(mockModuleRepository.save).toHaveBeenCalledTimes(1);
    });

    it('devrait générer un nouvel ID à chaque création', async () => {
      // Arrange
      const mockId1 = EntityId.generate();
      const mockId2 = EntityId.generate();

      mockEntityId.mockReturnValueOnce(mockId1).mockReturnValueOnce(mockId2);

      const savedModule1 = new Module({
        id: mockId1,
        title: validCreateModuleDTO.title,
        description: validCreateModuleDTO.description,
        imageUrl: validCreateModuleDTO.imageUrl,
        thematics: validCreateModuleDTO.thematics,
        difficultyLevel: validCreateModuleDTO.difficultyLevel,
        estimatedDuration: validCreateModuleDTO.estimatedDuration,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      const savedModule2 = new Module({
        id: mockId2,
        title: validCreateModuleDTO.title,
        description: validCreateModuleDTO.description,
        imageUrl: validCreateModuleDTO.imageUrl,
        thematics: validCreateModuleDTO.thematics,
        difficultyLevel: validCreateModuleDTO.difficultyLevel,
        estimatedDuration: validCreateModuleDTO.estimatedDuration,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save
        .mockResolvedValueOnce(savedModule1)
        .mockResolvedValueOnce(savedModule2);
    });

    it('devrait valider que le DTO retourné correspond au module sauvegardé', async () => {
      // Arrange
      const currentDate = new Date('2024-01-15T14:30:00Z');
      const savedModule = new Module({
        id: mockGeneratedId,
        title: validCreateModuleDTO.title,
        description: validCreateModuleDTO.description,
        imageUrl: validCreateModuleDTO.imageUrl,
        thematics: validCreateModuleDTO.thematics,
        difficultyLevel: validCreateModuleDTO.difficultyLevel,
        estimatedDuration: validCreateModuleDTO.estimatedDuration,
        status: ModuleStatus.DRAFT,
        createdAt: currentDate,
        updatedAt: currentDate,
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);
    });
  });

  describe('Constructor', () => {
    it('devrait instancier correctement avec les dépendances', () => {
      // Act
      const instance = new CreateModuleUseCaseImpl(mockModuleRepository);

      // Assert
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(CreateModuleUseCaseImpl);
    });
  });

  describe("Cas d'erreur métier", () => {
    it('devrait gérer les erreurs de validation du repository', async () => {
      // Arrange
      const validationError = new Error('Validation failed: Title is required');
      mockModuleRepository.save.mockRejectedValue(validationError);
    });

    it('devrait gérer les erreurs de connectivité', async () => {
      // Arrange
      const connectionError = new Error('Connection timeout');
      mockModuleRepository.save.mockRejectedValue(connectionError);
    });
  });

  describe("Tests d'intégration des propriétés", () => {
    const mockGeneratedId = EntityId.generate(); // Utiliser un UUID valide généré

    beforeEach(() => {
      (EntityId.generate as jest.MockedFunction<typeof EntityId.generate>).mockReturnValue(
        mockGeneratedId
      );
    });

    it('devrait préserver toutes les propriétés lors de la sauvegarde', async () => {
      // Arrange
      const complexInput: CreateModuleDTO = {
        title: 'Module Complexe avec Caractères Spéciaux: éàü',
        description:
          'Description très longue avec des caractères spéciaux et des accents: éèàù, çñ',
        thematics: [Thematic.ENTREPRENEURSHIP, Thematic.TAXATION, Thematic.INSURANCE],
        imageUrl: 'https://cdn.example.com/modules/complex-module-image.webp',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 240, // 4 heures
      };

      const savedModule = new Module({
        id: mockGeneratedId,
        ...complexInput,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);
    });
  });
});
