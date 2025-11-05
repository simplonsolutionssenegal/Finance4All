// frontend/__tests__/types/module.test.ts

import type { CreateModuleData, Module } from '@/types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import { DifficultyLevel, ModuleStatus, Thematic } from '@/types/modules/module';

describe('Types de module', () => {
  describe('Enum DifficultyLevel', () => {
    it('contient toutes les valeurs de difficulté attendues', () => {
      expect(DifficultyLevel.BEGINNER).toBe('BEGINNER');
      expect(DifficultyLevel.INTERMEDIATE).toBe('INTERMEDIATE');
      expect(DifficultyLevel.ADVANCED).toBe('ADVANCED');
      expect(DifficultyLevel.EXPERT).toBe('EXPERT');
    });

    it('contient exactement 4 niveaux de difficulté', () => {
      const levels = Object.values(DifficultyLevel);
      expect(levels).toHaveLength(4);
    });

    it('toutes les valeurs sont des chaînes de caractères', () => {
      const levels = Object.values(DifficultyLevel);
      levels.forEach(level => {
        expect(typeof level).toBe('string');
      });
    });

    it('peut être utilisé pour la validation de type', () => {
      const isValidDifficultyLevel = (value: string): value is DifficultyLevel => {
        return Object.values(DifficultyLevel).includes(value as DifficultyLevel);
      };

      expect(isValidDifficultyLevel('BEGINNER')).toBe(true);
      expect(isValidDifficultyLevel('INVALID')).toBe(false);
    });
  });

  describe('Enum ModuleStatus', () => {
    it('contient toutes les valeurs de statut attendues', () => {
      expect(ModuleStatus.DRAFT).toBe('DRAFT');
      expect(ModuleStatus.PUBLISHED).toBe('PUBLISHED');
      expect(ModuleStatus.ARCHIVED).toBe('ARCHIVED');
    });

    it('contient exactement 3 statuts', () => {
      const statuses = Object.values(ModuleStatus);
      expect(statuses).toHaveLength(3);
    });

    it('peut être utilisé pour déterminer la visibilité', () => {
      const isPubliclyVisible = (status: ModuleStatus): boolean => {
        return status === ModuleStatus.PUBLISHED;
      };

      expect(isPubliclyVisible(ModuleStatus.PUBLISHED)).toBe(true);
      expect(isPubliclyVisible(ModuleStatus.DRAFT)).toBe(false);
      expect(isPubliclyVisible(ModuleStatus.ARCHIVED)).toBe(false);
    });
  });

  describe('Enum Thematic', () => {
    it('contient toutes les thématiques attendues', () => {
      expect(Thematic.FINANCIAL_EDUCATION).toBe('FINANCIAL_EDUCATION');
      expect(Thematic.PERSONAL_DEVELOPMENT).toBe('PERSONAL_DEVELOPMENT');
      expect(Thematic.FINANCIAL_LOAN).toBe('FINANCIAL_LOAN');
      expect(Thematic.BANK_CREDIT).toBe('BANK_CREDIT');
      expect(Thematic.INVESTMENT).toBe('INVESTMENT');
      expect(Thematic.BUDGET_MANAGEMENT).toBe('BUDGET_MANAGEMENT');
      expect(Thematic.SAVING).toBe('SAVING');
      expect(Thematic.ENTREPRENEURSHIP).toBe('ENTREPRENEURSHIP');
      expect(Thematic.TAXATION).toBe('TAXATION');
      expect(Thematic.INSURANCE).toBe('INSURANCE');
    });

    it('contient exactement 10 thématiques', () => {
      const thematics = Object.values(Thematic);
      expect(thematics).toHaveLength(10);
    });

    it('peut être groupé par catégories', () => {
      const getCategory = (thematic: Thematic): string => {
        const financialCategories = [
          Thematic.FINANCIAL_EDUCATION,
          Thematic.FINANCIAL_LOAN,
          Thematic.BANK_CREDIT,
          Thematic.INVESTMENT,
          Thematic.BUDGET_MANAGEMENT,
          Thematic.SAVING,
          Thematic.TAXATION,
          Thematic.INSURANCE,
        ];

        if (financialCategories.includes(thematic)) {
          return 'financial';
        }
        if (thematic === Thematic.PERSONAL_DEVELOPMENT) {
          return 'personal';
        }
        if (thematic === Thematic.ENTREPRENEURSHIP) {
          return 'business';
        }
        return 'other';
      };

      expect(getCategory(Thematic.FINANCIAL_EDUCATION)).toBe('financial');
      expect(getCategory(Thematic.PERSONAL_DEVELOPMENT)).toBe('personal');
      expect(getCategory(Thematic.ENTREPRENEURSHIP)).toBe('business');
    });

    it('peut être filtré par relevance financière', () => {
      const isFinancialThematic = (thematic: Thematic): boolean => {
        const financialThematics = [
          Thematic.FINANCIAL_EDUCATION,
          Thematic.FINANCIAL_LOAN,
          Thematic.BANK_CREDIT,
          Thematic.INVESTMENT,
          Thematic.BUDGET_MANAGEMENT,
          Thematic.SAVING,
          Thematic.TAXATION,
          Thematic.INSURANCE,
        ];
        return financialThematics.includes(thematic);
      };

      expect(isFinancialThematic(Thematic.INVESTMENT)).toBe(true);
      expect(isFinancialThematic(Thematic.PERSONAL_DEVELOPMENT)).toBe(false);
    });
  });

  describe('Interface Module', () => {
    const mockModule: Module = {
      id: 'module-123',
      title: 'Introduction aux Finances',
      description: "Module d'introduction aux concepts financiers de base",
      imageUrl: 'https://example.com/image.jpg',
      thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT],
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      status: ModuleStatus.PUBLISHED,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
    };

    it('peut être créé avec toutes les propriétés requises', () => {
      expect(mockModule.id).toBe('module-123');
      expect(mockModule.title).toBe('Introduction aux Finances');
      expect(mockModule.description).toBe("Module d'introduction aux concepts financiers de base");
      expect(mockModule.thematics).toHaveLength(2);
      expect(mockModule.difficultyLevel).toBe(DifficultyLevel.BEGINNER);
      expect(mockModule.estimatedDuration).toBe(60);
      expect(mockModule.status).toBe(ModuleStatus.PUBLISHED);
    });

    it('peut avoir une imageUrl optionnelle', () => {
      const moduleWithoutImage: Module = {
        ...mockModule,
        imageUrl: null,
      };

      expect(moduleWithoutImage.imageUrl).toBeNull();

      const moduleWithImage: Module = {
        ...mockModule,
        imageUrl: 'https://example.com/image.jpg',
      };

      expect(moduleWithImage.imageUrl).toBe('https://example.com/image.jpg');

      const moduleWithUndefinedImage: Module = {
        ...mockModule,
        imageUrl: undefined,
      };

      expect(moduleWithUndefinedImage.imageUrl).toBeUndefined();
    });

    it('peut contenir plusieurs thématiques', () => {
      const moduleWithMultipleThematics: Module = {
        ...mockModule,
        thematics: [
          Thematic.FINANCIAL_EDUCATION,
          Thematic.INVESTMENT,
          Thematic.SAVING,
          Thematic.BUDGET_MANAGEMENT,
        ],
      };

      expect(moduleWithMultipleThematics.thematics).toHaveLength(4);
      expect(moduleWithMultipleThematics.thematics).toContain(Thematic.INVESTMENT);
    });

    it('a des propriétés de date au format ISO string', () => {
      expect(typeof mockModule.createdAt).toBe('string');
      expect(typeof mockModule.updatedAt).toBe('string');
      expect(new Date(mockModule.createdAt)).toBeInstanceOf(Date);
      expect(new Date(mockModule.updatedAt)).toBeInstanceOf(Date);
    });

    it("peut être utilisé pour calculer l'âge du module", () => {
      const calculateModuleAge = (module: Module): number => {
        const created = new Date(module.createdAt);
        const now = new Date();
        return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      };

      const moduleAge = calculateModuleAge(mockModule);
      expect(typeof moduleAge).toBe('number');
      expect(moduleAge).toBeGreaterThan(0);
    });

    it('peut être utilisé pour vérifier si le module a été modifié', () => {
      const wasModified = (module: Module): boolean => {
        return module.createdAt !== module.updatedAt;
      };

      expect(wasModified(mockModule)).toBe(true);

      const unmodifiedModule: Module = {
        ...mockModule,
        updatedAt: mockModule.createdAt,
      };

      expect(wasModified(unmodifiedModule)).toBe(false);
    });
  });

  describe('Interface CreateModuleData', () => {
    const mockCreateData: CreateModuleData = {
      title: 'Nouveau Module',
      description: 'Description du nouveau module de formation financière',
      imageUrl: 'https://example.com/new-image.jpg',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 90,
      thematics: [Thematic.INVESTMENT, Thematic.SAVING],
    };

    it('peut être créé avec toutes les propriétés requises', () => {
      expect(mockCreateData.title).toBe('Nouveau Module');
      expect(mockCreateData.description).toBe(
        'Description du nouveau module de formation financière'
      );
      expect(mockCreateData.difficultyLevel).toBe(DifficultyLevel.INTERMEDIATE);
      expect(mockCreateData.estimatedDuration).toBe(90);
      expect(mockCreateData.thematics).toHaveLength(2);
    });

    it('peut avoir une imageUrl optionnelle', () => {
      const createDataWithoutImage: CreateModuleData = {
        ...mockCreateData,
        imageUrl: undefined,
      };

      expect(createDataWithoutImage.imageUrl).toBeUndefined();

      const createDataWithNullImage: CreateModuleData = {
        ...mockCreateData,
        imageUrl: null,
      };

      expect(createDataWithNullImage.imageUrl).toBeNull();
    });

    it('ne contient pas les propriétés générées automatiquement', () => {
      const createData = mockCreateData as any;

      expect(createData.id).toBeUndefined();
      expect(createData.status).toBeUndefined();
      expect(createData.createdAt).toBeUndefined();
      expect(createData.updatedAt).toBeUndefined();
    });

    it('peut être converti en Module complet', () => {
      const convertToModule = (data: CreateModuleData): Module => {
        return {
          id: `module-${Date.now()}`,
          ...data,
          status: ModuleStatus.DRAFT,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      };

      const moduleResult = convertToModule(mockCreateData);

      expect(moduleResult.id).toBeDefined();
      expect(moduleResult.title).toBe(mockCreateData.title);
      expect(moduleResult.status).toBe(ModuleStatus.DRAFT);
      expect(moduleResult.createdAt).toBeDefined();
      expect(moduleResult.updatedAt).toBeDefined();
    });

    it('peut être validé avant la création', () => {
      const validateCreateData = (data: CreateModuleData): boolean => {
        return (
          data.title.length >= 3 &&
          data.description.length >= 10 &&
          data.estimatedDuration >= 5 &&
          data.thematics.length > 0
        );
      };

      expect(validateCreateData(mockCreateData)).toBe(true);

      const invalidData: CreateModuleData = {
        ...mockCreateData,
        title: 'AB', // trop court
        description: 'Court', // trop court
        estimatedDuration: 2, // trop court
        thematics: [], // vide
      };

      expect(validateCreateData(invalidData)).toBe(false);
    });
  });

  describe('Compatibilité des types', () => {
    it('CreateModuleData est compatible avec les propriétés de Module', () => {
      const createData: CreateModuleData = {
        title: 'Test Module',
        description: 'Description de test pour vérifier la compatibilité des types',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 45,
        thematics: [Thematic.FINANCIAL_EDUCATION],
      };

      // Simulation de la création d'un module à partir des données de création
      const moduleData: Module = {
        id: 'generated-id',
        ...createData,
        status: ModuleStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(moduleData.title).toBe(createData.title);
      expect(moduleData.description).toBe(createData.description);
      expect(moduleData.difficultyLevel).toBe(createData.difficultyLevel);
      expect(moduleData.estimatedDuration).toBe(createData.estimatedDuration);
      expect(moduleData.thematics).toEqual(createData.thematics);
    });

    it('les enums peuvent être utilisés interchangeablement', () => {
      const difficulty: DifficultyLevel = DifficultyLevel.ADVANCED;
      const status: ModuleStatus = ModuleStatus.PUBLISHED;
      const thematic: Thematic = Thematic.INVESTMENT;

      // Test d'assignation croisée
      const testModule: Partial<Module> = {
        difficultyLevel: difficulty,
        status,
        thematics: [thematic],
      };

      expect(testModule.difficultyLevel).toBe(DifficultyLevel.ADVANCED);
      expect(testModule.status).toBe(ModuleStatus.PUBLISHED);
      expect(testModule.thematics?.[0]).toBe(Thematic.INVESTMENT);
    });

    it('les types peuvent être étendus sans conflit', () => {
      interface ExtendedModule extends Module {
        tags?: string[];
        isPopular?: boolean;
      }

      const extendedModule: ExtendedModule = {
        id: 'extended-123',
        title: 'Module Étendu',
        description: 'Module avec propriétés supplémentaires',
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 120,
        thematics: [Thematic.ENTREPRENEURSHIP],
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['populaire', 'recommandé'],
        isPopular: true,
      };

      expect(extendedModule.tags).toContain('populaire');
      expect(extendedModule.isPopular).toBe(true);
      // Vérifier que les propriétés de base sont toujours présentes
      expect(extendedModule.title).toBe('Module Étendu');
      expect(extendedModule.difficultyLevel).toBe(DifficultyLevel.EXPERT);
    });
  });

  describe('Utilitaires de type', () => {
    it('peut créer des guards de type pour Module', () => {
      const isModule = (obj: any): obj is Module => {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          typeof obj.id === 'string' &&
          typeof obj.title === 'string' &&
          typeof obj.description === 'string' &&
          Object.values(DifficultyLevel).includes(obj.difficultyLevel) &&
          typeof obj.estimatedDuration === 'number' &&
          Array.isArray(obj.thematics) &&
          Object.values(ModuleStatus).includes(obj.status) &&
          typeof obj.createdAt === 'string' &&
          typeof obj.updatedAt === 'string'
        );
      };

      const validModule = {
        id: 'test-123',
        title: 'Test Module',
        description: 'Description de test',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        status: ModuleStatus.DRAFT,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const invalidObject = {
        id: 123, // devrait être string
        title: 'Test',
      };

      expect(isModule(validModule)).toBe(true);
      expect(isModule(invalidObject)).toBe(false);
      expect(isModule(null)).toBe(false);
      expect(isModule(undefined)).toBe(false);
    });

    it('peut créer des guards de type pour CreateModuleData', () => {
      const isCreateModuleData = (obj: any): obj is CreateModuleData => {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          typeof obj.title === 'string' &&
          typeof obj.description === 'string' &&
          Object.values(DifficultyLevel).includes(obj.difficultyLevel) &&
          typeof obj.estimatedDuration === 'number' &&
          Array.isArray(obj.thematics)
        );
      };

      const validCreateData = {
        title: 'Nouveau Module',
        description: 'Description du module',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        thematics: [Thematic.INVESTMENT],
      };

      const invalidCreateData = {
        title: 123, // devrait être string
        description: 'Description',
      };

      expect(isCreateModuleData(validCreateData)).toBe(true);
      expect(isCreateModuleData(invalidCreateData)).toBe(false);
    });
  });
});
