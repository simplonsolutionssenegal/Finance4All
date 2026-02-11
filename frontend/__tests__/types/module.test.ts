import type { CreateModuleData, Module, UpdateModuleData } from '@/types/modules/module';
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
      quizzes: [],
      lessons: [],
      imageMediaId: null,
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
          lessons: [],
          quizzes: [],
          ...data,
          imageMediaId: data.imageMediaId ?? null, // force string | null, élimine undefined
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

  describe('Interface UpdateModuleData', () => {
    const mockUpdateData: UpdateModuleData = {
      title: 'Titre Mis à Jour',
      description: 'Description mise à jour du module de formation',
      thematics: 'épargne',
      difficultyLevel: DifficultyLevel.ADVANCED,
      estimatedDuration: 120,
      status: ModuleStatus.PUBLISHED,
      imageMediaId: 'media-updated-456',
    };

    it('peut être créé avec toutes les propriétés optionnelles', () => {
      expect(mockUpdateData.title).toBe('Titre Mis à Jour');
      expect(mockUpdateData.description).toBe('Description mise à jour du module de formation');
      expect(mockUpdateData.thematics).toBe('épargne');
      expect(mockUpdateData.difficultyLevel).toBe(DifficultyLevel.ADVANCED);
      expect(mockUpdateData.estimatedDuration).toBe(120);
      expect(mockUpdateData.status).toBe(ModuleStatus.PUBLISHED);
      expect(mockUpdateData.imageMediaId).toBe('media-updated-456');
    });

    it('peut être un objet vide (tous les champs sont optionnels)', () => {
      const emptyUpdate: UpdateModuleData = {};
      expect(Object.keys(emptyUpdate).length).toBe(0);
    });

    it('peut contenir uniquement le titre', () => {
      const titleOnlyUpdate: UpdateModuleData = {
        title: 'Nouveau Titre',
      };
      expect(titleOnlyUpdate.title).toBe('Nouveau Titre');
      expect(titleOnlyUpdate.description).toBeUndefined();
      expect(titleOnlyUpdate.thematics).toBeUndefined();
    });

    it('peut contenir uniquement la description', () => {
      const descriptionOnlyUpdate: UpdateModuleData = {
        description: 'Nouvelle description complète',
      };
      expect(descriptionOnlyUpdate.description).toBe('Nouvelle description complète');
      expect(descriptionOnlyUpdate.title).toBeUndefined();
    });

    it('peut contenir uniquement le statut', () => {
      const statusOnlyUpdate: UpdateModuleData = {
        status: ModuleStatus.ARCHIVED,
      };
      expect(statusOnlyUpdate.status).toBe(ModuleStatus.ARCHIVED);
      expect(statusOnlyUpdate.title).toBeUndefined();
    });

    it('peut contenir uniquement la difficulté', () => {
      const difficultyOnlyUpdate: UpdateModuleData = {
        difficultyLevel: DifficultyLevel.EXPERT,
      };
      expect(difficultyOnlyUpdate.difficultyLevel).toBe(DifficultyLevel.EXPERT);
      expect(difficultyOnlyUpdate.title).toBeUndefined();
    });

    it("peut avoir imageMediaId null pour supprimer l'image", () => {
      const removeImageUpdate: UpdateModuleData = {
        imageMediaId: null,
      };
      expect(removeImageUpdate.imageMediaId).toBeNull();
    });

    it("peut avoir imageMediaId undefined pour ne pas modifier l'image", () => {
      const noImageChangeUpdate: UpdateModuleData = {
        title: 'Titre modifié',
        imageMediaId: undefined,
      };
      expect(noImageChangeUpdate.imageMediaId).toBeUndefined();
    });

    it('ne contient pas les propriétés non modifiables', () => {
      const updateData = mockUpdateData as any;

      expect(updateData.id).toBeUndefined();
      expect(updateData.createdAt).toBeUndefined();
      expect(updateData.lessons).toBeUndefined();
      expect(updateData.quizzes).toBeUndefined();
    });

    it('peut être appliqué à un Module existant', () => {
      const existingModule: Module = {
        id: 'module-123',
        title: 'Ancien Titre',
        description: 'Ancienne description',
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        imageMediaId: 'old-media',
        lessons: [],
        quizzes: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const updateData: UpdateModuleData = {
        title: 'Nouveau Titre',
        status: ModuleStatus.PUBLISHED,
      };

      const updatedModule: Module = {
        ...existingModule,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      expect(updatedModule.title).toBe('Nouveau Titre');
      expect(updatedModule.status).toBe(ModuleStatus.PUBLISHED);
      expect(updatedModule.id).toBe(existingModule.id);
      expect(updatedModule.createdAt).toBe(existingModule.createdAt);
      expect(updatedModule.updatedAt).not.toBe(existingModule.updatedAt);
    });

    it('peut être validé avant application', () => {
      const validateUpdateData = (data: UpdateModuleData): boolean => {
        if (data.title !== undefined && data.title.length < 3) return false;
        if (data.description !== undefined && data.description.length < 10) return false;
        if (data.estimatedDuration !== undefined && data.estimatedDuration < 5) return false;
        if (data.thematics !== undefined && data.thematics.length < 3) return false;
        return true;
      };

      expect(validateUpdateData(mockUpdateData)).toBe(true);

      const invalidUpdate: UpdateModuleData = {
        title: 'AB',
        description: 'Court',
      };

      expect(validateUpdateData(invalidUpdate)).toBe(false);
    });

    it('peut contenir une combinaison de champs', () => {
      const partialUpdate: UpdateModuleData = {
        title: 'Titre Partiel',
        estimatedDuration: 75,
        status: ModuleStatus.PUBLISHED,
      };

      expect(partialUpdate.title).toBe('Titre Partiel');
      expect(partialUpdate.estimatedDuration).toBe(75);
      expect(partialUpdate.status).toBe(ModuleStatus.PUBLISHED);
      expect(partialUpdate.description).toBeUndefined();
      expect(partialUpdate.thematics).toBeUndefined();
    });

    it('permet de changer tous les champs modifiables', () => {
      const fullUpdate: UpdateModuleData = {
        title: 'Titre Complet Modifié',
        description: 'Description complète modifiée',
        thematics: 'investissement avancé',
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 180,
        status: ModuleStatus.ARCHIVED,
        imageMediaId: 'new-media-789',
      };

      expect(Object.keys(fullUpdate).length).toBe(7);
      expect(fullUpdate.title).toBeDefined();
      expect(fullUpdate.description).toBeDefined();
      expect(fullUpdate.thematics).toBeDefined();
      expect(fullUpdate.difficultyLevel).toBeDefined();
      expect(fullUpdate.estimatedDuration).toBeDefined();
      expect(fullUpdate.status).toBeDefined();
      expect(fullUpdate.imageMediaId).toBeDefined();
    });

    it('peut être utilisé pour créer un historique de modifications', () => {
      interface ModuleUpdateHistory {
        updatedAt: string;
        changes: UpdateModuleData;
      }

      const history: ModuleUpdateHistory[] = [
        {
          updatedAt: '2024-01-01T00:00:00.000Z',
          changes: { title: 'Premier titre' },
        },
        {
          updatedAt: '2024-01-02T00:00:00.000Z',
          changes: { description: 'Première description' },
        },
        {
          updatedAt: '2024-01-03T00:00:00.000Z',
          changes: { status: ModuleStatus.PUBLISHED },
        },
      ];

      expect(history).toHaveLength(3);
      expect(history[0].changes.title).toBe('Premier titre');
      expect(history[1].changes.description).toBe('Première description');
      expect(history[2].changes.status).toBe(ModuleStatus.PUBLISHED);
    });

    it("peut être fusionné avec d'autres mises à jour", () => {
      const update1: UpdateModuleData = {
        title: 'Titre 1',
        description: 'Description 1',
      };

      const update2: UpdateModuleData = {
        description: 'Description 2 (écrase 1)',
        status: ModuleStatus.PUBLISHED,
      };

      const mergedUpdate: UpdateModuleData = {
        ...update1,
        ...update2,
      };

      expect(mergedUpdate.title).toBe('Titre 1');
      expect(mergedUpdate.description).toBe('Description 2 (écrase 1)');
      expect(mergedUpdate.status).toBe(ModuleStatus.PUBLISHED);
    });

    it('peut être utilisé pour vérifier quels champs ont changé', () => {
      const getChangedFields = (data: UpdateModuleData): string[] => {
        return Object.keys(data).filter(key => data[key as keyof UpdateModuleData] !== undefined);
      };

      const update: UpdateModuleData = {
        title: 'Nouveau',
        status: ModuleStatus.PUBLISHED,
      };

      const changedFields = getChangedFields(update);
      expect(changedFields).toContain('title');
      expect(changedFields).toContain('status');
      expect(changedFields).not.toContain('description');
      expect(changedFields).toHaveLength(2);
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
        imageMediaId: createData.imageMediaId ?? null,
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
        imageMediaId: 'media-456',
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

    it('UpdateModuleData est compatible avec les propriétés de Module', () => {
      const updateData: UpdateModuleData = {
        title: 'Titre mis à jour',
        description: 'Description mise à jour',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        thematics: 'épargne et investissement',
        status: ModuleStatus.PUBLISHED,
        imageMediaId: 'new-media',
      };

      const originalModule: Module = {
        id: 'module-123',
        title: 'Ancien titre',
        description: 'Ancienne description',
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        imageMediaId: 'old-media',
        lessons: [],
        quizzes: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const updatedModule: Module = {
        ...originalModule,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      expect(updatedModule.title).toBe(updateData.title);
      expect(updatedModule.description).toBe(updateData.description);
      expect(updatedModule.difficultyLevel).toBe(updateData.difficultyLevel);
      expect(updatedModule.estimatedDuration).toBe(updateData.estimatedDuration);
      expect(updatedModule.thematics).toBe(updateData.thematics);
      expect(updatedModule.status).toBe(updateData.status);
      expect(updatedModule.id).toBe(originalModule.id);
    });

    it('UpdateModuleData peut être un sous-ensemble de CreateModuleData', () => {
      const createData: CreateModuleData = {
        title: 'Nouveau Module',
        description: 'Description complète',
        thematics: 'finance',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
      };

      const updateData: UpdateModuleData = {
        title: createData.title,
        description: createData.description,
        thematics: createData.thematics,
      };

      expect(updateData.title).toBe(createData.title);
      expect(updateData.description).toBe(createData.description);
      expect(updateData.thematics).toBe(createData.thematics);
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

    it('peut créer des guards de type pour UpdateModuleData', () => {
      const isUpdateModuleData = (obj: any): obj is UpdateModuleData => {
        if (typeof obj !== 'object' || obj === null) return false;

        // Tous les champs sont optionnels
        if (obj.title !== undefined && typeof obj.title !== 'string') return false;
        if (obj.description !== undefined && typeof obj.description !== 'string') return false;
        if (obj.thematics !== undefined && typeof obj.thematics !== 'string') return false;
        if (
          obj.difficultyLevel !== undefined &&
          !Object.values(DifficultyLevel).includes(obj.difficultyLevel)
        )
          return false;
        if (obj.estimatedDuration !== undefined && typeof obj.estimatedDuration !== 'number')
          return false;
        if (obj.status !== undefined && !Object.values(ModuleStatus).includes(obj.status))
          return false;
        if (
          obj.imageMediaId !== undefined &&
          obj.imageMediaId !== null &&
          typeof obj.imageMediaId !== 'string'
        )
          return false;

        return true;
      };

      const validUpdateData: UpdateModuleData = {
        title: 'Titre mis à jour',
        status: ModuleStatus.PUBLISHED,
      };

      const validEmptyUpdate: UpdateModuleData = {};

      const invalidUpdateData = {
        title: 123,
        status: 'INVALID_STATUS',
      };

      expect(isUpdateModuleData(validUpdateData)).toBe(true);
      expect(isUpdateModuleData(validEmptyUpdate)).toBe(true);
      expect(isUpdateModuleData(invalidUpdateData)).toBe(false);
      expect(isUpdateModuleData(null)).toBe(false);
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
        quizzes: [], // ✅
        lessons: [], // ✅
        status: ModuleStatus.DRAFT,
        imageMediaId: 'media-123',
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
      quizzes: [], // ✅
      lessons: [], // ✅
      imageMediaId: 'media-456',
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

    it('peut créer un UpdateModuleData depuis un Module', () => {
      const moduleToUpdateData = (m: Module): UpdateModuleData => {
        return {
          title: m.title,
          description: m.description,
          thematics: m.thematics,
          difficultyLevel: m.difficultyLevel,
          estimatedDuration: m.estimatedDuration,
          status: m.status,
          imageMediaId: m.imageMediaId,
        };
      };

      const updateData = moduleToUpdateData(testModule);

      expect(updateData.title).toBe(testModule.title);
      expect(updateData.description).toBe(testModule.description);
      expect(updateData.thematics).toBe(testModule.thematics);
      expect(updateData.difficultyLevel).toBe(testModule.difficultyLevel);
      expect(updateData.estimatedDuration).toBe(testModule.estimatedDuration);
      expect(updateData.status).toBe(testModule.status);
      expect(updateData.imageMediaId).toBe(testModule.imageMediaId);
    });

    it('peut appliquer une mise à jour partielle à un Module', () => {
      const applyUpdate = (module: Module, update: UpdateModuleData): Module => {
        return {
          ...module,
          ...update,
          updatedAt: new Date().toISOString(),
        };
      };

      const update: UpdateModuleData = {
        title: 'Titre modifié',
        status: ModuleStatus.ARCHIVED,
      };

      const updatedModule = applyUpdate(testModule, update);

      expect(updatedModule.title).toBe('Titre modifié');
      expect(updatedModule.status).toBe(ModuleStatus.ARCHIVED);
      expect(updatedModule.description).toBe(testModule.description);
      expect(updatedModule.id).toBe(testModule.id);
      expect(updatedModule.createdAt).toBe(testModule.createdAt);
      expect(updatedModule.updatedAt).not.toBe(testModule.updatedAt);
    });

    it('peut comparer Module avant et après mise à jour', () => {
      const compareModules = (
        original: Module,
        updated: UpdateModuleData
      ): { changed: string[]; unchanged: string[] } => {
        const changed: string[] = [];
        const unchanged: string[] = [];

        const checkField = (field: keyof UpdateModuleData) => {
          if (updated[field] !== undefined && original[field] !== updated[field]) {
            changed.push(field);
          } else if (updated[field] === undefined || original[field] === updated[field]) {
            unchanged.push(field);
          }
        };

        checkField('title');
        checkField('description');
        checkField('thematics');
        checkField('difficultyLevel');
        checkField('estimatedDuration');
        checkField('status');
        checkField('imageMediaId');

        return { changed, unchanged };
      };

      const update: UpdateModuleData = {
        title: 'Nouveau titre',
        status: ModuleStatus.ARCHIVED,
      };

      const comparison = compareModules(testModule, update);

      expect(comparison.changed).toContain('title');
      expect(comparison.changed).toContain('status');
      expect(comparison.changed).toHaveLength(2);
    });
  });
});
