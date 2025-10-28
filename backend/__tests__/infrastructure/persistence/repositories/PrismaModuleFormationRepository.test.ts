// backend/__tests__/infrastructure/persistence/repositories/PrismaModuleFormationRepository.test.ts

import { PrismaModuleFormationRepository } from '@/infrastructure/persistence/repositories/PrismaModuleFormationRepository';
import {
  Module,
  ModuleStatus,
  DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';
import { Thematic } from '@/domain/formations/value-objects/Thematic';
import type { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

type PrismaModule = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  thematics: string[];
  difficultyLevel: string | null;
  estimatedDuration: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

describe('PrismaModuleFormationRepository', () => {
  let repository: PrismaModuleFormationRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let testUuid1: string;
  let testUuid2: string;

  beforeEach(() => {
    testUuid1 = randomUUID();
    testUuid2 = randomUUID();

    mockPrisma = {
      module: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    repository = new PrismaModuleFormationRepository(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('devrait sauvegarder un module avec succès', async () => {
      // Arrange
      const module = new Module({
        id: EntityId.from(testUuid1),
        title: 'Introduction aux Finances',
        description: "Module d'introduction aux concepts financiers de base",
        imageUrl: 'https://example.com/image.jpg',
        thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      const mockPrismaModule: PrismaModule = {
        id: testUuid1,
        title: 'Introduction aux Finances',
        description: "Module d'introduction aux concepts financiers de base",
        imageUrl: 'https://example.com/image.jpg',
        thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      (mockPrisma.module.create as jest.Mock).mockResolvedValue(mockPrismaModule);

      // Act
      const result = await repository.save(module);

      // Assert
      expect(mockPrisma.module.create).toHaveBeenCalledWith({
        data: {
          id: testUuid1,
          title: 'Introduction aux Finances',
          description: "Module d'introduction aux concepts financiers de base",
          imageUrl: 'https://example.com/image.jpg',
          thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.DRAFT,
        },
      });

      expect(result).toBeInstanceOf(Module);
      expect(result.id.getValue()).toBe(testUuid1);
      expect(result.title).toBe('Introduction aux Finances');
      expect(result.description).toBe("Module d'introduction aux concepts financiers de base");
      expect(result.imageUrl).toBe('https://example.com/image.jpg');
      expect(result.thematics).toEqual([Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT]);
      expect(result.difficultyLevel).toBe(DifficultyLevel.BEGINNER);
      expect(result.estimatedDuration).toBe(60);
      expect(result.status).toBe(ModuleStatus.DRAFT);
    });

    it('devrait sauvegarder un module avec imageUrl null', async () => {
      // Arrange
      const module = new Module({
        id: EntityId.from(testUuid1),
        title: 'Module sans image',
        description: 'Description du module',
        imageUrl: null,
        thematics: [Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      const mockPrismaModule: PrismaModule = {
        id: testUuid1,
        title: 'Module sans image',
        description: 'Description du module',
        imageUrl: null,
        thematics: [Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      (mockPrisma.module.create as jest.Mock).mockResolvedValue(mockPrismaModule);

      // Act
      const result = await repository.save(module);

      // Assert
      expect(mockPrisma.module.create).toHaveBeenCalledWith({
        data: {
          id: testUuid1,
          title: 'Module sans image',
          description: 'Description du module',
          imageUrl: null,
          thematics: [Thematic.INVESTMENT],
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 90,
          status: ModuleStatus.PUBLISHED,
        },
      });

      expect(result.imageUrl).toBeNull();
    });

    it('devrait gérer les erreurs de Prisma lors de la sauvegarde', async () => {
      // Arrange
      const module = new Module({
        id: EntityId.from(testUuid1),
        title: 'Module Test',
        description: 'Description',
        imageUrl: null,
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const prismaError = new Error('Database connection failed');
      (mockPrisma.module.create as jest.Mock).mockRejectedValue(prismaError);

      // Act & Assert
      await expect(repository.save(module)).rejects.toThrow('Database connection failed');
      expect(mockPrisma.module.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('devrait récupérer tous les modules avec succès', async () => {
      // Arrange
      const mockPrismaModules: PrismaModule[] = [
        {
          id: testUuid1,
          title: 'Premier Module',
          description: 'Description du premier module',
          imageUrl: 'https://example.com/image1.jpg',
          thematics: [Thematic.FINANCIAL_EDUCATION],
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 60,
          status: ModuleStatus.PUBLISHED,
          createdAt: new Date('2024-01-02T10:00:00Z'),
          updatedAt: new Date('2024-01-02T10:00:00Z'),
        },
        {
          id: testUuid2,
          title: 'Deuxième Module',
          description: 'Description du deuxième module',
          imageUrl: null,
          thematics: [Thematic.INVESTMENT, Thematic.SAVING],
          difficultyLevel: DifficultyLevel.ADVANCED,
          estimatedDuration: 120,
          status: ModuleStatus.DRAFT,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      (mockPrisma.module.findMany as jest.Mock).mockResolvedValue(mockPrismaModules);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockPrisma.module.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toHaveLength(2);

      // Vérifier le premier module
      expect(result[0]).toBeInstanceOf(Module);
      expect(result[0].id.getValue()).toBe(testUuid1);
      expect(result[0].title).toBe('Premier Module');
      expect(result[0].imageUrl).toBe('https://example.com/image1.jpg');
      expect(result[0].thematics).toEqual([Thematic.FINANCIAL_EDUCATION]);
      expect(result[0].difficultyLevel).toBe(DifficultyLevel.BEGINNER);
      expect(result[0].status).toBe(ModuleStatus.PUBLISHED);

      // Vérifier le deuxième module
      expect(result[1]).toBeInstanceOf(Module);
      expect(result[1].id.getValue()).toBe(testUuid2);
      expect(result[1].title).toBe('Deuxième Module');
      expect(result[1].imageUrl).toBeNull();
      expect(result[1].thematics).toEqual([Thematic.INVESTMENT, Thematic.SAVING]);
      expect(result[1].difficultyLevel).toBe(DifficultyLevel.ADVANCED);
      expect(result[1].status).toBe(ModuleStatus.DRAFT);
    });

    it("devrait retourner un tableau vide si aucun module n'existe", async () => {
      // Arrange
      (mockPrisma.module.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockPrisma.module.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([]);
    });

    it('devrait gérer les erreurs de Prisma lors de la récupération', async () => {
      // Arrange
      const prismaError = new Error('Database query failed');
      (mockPrisma.module.findMany as jest.Mock).mockRejectedValue(prismaError);

      // Act & Assert
      await expect(repository.findAll()).rejects.toThrow('Database query failed');
      expect(mockPrisma.module.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("toDomain (méthode privée via tests d'intégration)", () => {
    it('devrait convertir correctement un objet Prisma en entité Module', async () => {
      // Arrange
      const mockPrismaModule: PrismaModule = {
        id: testUuid1,
        title: 'Test Module',
        description: 'Test Description',
        imageUrl: 'https://test.com/image.jpg',
        thematics: [Thematic.ENTREPRENEURSHIP, Thematic.TAXATION],
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 180,
        status: ModuleStatus.ARCHIVED,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T12:00:00Z'),
      };

      (mockPrisma.module.findMany as jest.Mock).mockResolvedValue([mockPrismaModule]);

      // Act
      const result = await repository.findAll();

      // Assert
      const module = result[0];
      expect(module.id.getValue()).toBe(testUuid1);
      expect(module.title).toBe('Test Module');
      expect(module.description).toBe('Test Description');
      expect(module.imageUrl).toBe('https://test.com/image.jpg');
      expect(module.thematics).toEqual([Thematic.ENTREPRENEURSHIP, Thematic.TAXATION]);
      expect(module.difficultyLevel).toBe(DifficultyLevel.EXPERT);
      expect(module.estimatedDuration).toBe(180);
      expect(module.status).toBe(ModuleStatus.ARCHIVED);
    });

    it('devrait gérer les valeurs null et undefined dans la conversion', async () => {
      // Arrange
      const mockPrismaModule: PrismaModule = {
        id: testUuid1,
        title: 'Module avec valeurs nulles',
        description: 'Description',
        imageUrl: null,
        thematics: [Thematic.INSURANCE],
        difficultyLevel: null,
        estimatedDuration: null,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      (mockPrisma.module.findMany as jest.Mock).mockResolvedValue([mockPrismaModule]);

      // Act
      const result = await repository.findAll();

      // Assert
      const module = result[0];
      expect(module.imageUrl).toBeNull();
      expect(module.difficultyLevel).toBeUndefined();
      expect(module.estimatedDuration).toBe(0); // Valeur par défaut
    });
  });

  describe("Tests d'intégration", () => {
    it('devrait permettre un workflow complet de sauvegarde et récupération', async () => {
      // Arrange
      const originalModule = new Module({
        id: EntityId.from(testUuid1),
        title: 'Module Intégration',
        description: "Test d'intégration complet",
        imageUrl: 'https://integration.test/image.jpg',
        thematics: [Thematic.BUDGET_MANAGEMENT, Thematic.PERSONAL_DEVELOPMENT],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 75,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      });

      const mockSavedModule: PrismaModule = {
        id: testUuid1,
        title: 'Module Intégration',
        description: "Test d'intégration complet",
        imageUrl: 'https://integration.test/image.jpg',
        thematics: [Thematic.BUDGET_MANAGEMENT, Thematic.PERSONAL_DEVELOPMENT],
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 75,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      (mockPrisma.module.create as jest.Mock).mockResolvedValue(mockSavedModule);
      (mockPrisma.module.findMany as jest.Mock).mockResolvedValue([mockSavedModule]);

      // Act - Sauvegarder
      const savedModule = await repository.save(originalModule);

      // Act - Récupérer
      const foundModules = await repository.findAll();

      // Assert
      expect(savedModule.id.getValue()).toBe(originalModule.id.getValue());
      expect(foundModules).toHaveLength(1);
      expect(foundModules[0].id.getValue()).toBe(originalModule.id.getValue());
      expect(foundModules[0].title).toBe(originalModule.title);

      // Vérifier que les appels Prisma ont été effectués
      expect(mockPrisma.module.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.module.findMany).toHaveBeenCalledTimes(1);
    });

    it("devrait maintenir l'ordre de tri par date de création descendante", async () => {
      // Arrange
      const olderModule: PrismaModule = {
        id: testUuid1,
        title: 'Module Plus Ancien',
        description: 'Description',
        imageUrl: null,
        thematics: [Thematic.SAVING],
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
      };

      const newerModule: PrismaModule = {
        id: testUuid2,
        title: 'Module Plus Récent',
        description: 'Description',
        imageUrl: null,
        thematics: [Thematic.INVESTMENT],
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date('2024-01-02T10:00:00Z'),
        updatedAt: new Date('2024-01-02T10:00:00Z'),
      };

      // Retourner dans l'ordre décroissant (plus récent en premier)
      (mockPrisma.module.findMany as jest.Mock).mockResolvedValue([newerModule, olderModule]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockPrisma.module.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });

      expect(result[0].title).toBe('Module Plus Récent');
      expect(result[1].title).toBe('Module Plus Ancien');
    });
  });
});
