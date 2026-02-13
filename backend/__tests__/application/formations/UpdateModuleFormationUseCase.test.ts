// backend/__tests__/application/formations/UpdateModuleFormationUseCase.test.ts

import { UpdateModuleFormationUseCaseImpl } from '@/application/formations/use-cases/UpdateModule.usecase';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { UpdateModuleUseCommand } from '@/domain/formations/ports/in/UpdateModuleUseCase';
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
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

// Mock du repository
const mockModuleRepository: jest.Mocked<ModuleRepository> = {
  save: jest.fn(),
  findAll: jest.fn(),
  findByTitle: jest.fn(),
  findByThematic: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  findByTitleExceptId: jest.fn(),
  findByThematicExceptId: jest.fn(),
};

describe('UpdateModuleFormationUseCaseImpl', () => {
  let useCase: UpdateModuleFormationUseCaseImpl;

  beforeEach(() => {
    useCase = new UpdateModuleFormationUseCaseImpl(mockModuleRepository);
    jest.clearAllMocks();
  });

  const moduleId = EntityId.from('550e8400-e29b-41d4-a716-446655440000');
  const existingModule = new Module({
    id: moduleId,
    title: 'Module Original',
    description: 'Description originale',
    imageMediaId: 'image-123',
    thematics: 'finance',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.DRAFT,
    lessons: [],
    quizzes: [],
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  });

  describe('execute - cas de succès', () => {
    it('devrait mettre à jour le titre uniquement', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        title: 'Nouveau Titre',
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.findByTitleExceptId.mockResolvedValue(null);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.findById).toHaveBeenCalledWith(command.id);
      expect(mockModuleRepository.findByTitleExceptId).toHaveBeenCalledWith(
        'Nouveau Titre',
        command.id
      );
      expect(mockModuleRepository.update).toHaveBeenCalledWith(existingModule);
      expect(result).toEqual(existingModule.toDTO());
    });

    it('devrait mettre à jour la thématique avec normalisation', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        thematics: 'GESTION DE PROJET',
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.findByThematicExceptId.mockResolvedValue(null);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.findByThematicExceptId).toHaveBeenCalledWith(
        'gestion de projet',
        command.id
      );
      expect(mockModuleRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('devrait mettre à jour la description', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        description: 'Nouvelle description détaillée',
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.update).toHaveBeenCalledWith(existingModule);
      expect(result).toEqual(existingModule.toDTO());
    });

    it("devrait mettre à jour l'imageMediaId", async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        imageMediaId: 'new-image-456',
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("devrait supprimer l'image (imageMediaId = null)", async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        imageMediaId: null,
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('devrait mettre à jour le niveau de difficulté', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        difficultyLevel: DifficultyLevel.EXPERT,
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('devrait mettre à jour la durée estimée', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        estimatedDuration: 120,
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('devrait mettre à jour le statut', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        status: ModuleStatus.PUBLISHED,
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('devrait mettre à jour plusieurs champs simultanément', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        title: 'Titre Mis à Jour',
        description: 'Description mise à jour',
        thematics: 'comptabilité',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        imageMediaId: 'new-image-789',
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.findByTitleExceptId.mockResolvedValue(null);
      mockModuleRepository.findByThematicExceptId.mockResolvedValue(null);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.findById).toHaveBeenCalledWith(command.id);
      expect(mockModuleRepository.findByTitleExceptId).toHaveBeenCalledWith(
        'Titre Mis à Jour',
        command.id
      );
      expect(mockModuleRepository.findByThematicExceptId).toHaveBeenCalledWith(
        'comptabilité',
        command.id
      );
      expect(mockModuleRepository.update).toHaveBeenCalledWith(existingModule);
      expect(result).toEqual(existingModule.toDTO());
    });

    it("ne devrait mettre à jour aucun champ si la commande ne contient que l'id", async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.findById).toHaveBeenCalledWith(command.id);
      expect(mockModuleRepository.findByTitleExceptId).not.toHaveBeenCalled();
      expect(mockModuleRepository.findByThematicExceptId).not.toHaveBeenCalled();
      expect(mockModuleRepository.update).toHaveBeenCalledWith(existingModule);
      expect(result).toEqual(existingModule.toDTO());
    });
  });

  describe("execute - cas d'erreur", () => {
    it("devrait lever NotFoundError si le module n'existe pas", async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: 'non-existent-id',
        title: 'Nouveau Titre',
      };

      mockModuleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(command)).rejects.toThrow(
        'module with id non-existent-id not found'
      );
      expect(mockModuleRepository.update).not.toHaveBeenCalled();
    });

    it('devrait lever DuplicateTitleException si le titre existe déjà', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        title: 'Titre Existant',
      };

      const otherModule = new Module({
        id: EntityId.from('650e8400-e29b-41d4-a716-446655440001'),
        title: 'Titre Existant',
        description: 'Autre module',
        imageMediaId: null,
        thematics: 'autre',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        lessons: [],
        quizzes: [],
      });

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.findByTitleExceptId.mockResolvedValue(otherModule);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(DuplicateTitleException);
      expect(mockModuleRepository.update).not.toHaveBeenCalled();
    });

    it('devrait lever DuplicateThematicException si la thématique existe déjà', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        thematics: 'Finance Avancée',
      };

      const otherModule = new Module({
        id: EntityId.from('650e8400-e29b-41d4-a716-446655440002'),
        title: 'Autre Module',
        description: 'Autre description',
        imageMediaId: null,
        thematics: 'finance avancée',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 120,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
      });

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.findByThematicExceptId.mockResolvedValue(otherModule);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(DuplicateThematicException);
      expect(mockModuleRepository.update).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs du repository lors de la mise à jour', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        title: 'Nouveau Titre',
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.findByTitleExceptId.mockResolvedValue(null);
      mockModuleRepository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow('Database error');
    });
  });

  describe('execute - cas limites', () => {
    it('devrait rejeter une durée estimée de 0', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        estimatedDuration: 0,
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);

      // Act & Assert
      await expect(useCase.execute(command)).rejects.toThrow(
        'La durée estimée doit être supérieure à 0'
      );
      expect(mockModuleRepository.update).not.toHaveBeenCalled();
    });

    it('devrait normaliser les thématiques avec espaces multiples', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        thematics: '  Finance   et   Comptabilité  ',
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.findByThematicExceptId.mockResolvedValue(null);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.findByThematicExceptId).toHaveBeenCalledWith(
        'finance   et   comptabilité',
        command.id
      );
      expect(result).toBeDefined();
    });

    it("devrait permettre le même titre si c'est le module actuel", async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        title: 'Module Original', // même titre
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.findByTitleExceptId.mockResolvedValue(null); // pas d'autre module
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.findByTitleExceptId).toHaveBeenCalledWith(
        'Module Original',
        command.id
      );
      expect(result).toBeDefined();
    });

    it("devrait permettre la même thématique si c'est le module actuel", async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        thematics: 'finance', // même thématique
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.findByThematicExceptId.mockResolvedValue(null);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(mockModuleRepository.findByThematicExceptId).toHaveBeenCalledWith(
        'finance',
        command.id
      );
      expect(result).toBeDefined();
    });
  });

  describe('execute - différents statuts', () => {
    it('devrait mettre à jour un module de DRAFT vers PUBLISHED', async () => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        status: ModuleStatus.PUBLISHED,
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBeDefined();
    });

    it('devrait mettre à jour un module de PUBLISHED vers ARCHIVED', async () => {
      // Arrange
      const publishedModule = new Module({
        id: moduleId,
        title: existingModule.title,
        description: existingModule.description,
        imageMediaId: existingModule.imageMediaId,
        thematics: existingModule.thematics,
        difficultyLevel: existingModule.difficultyLevel,
        estimatedDuration: existingModule.estimatedDuration,
        status: ModuleStatus.PUBLISHED,
        lessons: [],
        quizzes: [],
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        status: ModuleStatus.ARCHIVED,
      };

      mockModuleRepository.findById.mockResolvedValue(publishedModule);
      mockModuleRepository.update.mockResolvedValue(publishedModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('execute - différents niveaux de difficulté', () => {
    it.each([
      DifficultyLevel.BEGINNER,
      DifficultyLevel.INTERMEDIATE,
      DifficultyLevel.ADVANCED,
      DifficultyLevel.EXPERT,
    ])('devrait mettre à jour le niveau de difficulté vers %s', async level => {
      // Arrange
      const command: UpdateModuleUseCommand = {
        id: moduleId.getValue(),
        difficultyLevel: level,
      };

      mockModuleRepository.findById.mockResolvedValue(existingModule);
      mockModuleRepository.update.mockResolvedValue(existingModule);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(mockModuleRepository.update).toHaveBeenCalled();
    });
  });
});
