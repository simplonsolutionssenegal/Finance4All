import type { CreateModuleData, Module } from '@/types/modules/module';
// eslint-disable-next-line no-duplicate-imports
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

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

    it('toutes les valeurs sont des chaînes de caractères', () => {
      const statuses = Object.values(ModuleStatus);
      statuses.forEach(status => {
        expect(typeof status).toBe('string');
      });
    });

    it('peut être utilisé pour la validation de type', () => {
      const isValidModuleStatus = (value: string): value is ModuleStatus => {
        return Object.values(ModuleStatus).includes(value as ModuleStatus);
      };

      expect(isValidModuleStatus('DRAFT')).toBe(true);
      expect(isValidModuleStatus('INVALID')).toBe(false);
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

  describe('Interface Module', () => {
    // ✅ On met 90min pour coller au test de résumé "1h30min"
    const mockModule: Module = {
      id: 'module-123',
      title: 'Introduction aux Finances',
      description: "Module d'introduction aux concepts financiers de base",
      thematics: 'éducation financière',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 90,
      status: ModuleStatus.PUBLISHED,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
    };

    it('peut être créé avec toutes les propriétés requises', () => {
      expect(mockModule.id).toBe('module-123');
      expect(mockModule.title).toBe('Introduction aux Finances');
      expect(mockModule.description).toBe("Module d'introduction aux concepts financiers de base");
      expect(mockModule.thematics).toBe('éducation financière');
      expect(mockModule.difficultyLevel).toBe(DifficultyLevel.BEGINNER);
      expect(mockModule.estimatedDuration).toBe(90);
      expect(mockModule.status).toBe(ModuleStatus.PUBLISHED);
    });

    it('toutes les propriétés requises sont présentes', () => {
      expect(mockModule).toHaveProperty('id');
      expect(mockModule).toHaveProperty('title');
      expect(mockModule).toHaveProperty('description');
      expect(mockModule).toHaveProperty('thematics');
      expect(mockModule).toHaveProperty('difficultyLevel');
      expect(mockModule).toHaveProperty('estimatedDuration');
      expect(mockModule).toHaveProperty('status');
      expect(mockModule).toHaveProperty('createdAt');
      expect(mockModule).toHaveProperty('updatedAt');
    });

    it('ne contient pas imageUrl dans sa structure', () => {
      expect(mockModule).not.toHaveProperty('imageUrl');
      expect(mockModule).not.toHaveProperty('imageMediaId');
    });

    it('thematics est une chaîne de caractères obligatoire', () => {
      expect(typeof mockModule.thematics).toBe('string');
      expect(mockModule.thematics.length).toBeGreaterThan(0);
    });

    it('peut avoir différentes thématiques', () => {
      const moduleWithDifferentThematic: Module = {
        ...mockModule,
        thematics: 'investissement et épargne',
      };

      expect(moduleWithDifferentThematic.thematics).toBe('investissement et épargne');
      expect(typeof moduleWithDifferentThematic.thematics).toBe('string');
    });

    it('a des propriétés de date au format ISO string', () => {
      expect(typeof mockModule.createdAt).toBe('string');
      expect(typeof mockModule.updatedAt).toBe('string');
      expect(new Date(mockModule.createdAt)).toBeInstanceOf(Date);
      expect(new Date(mockModule.updatedAt)).toBeInstanceOf(Date);
    });

    it("peut être utilisé pour calculer l'âge du module", () => {
      const calculateModuleAge = (mod: Module): number => {
        const created = new Date(mod.createdAt);
        const now = new Date();
        return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      };

      const moduleAge = calculateModuleAge(mockModule);
      expect(typeof moduleAge).toBe('number');
      expect(moduleAge).toBeGreaterThan(0);
    });

    it('peut être utilisé pour vérifier si le module a été modifié', () => {
      const wasModified = (mod: Module): boolean => {
        return mod.createdAt !== mod.updatedAt;
      };

      expect(wasModified(mockModule)).toBe(true);

      const unmodifiedModule: Module = {
        ...mockModule,
        updatedAt: mockModule.createdAt,
      };

      expect(wasModified(unmodifiedModule)).toBe(false);
    });

    it('estimatedDuration est un nombre positif', () => {
      expect(typeof mockModule.estimatedDuration).toBe('number');
      expect(mockModule.estimatedDuration).toBeGreaterThan(0);
    });

    it('peut calculer la durée en heures et minutes', () => {
      const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}min`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h${mins}min`;
      };

      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(90)).toBe('1h30min');
      expect(formatDuration(45)).toBe('45min');
    });
  });

  describe('Interface CreateModuleData', () => {
    const mockCreateData: CreateModuleData = {
      title: 'Nouveau Module',
      description: 'Description du nouveau module de formation financière',
      imageMediaId: 'media-123',
      difficultyLevel: DifficultyLevel.INTERMEDIATE,
      estimatedDuration: 90,
      thematics: 'investissement',
    };

    it('peut être créé avec toutes les propriétés requises', () => {
      expect(mockCreateData.title).toBe('Nouveau Module');
      expect(mockCreateData.description).toBe(
        'Description du nouveau module de formation financière'
      );
      expect(mockCreateData.difficultyLevel).toBe(DifficultyLevel.INTERMEDIATE);
      expect(mockCreateData.estimatedDuration).toBe(90);
      expect(mockCreateData.thematics).toBe('investissement');
    });

    it('toutes les propriétés requises sont présentes', () => {
      expect(mockCreateData).toHaveProperty('title');
      expect(mockCreateData).toHaveProperty('description');
      expect(mockCreateData).toHaveProperty('difficultyLevel');
      expect(mockCreateData).toHaveProperty('estimatedDuration');
      expect(mockCreateData).toHaveProperty('thematics');
    });

    it('thematics est une chaîne de caractères obligatoire', () => {
      expect(typeof mockCreateData.thematics).toBe('string');
      expect(mockCreateData.thematics.length).toBeGreaterThan(0);
    });

    it('peut avoir un imageMediaId optionnel', () => {
      const createDataWithoutImage: CreateModuleData = {
        ...mockCreateData,
        imageMediaId: undefined,
      };

      expect(createDataWithoutImage.imageMediaId).toBeUndefined();

      const createDataWithNullImage: CreateModuleData = {
        ...mockCreateData,
        imageMediaId: null,
      };

      expect(createDataWithNullImage.imageMediaId).toBeNull();
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
          lessons: [], // ✅
          quizzes: [], // ✅
          ...data,
          status: ModuleStatus.DRAFT,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      };

      const moduleResult = convertToModule(mockCreateData);

      expect(moduleResult.id).toBeDefined();
      expect(moduleResult.title).toBe(mockCreateData.title);
      expect(moduleResult.thematics).toBe(mockCreateData.thematics);
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
        title: 'AB',
        description: 'Court',
        estimatedDuration: 2,
        thematics: '',
      };

      expect(validateCreateData(invalidData)).toBe(false);
    });

    it('validation des longueurs minimales', () => {
      const validateLengths = (
        data: CreateModuleData
      ): {
        title: boolean;
        description: boolean;
        thematics: boolean;
      } => {
        return {
          title: data.title.length >= 3,
          description: data.description.length >= 10,
          thematics: data.thematics.length > 0,
        };
      };

      const validation = validateLengths(mockCreateData);
      expect(validation.title).toBe(true);
      expect(validation.description).toBe(true);
      expect(validation.thematics).toBe(true);
    });

    it('validation de la durée estimée', () => {
      const isValidDuration = (duration: number): boolean => {
        return duration >= 5 && duration <= 1440;
      };

      expect(isValidDuration(mockCreateData.estimatedDuration)).toBe(true);
      expect(isValidDuration(2)).toBe(false);
      expect(isValidDuration(1500)).toBe(false);
    });
  });

  describe('Compatibilité des types', () => {
    it('CreateModuleData est compatible avec les propriétés de Module', () => {
      const createData: CreateModuleData = {
        title: 'Test Module',
        description: 'Description de test pour vérifier la compatibilité des types',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 45,
        thematics: 'éducation financière',
      };

      const moduleData: Module = {
        id: 'generated-id',
        lessons: [], // ✅
        quizzes: [], // ✅
        ...createData,
        status: ModuleStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(moduleData.title).toBe(createData.title);
      expect(moduleData.description).toBe(createData.description);
      expect(moduleData.difficultyLevel).toBe(createData.difficultyLevel);
      expect(moduleData.estimatedDuration).toBe(createData.estimatedDuration);
      expect(moduleData.thematics).toBe(createData.thematics);
    });

    it('les enums peuvent être utilisés interchangeablement', () => {
      const difficulty: DifficultyLevel = DifficultyLevel.ADVANCED;
      const status: ModuleStatus = ModuleStatus.PUBLISHED;

      const testModule: Partial<Module> = {
        difficultyLevel: difficulty,
        status,
        thematics: 'test thématique',
      };

      expect(testModule.difficultyLevel).toBe(DifficultyLevel.ADVANCED);
      expect(testModule.status).toBe(ModuleStatus.PUBLISHED);
      expect(testModule.thematics).toBe('test thématique');
    });

    it('les types peuvent être étendus sans conflit', () => {
      interface ExtendedModule extends Module {
        tags?: string[];
        isPopular?: boolean;
        viewCount?: number;
      }

      const extendedModule: ExtendedModule = {
        id: 'extended-123',
        title: 'Module Étendu',
        description: 'Module avec propriétés supplémentaires',
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 120,
        thematics: 'entrepreneuriat',
        status: ModuleStatus.PUBLISHED,
        lessons: [], // ✅
        quizzes: [], // ✅
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['populaire', 'recommandé'],
        isPopular: true,
        viewCount: 1250,
      };

      expect(extendedModule.tags).toContain('populaire');
      expect(extendedModule.isPopular).toBe(true);
      expect(extendedModule.viewCount).toBe(1250);
      expect(extendedModule.title).toBe('Module Étendu');
      expect(extendedModule.difficultyLevel).toBe(DifficultyLevel.EXPERT);
      expect(extendedModule.thematics).toBe('entrepreneuriat');
    });

    it('peut créer des types partiels pour les mises à jour', () => {
      type UpdateModuleData = Partial<Omit<Module, 'id' | 'createdAt'>>;

      const updateData: UpdateModuleData = {
        title: 'Titre Mis à Jour',
        status: ModuleStatus.PUBLISHED,
        updatedAt: new Date().toISOString(),
      };

      expect(updateData.title).toBe('Titre Mis à Jour');
      expect(updateData.status).toBe(ModuleStatus.PUBLISHED);
      expect(updateData).not.toHaveProperty('id');
      expect(updateData).not.toHaveProperty('createdAt');
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
          typeof obj.thematics === 'string' &&
          Object.values(DifficultyLevel).includes(obj.difficultyLevel) &&
          typeof obj.estimatedDuration === 'number' &&
          Object.values(ModuleStatus).includes(obj.status) &&
          typeof obj.createdAt === 'string' &&
          typeof obj.updatedAt === 'string'
        );
      };

      const validModule = {
        id: 'test-123',
        title: 'Test Module',
        description: 'Description de test',
        thematics: 'éducation financière',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const invalidObject = {
        id: 123,
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
          typeof obj.thematics === 'string' &&
          Object.values(DifficultyLevel).includes(obj.difficultyLevel) &&
          typeof obj.estimatedDuration === 'number'
        );
      };

      const validCreateData = {
        title: 'Nouveau Module',
        description: 'Description du module',
        thematics: 'investissement',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
      };

      const invalidCreateData = {
        title: 123,
        description: 'Description',
      };

      expect(isCreateModuleData(validCreateData)).toBe(true);
      expect(isCreateModuleData(invalidCreateData)).toBe(false);
    });

    it('peut valider la structure complète des données', () => {
      const validateModuleStructure = (obj: any): obj is Module => {
        const hasRequiredStringProps =
          typeof obj.id === 'string' &&
          typeof obj.title === 'string' &&
          typeof obj.description === 'string' &&
          typeof obj.thematics === 'string' &&
          typeof obj.createdAt === 'string' &&
          typeof obj.updatedAt === 'string';

        const hasValidEnums =
          Object.values(DifficultyLevel).includes(obj.difficultyLevel) &&
          Object.values(ModuleStatus).includes(obj.status);

        const hasValidNumbers =
          typeof obj.estimatedDuration === 'number' && obj.estimatedDuration > 0;

        return hasRequiredStringProps && hasValidEnums && hasValidNumbers;
      };

      const validModule: Module = {
        id: 'test-123',
        title: 'Test',
        description: 'Description',
        thematics: 'test',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(validateModuleStructure(validModule)).toBe(true);
      expect(validateModuleStructure({ ...validModule, estimatedDuration: -5 })).toBe(false);
      expect(validateModuleStructure({ ...validModule, title: 123 })).toBe(false);
    });
  });

  describe('Scénarios de transformation de données', () => {
    const testModule: Module = {
      id: 'module-xyz',
      title: 'Introduction aux Finances',
      description: 'Description',
      thematics: 'éducation financière',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 90,
      status: ModuleStatus.PUBLISHED,
      createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
      updatedAt: new Date('2024-01-02T00:00:00.000Z').toISOString(),
    };

    it('peut transformer Module en CreateModuleData', () => {
      const moduleToCreateData = (m: Module): CreateModuleData => {
        return {
          title: m.title,
          description: m.description,
          thematics: m.thematics,
          difficultyLevel: m.difficultyLevel,
          estimatedDuration: m.estimatedDuration,
        };
      };

      const createData = moduleToCreateData(testModule);

      expect(createData.title).toBe(testModule.title);
      expect(createData.thematics).toBe(testModule.thematics);
      expect(createData).not.toHaveProperty('id');
      expect(createData).not.toHaveProperty('status');
    });

    it('peut normaliser les thématiques en minuscules', () => {
      const normalizeThematics = (thematics: string): string => {
        return thematics.toLowerCase().trim();
      };

      expect(normalizeThematics('ÉDUCATION FINANCIÈRE')).toBe('éducation financière');
      expect(normalizeThematics('  Investissement  ')).toBe('investissement');
      expect(normalizeThematics('Gestion de Budget')).toBe('gestion de budget');
    });

    it('peut créer un résumé de module', () => {
      const createModuleSummary = (m: Module): string => {
        const duration =
          m.estimatedDuration >= 60
            ? `${Math.floor(m.estimatedDuration / 60)}h${
                m.estimatedDuration % 60 > 0 ? `${m.estimatedDuration % 60}min` : ''
              }`
            : `${m.estimatedDuration}min`;

        return `${m.title} - ${m.thematics} (${duration}, ${m.difficultyLevel})`;
      };

      expect(createModuleSummary(testModule)).toBe(
        'Introduction aux Finances - éducation financière (1h30min, BEGINNER)'
      );
    });
  });
});
