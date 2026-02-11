// backend/__tests__/application/formations/CreateModuleFormationUseCase.test.ts

import { CreateModuleFormationUseCaseImpl } from '@/application/formations/use-cases/CreateModuleFormationUseCaseImpl';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { CreateModuleUseCommand } from '@/domain/formations/ports/in/CreateModuleUseCase';
import {
  Module,
  ModuleStatus,
  DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';
import {
  DuplicateThematicException,
  DuplicateTitleException,
} from '@/domain/shared/exceptions/FormationDomainException';

// Mock du repository
const mockModuleRepository: jest.Mocked<ModuleRepository> = {
  save: jest.fn(),
  findAll: jest.fn(),
  findByTitle: jest.fn(),
  findByThematic: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

describe('CreateModuleFormationUseCaseImpl', () => {
  let useCase: CreateModuleFormationUseCaseImpl;
  let mockEntityId: jest.SpyInstance;

  beforeEach(() => {
    useCase = new CreateModuleFormationUseCaseImpl(mockModuleRepository);
    mockEntityId = jest.spyOn(EntityId, 'generate');

    // Reset des mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockEntityId.mockRestore();
  });

  describe('execute', () => {
    const validCreateModuleDTO: CreateModuleUseCommand = {
      title: 'Introduction aux Finances',
      description: "Module d'introduction aux concepts financiers de base pour débutants",
      thematics: 'Finance et Comptabilité',
      imageMediaId: 'image-id-123',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      status: ModuleStatus.DRAFT,
    };

    // Créer un mock d'EntityId valide avec un UUID au format correct
    const mockGeneratedId = EntityId.from('550e8400-e29b-41d4-a716-446655440000');

    beforeEach(() => {
      mockEntityId.mockReturnValue(mockGeneratedId);
      mockModuleRepository.findByTitle.mockResolvedValue(null);
      mockModuleRepository.findByThematic.mockResolvedValue(null);
    });

    it('devrait créer un module avec succès', async () => {
      // Arrange
      const savedModule = new Module({
        id: mockGeneratedId,
        title: validCreateModuleDTO.title,
        description: validCreateModuleDTO.description,
        imageMediaId: validCreateModuleDTO.imageMediaId,
        thematics: 'finance et comptabilité', // Normalisé
        difficultyLevel: validCreateModuleDTO.difficultyLevel,
        estimatedDuration: validCreateModuleDTO.estimatedDuration,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);

      // Act
      const result = await useCase.execute(validCreateModuleDTO);

      // Assert
      expect(mockModuleRepository.findByTitle).toHaveBeenCalledWith(validCreateModuleDTO.title);
      expect(mockModuleRepository.findByThematic).toHaveBeenCalledWith('finance et comptabilité');
      expect(EntityId.generate).toHaveBeenCalledTimes(1);
      expect(mockModuleRepository.save).toHaveBeenCalledTimes(1);

      const savedModuleArg = mockModuleRepository.save.mock.calls[0][0];
      expect(savedModuleArg).toBeInstanceOf(Module);
      expect(savedModuleArg.thematics).toBe('finance et comptabilité');

      expect(result).toEqual(savedModule.toDTO());
    });

    it('devrait créer un module avec imageMediaId null', async () => {
      // Arrange
      const inputWithoutImage: CreateModuleUseCommand = {
        ...validCreateModuleDTO,
        imageMediaId: null,
      };

      const savedModule = new Module({
        id: mockGeneratedId,
        title: inputWithoutImage.title,
        description: inputWithoutImage.description,
        imageMediaId: null,
        thematics: 'finance et comptabilité',
        difficultyLevel: inputWithoutImage.difficultyLevel,
        estimatedDuration: inputWithoutImage.estimatedDuration,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);

      // Act
      const result = await useCase.execute(inputWithoutImage);

      // Assert
      expect(result.imageMediaId).toBeNull();
      expect(mockModuleRepository.save).toHaveBeenCalledTimes(1);
    });

    it('devrait normaliser la thématique en minuscules', async () => {
      // Arrange
      const inputWithUpperCase: CreateModuleUseCommand = {
        ...validCreateModuleDTO,
        thematics: 'GESTION DE PROJET',
      };

      const savedModule = new Module({
        id: mockGeneratedId,
        title: inputWithUpperCase.title,
        description: inputWithUpperCase.description,
        imageMediaId: inputWithUpperCase.imageMediaId,
        thematics: 'gestion de projet',
        difficultyLevel: inputWithUpperCase.difficultyLevel,
        estimatedDuration: inputWithUpperCase.estimatedDuration,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);

      // Act
      const result = await useCase.execute(inputWithUpperCase);

      // Assert
      expect(result.thematics).toBe('gestion de projet');
      expect(mockModuleRepository.findByThematic).toHaveBeenCalledWith('gestion de projet');
    });

    it('devrait créer un module avec niveau de difficulté EXPERT', async () => {
      // Arrange
      const inputExpert: CreateModuleUseCommand = {
        ...validCreateModuleDTO,
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 180, // 3 heures pour un niveau expert
      };

      const savedModule = new Module({
        id: mockGeneratedId,
        title: inputExpert.title,
        description: inputExpert.description,
        imageMediaId: inputExpert.imageMediaId,
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 180,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
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
        imageMediaId: validCreateModuleDTO.imageMediaId,
        thematics: 'finance et comptabilité',
        difficultyLevel: validCreateModuleDTO.difficultyLevel,
        estimatedDuration: validCreateModuleDTO.estimatedDuration,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);

      // Act
      const result = await useCase.execute(validCreateModuleDTO);

      // Assert
      expect(result.status).toBe(ModuleStatus.DRAFT);

      const savedModuleArg = mockModuleRepository.save.mock.calls[0][0];
      expect(savedModuleArg.status).toBe(ModuleStatus.DRAFT);
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

    it('devrait empêcher la création avec un titre dupliqué', async () => {
      // Arrange
      const existingModule = new Module({
        id: EntityId.generate(),
        title: validCreateModuleDTO.title,
        description: 'Description existante',
        imageMediaId: null,
        thematics: 'autre thématique',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
      });

      mockModuleRepository.findByTitle.mockResolvedValue(existingModule);

      // Act & Assert
      await expect(useCase.execute(validCreateModuleDTO)).rejects.toThrow(DuplicateTitleException);
      expect(mockModuleRepository.findByTitle).toHaveBeenCalledWith(validCreateModuleDTO.title);
      expect(mockModuleRepository.save).not.toHaveBeenCalled();
    });

    it('devrait empêcher la création avec une thématique dupliquée (majuscules)', async () => {
      // Arrange
      const existingModule = new Module({
        id: EntityId.generate(),
        title: 'Autre Module',
        description: 'Description existante',
        imageMediaId: null,
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
      });

      mockModuleRepository.findByThematic.mockResolvedValue(existingModule);

      // Act & Assert
      await expect(useCase.execute(validCreateModuleDTO)).rejects.toThrow(
        DuplicateThematicException
      );
      expect(mockModuleRepository.findByThematic).toHaveBeenCalledWith('finance et comptabilité');
      expect(mockModuleRepository.save).not.toHaveBeenCalled();
    });

    it('devrait empêcher la création avec une thématique avec espaces supplémentaires', async () => {
      // Arrange
      const inputWithSpaces: CreateModuleUseCommand = {
        ...validCreateModuleDTO,
        thematics: '  Finance et Comptabilité  ',
      };

      const existingModule = new Module({
        id: EntityId.generate(),
        title: 'Autre Module',
        description: 'Description existante',
        imageMediaId: null,
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
      });

      mockModuleRepository.findByThematic.mockResolvedValue(existingModule);

      // Act & Assert
      await expect(useCase.execute(inputWithSpaces)).rejects.toThrow(DuplicateThematicException);
      expect(mockModuleRepository.findByThematic).toHaveBeenCalledWith('finance et comptabilité');
    });

    it('devrait générer un nouvel ID à chaque création', async () => {
      // Arrange
      const mockId1 = EntityId.from('550e8400-e29b-41d4-a716-446655440001');
      const mockId2 = EntityId.from('550e8400-e29b-41d4-a716-446655440002');

      mockEntityId.mockReturnValueOnce(mockId1).mockReturnValueOnce(mockId2);

      const savedModule1 = new Module({
        id: mockId1,
        title: 'Module 1',
        description: validCreateModuleDTO.description,
        imageMediaId: validCreateModuleDTO.imageMediaId,
        thematics: 'finance et comptabilité',
        difficultyLevel: validCreateModuleDTO.difficultyLevel,
        estimatedDuration: validCreateModuleDTO.estimatedDuration,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      const savedModule2 = new Module({
        id: mockId2,
        title: 'Module 2',
        description: validCreateModuleDTO.description,
        imageMediaId: validCreateModuleDTO.imageMediaId,
        thematics: 'marketing digital',
        difficultyLevel: validCreateModuleDTO.difficultyLevel,
        estimatedDuration: validCreateModuleDTO.estimatedDuration,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save
        .mockResolvedValueOnce(savedModule1)
        .mockResolvedValueOnce(savedModule2);

      // Reset des mocks pour chaque appel
      mockModuleRepository.findByTitle.mockResolvedValue(null);
      mockModuleRepository.findByThematic.mockResolvedValue(null);

      // Act
      const result1 = await useCase.execute({
        ...validCreateModuleDTO,
        title: 'Module 1',
        thematics: 'Finance et Comptabilité',
      });

      const result2 = await useCase.execute({
        ...validCreateModuleDTO,
        title: 'Module 2',
        thematics: 'Marketing Digital',
      });

      // Assert
      expect(EntityId.generate).toHaveBeenCalledTimes(2);
      expect(result1.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(result2.id).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(result1.id).not.toBe(result2.id);
    });

    it('devrait valider que le DTO retourné correspond au module sauvegardé', async () => {
      // Arrange
      const savedModule = new Module({
        id: mockGeneratedId,
        title: validCreateModuleDTO.title,
        description: validCreateModuleDTO.description,
        imageMediaId: validCreateModuleDTO.imageMediaId,
        thematics: 'finance et comptabilité',
        difficultyLevel: validCreateModuleDTO.difficultyLevel,
        estimatedDuration: validCreateModuleDTO.estimatedDuration,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);

      // Act
      const result = await useCase.execute(validCreateModuleDTO);

      // Assert
      expect(result.id).toBe(savedModule.id.getValue());
      expect(result.title).toBe(savedModule.title);
      expect(result.description).toBe(savedModule.description);
      expect(result.thematics).toBe(savedModule.thematics);
      expect(result.difficultyLevel).toBe(savedModule.difficultyLevel);
      expect(result.estimatedDuration).toBe(savedModule.estimatedDuration);
      expect(result.status).toBe(savedModule.status);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Constructor', () => {
    it('devrait instancier correctement avec les dépendances', () => {
      // Act
      const instance = new CreateModuleFormationUseCaseImpl(mockModuleRepository);

      // Assert
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(CreateModuleFormationUseCaseImpl);
    });
  });

  describe("Cas d'erreur métier", () => {
    const validCreateModuleDTO: CreateModuleUseCommand = {
      title: 'Introduction aux Finances',
      description: "Module d'introduction aux concepts financiers de base pour débutants",
      thematics: 'Finance et Comptabilité',
      imageMediaId: 'image-id-123',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      status: ModuleStatus.DRAFT,
    };

    beforeEach(() => {
      mockModuleRepository.findByTitle.mockResolvedValue(null);
      mockModuleRepository.findByThematic.mockResolvedValue(null);
    });

    it('devrait gérer les erreurs de validation du repository', async () => {
      // Arrange
      const validationError = new Error('Validation failed: Title is required');
      mockModuleRepository.save.mockRejectedValue(validationError);

      // Act & Assert
      await expect(useCase.execute(validCreateModuleDTO)).rejects.toThrow(validationError);
    });

    it('devrait gérer les erreurs de connectivité', async () => {
      // Arrange
      const connectionError = new Error('Connection timeout');
      mockModuleRepository.save.mockRejectedValue(connectionError);

      // Act & Assert
      await expect(useCase.execute(validCreateModuleDTO)).rejects.toThrow(connectionError);
    });
  });

  describe("Tests d'intégration des propriétés", () => {
    const mockGeneratedId = EntityId.generate();

    beforeEach(() => {
      (EntityId.generate as jest.MockedFunction<typeof EntityId.generate>).mockReturnValue(
        mockGeneratedId
      );
      mockModuleRepository.findByTitle.mockResolvedValue(null);
      mockModuleRepository.findByThematic.mockResolvedValue(null);
    });

    it('devrait préserver toutes les propriétés lors de la sauvegarde', async () => {
      // Arrange
      const complexInput: CreateModuleUseCommand = {
        title: 'Module Complexe avec Caractères Spéciaux: éàü',
        description:
          'Description très longue avec des caractères spéciaux et des accents: éèàù, çñ',
        thematics: 'Entrepreneuriat et Fiscalité',
        imageMediaId: 'complex-image-id-456',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 240, // 4 heures
        status: ModuleStatus.DRAFT,
      };

      const savedModule = new Module({
        id: mockGeneratedId,
        title: complexInput.title,
        description: complexInput.description,
        imageMediaId: complexInput.imageMediaId,
        thematics: 'entrepreneuriat et fiscalité',
        difficultyLevel: complexInput.difficultyLevel,
        estimatedDuration: complexInput.estimatedDuration,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      mockModuleRepository.save.mockResolvedValue(savedModule);

      // Act
      const result = await useCase.execute(complexInput);

      // Assert
      expect(result.title).toBe(complexInput.title);
      expect(result.description).toBe(complexInput.description);
      expect(result.thematics).toBe('entrepreneuriat et fiscalité');
      expect(result.imageMediaId).toBe(complexInput.imageMediaId);
      expect(result.difficultyLevel).toBe(complexInput.difficultyLevel);
      expect(result.estimatedDuration).toBe(complexInput.estimatedDuration);
      expect(result.status).toBe(ModuleStatus.DRAFT);
    });
  });
});
