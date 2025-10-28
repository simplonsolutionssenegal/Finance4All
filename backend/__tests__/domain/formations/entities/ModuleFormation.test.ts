// backend/__tests__/domain/formations/entities/ModuleFormation.test.ts

import {
  Module,
  ModuleStatus,
  DifficultyLevel,
  type ModuleProps,
} from '../../../../src/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';
import { Thematic } from '@/domain/formations/value-objects/Thematic';

describe('Module Entity', () => {
  let validModuleProps: ModuleProps;
  let mockEntityId: EntityId;

  beforeEach(() => {
    mockEntityId = EntityId.generate();
    validModuleProps = {
      id: mockEntityId,
      title: 'Introduction aux Finances',
      description: "Module d'introduction aux concepts financiers de base pour débutants",
      imageUrl: 'https://example.com/module-image.jpg',
      thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.BUDGET_MANAGEMENT],
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      status: ModuleStatus.DRAFT,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    };
  });

  describe('Constructor', () => {
    it('devrait créer un module avec des propriétés valides', () => {
      // Act
      const module = new Module(validModuleProps);

      // Assert
      expect(module.id).toBe(mockEntityId);
      expect(module.title).toBe(validModuleProps.title);
      expect(module.description).toBe(validModuleProps.description);
      expect(module.imageUrl).toBe(validModuleProps.imageUrl);
      expect(module.thematics).toEqual(validModuleProps.thematics);
      expect(module.difficultyLevel).toBe(validModuleProps.difficultyLevel);
      expect(module.estimatedDuration).toBe(validModuleProps.estimatedDuration);
      expect(module.status).toBe(validModuleProps.status);
    });

    it('devrait créer un module avec imageUrl null', () => {
      // Arrange
      const propsWithNullImage = {
        ...validModuleProps,
        imageUrl: null,
      };

      // Act
      const module = new Module(propsWithNullImage);

      // Assert
      expect(module.imageUrl).toBeNull();
    });

    it('devrait créer un module avec plusieurs thématiques', () => {
      // Arrange
      const propsWithMultipleThematics = {
        ...validModuleProps,
        thematics: [
          Thematic.FINANCIAL_EDUCATION,
          Thematic.INVESTMENT,
          Thematic.SAVING,
          Thematic.BUDGET_MANAGEMENT,
          Thematic.ENTREPRENEURSHIP,
        ],
      };

      // Act
      const module = new Module(propsWithMultipleThematics);

      // Assert
      expect(module.thematics).toHaveLength(5);
      expect(module.thematics).toEqual(propsWithMultipleThematics.thematics);
    });
  });

  describe('create static method', () => {
    it('devrait créer un module avec des propriétés valides', () => {
      // Act
      const module = Module.create(validModuleProps);

      // Assert
      expect(module).toBeInstanceOf(Module);
      expect(module.title).toBe(validModuleProps.title);
      expect(module.description).toBe(validModuleProps.description);
    });

    describe('Validation du titre', () => {
      it('devrait rejeter un titre vide', () => {
        // Arrange
        const propsWithEmptyTitle = {
          ...validModuleProps,
          title: '',
        };

        // Act & Assert
        expect(() => Module.create(propsWithEmptyTitle)).toThrow(
          'Le titre du module est obligatoire'
        );
      });

      it('devrait rejeter un titre contenant uniquement des espaces', () => {
        // Arrange
        const propsWithWhitespaceTitle = {
          ...validModuleProps,
          title: '   ',
        };

        // Act & Assert
        expect(() => Module.create(propsWithWhitespaceTitle)).toThrow(
          'Le titre du module est obligatoire'
        );
      });

      it('devrait rejeter un titre trop long (plus de 200 caractères)', () => {
        // Arrange
        const longTitle = 'A'.repeat(201);
        const propsWithLongTitle = {
          ...validModuleProps,
          title: longTitle,
        };

        // Act & Assert
        expect(() => Module.create(propsWithLongTitle)).toThrow(
          'Le titre ne peut pas dépasser 200 caractères'
        );
      });

      it('devrait accepter un titre de 200 caractères exactement', () => {
        // Arrange
        const exactLengthTitle = 'A'.repeat(200);
        const propsWithExactLengthTitle = {
          ...validModuleProps,
          title: exactLengthTitle,
        };

        // Act & Assert
        expect(() => Module.create(propsWithExactLengthTitle)).not.toThrow();
      });
    });

    describe("Validation de l'URL d'image", () => {
      it("devrait rejeter une URL d'image vide", () => {
        // Arrange
        const propsWithEmptyImageUrl = {
          ...validModuleProps,
          imageUrl: '',
        };

        // Act & Assert
        expect(() => Module.create(propsWithEmptyImageUrl)).toThrow(
          "L'URL de l'image est obligatoire"
        );
      });

      it("devrait rejeter une URL d'image contenant uniquement des espaces", () => {
        // Arrange
        const propsWithWhitespaceImageUrl = {
          ...validModuleProps,
          imageUrl: '   ',
        };

        // Act & Assert
        expect(() => Module.create(propsWithWhitespaceImageUrl)).toThrow(
          "L'URL de l'image est obligatoire"
        );
      });
    });

    describe('Validation de la description', () => {
      it('devrait rejeter une description vide', () => {
        // Arrange
        const propsWithEmptyDescription = {
          ...validModuleProps,
          description: '',
        };

        // Act & Assert
        expect(() => Module.create(propsWithEmptyDescription)).toThrow(
          'La description du module est obligatoire'
        );
      });

      it('devrait rejeter une description contenant uniquement des espaces', () => {
        // Arrange
        const propsWithWhitespaceDescription = {
          ...validModuleProps,
          description: '   ',
        };

        // Act & Assert
        expect(() => Module.create(propsWithWhitespaceDescription)).toThrow(
          'La description du module est obligatoire'
        );
      });
    });

    describe('Validation des thématiques', () => {
      it('devrait rejeter un tableau de thématiques vide', () => {
        // Arrange
        const propsWithEmptyThematics = {
          ...validModuleProps,
          thematics: [],
        };

        // Act & Assert
        expect(() => Module.create(propsWithEmptyThematics)).toThrow(
          'Au moins une thématique est requise'
        );
      });
    });

    describe('Validation de la durée estimée', () => {
      it('devrait rejeter une durée estimée de 0', () => {
        // Arrange
        const propsWithZeroDuration = {
          ...validModuleProps,
          estimatedDuration: 0,
        };

        // Act & Assert
        expect(() => Module.create(propsWithZeroDuration)).toThrow(
          'La durée estimée doit être supérieure à 0'
        );
      });

      it('devrait rejeter une durée estimée négative', () => {
        // Arrange
        const propsWithNegativeDuration = {
          ...validModuleProps,
          estimatedDuration: -30,
        };

        // Act & Assert
        expect(() => Module.create(propsWithNegativeDuration)).toThrow(
          'La durée estimée doit être supérieure à 0'
        );
      });
    });
  });

  describe('Getters', () => {
    let module: Module;

    beforeEach(() => {
      module = new Module(validModuleProps);
    });

    it('devrait retourner le bon ID', () => {
      expect(module.id).toBe(mockEntityId);
    });

    it('devrait retourner le bon titre', () => {
      expect(module.title).toBe(validModuleProps.title);
    });

    it('devrait retourner la bonne description', () => {
      expect(module.description).toBe(validModuleProps.description);
    });

    it("devrait retourner la bonne URL d'image", () => {
      expect(module.imageUrl).toBe(validModuleProps.imageUrl);
    });

    it('devrait retourner une copie des thématiques (immutabilité)', () => {
      const thematics = module.thematics;
      expect(thematics).toEqual(validModuleProps.thematics);
      expect(thematics).not.toBe(validModuleProps.thematics); // Doit être une copie

      // Modifier la copie ne doit pas affecter l'original
      thematics.push(Thematic.INVESTMENT);
      expect(module.thematics).toHaveLength(2); // Original inchangé
    });

    it('devrait retourner le bon niveau de difficulté', () => {
      expect(module.difficultyLevel).toBe(validModuleProps.difficultyLevel);
    });

    it('devrait retourner la bonne durée estimée', () => {
      expect(module.estimatedDuration).toBe(validModuleProps.estimatedDuration);
    });

    it('devrait retourner le bon statut', () => {
      expect(module.status).toBe(validModuleProps.status);
    });

    it('devrait retourner les bonnes dates', () => {
      // Les dates sont générées automatiquement par DomainEntity
      expect(module.createdAt).toBeInstanceOf(Date);
      expect(module.updatedAt).toBeInstanceOf(Date);
      expect(module.createdAt).toEqual(module.updatedAt); // Au moment de la création, elles sont égales
    });

    it("devrait retourner la date actuelle si createdAt n'est pas définie", () => {
      const propsWithoutCreatedAt = {
        ...validModuleProps,
        createdAt: undefined,
      };
      const moduleWithoutCreatedAt = new Module(propsWithoutCreatedAt);

      expect(moduleWithoutCreatedAt.createdAt).toBeInstanceOf(Date);
    });

    it("devrait retourner la date actuelle si updatedAt n'est pas définie", () => {
      const propsWithoutUpdatedAt = {
        ...validModuleProps,
        updatedAt: undefined,
      };
      const moduleWithoutUpdatedAt = new Module(propsWithoutUpdatedAt);

      expect(moduleWithoutUpdatedAt.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('publish method', () => {
    let module: Module;

    beforeEach(() => {
      module = new Module(validModuleProps);
    });

    it('devrait publier un module en brouillon', () => {
      // Arrange
      expect(module.status).toBe(ModuleStatus.DRAFT);

      // Act
      module.publish();

      // Assert
      expect(module.status).toBe(ModuleStatus.PUBLISHED);
    });

    it('devrait mettre à jour la date de modification lors de la publication', () => {
      // Arrange
      const originalUpdatedAt = module.updatedAt;

      // Attendre un peu pour s'assurer d'une différence de timestamp
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000); // Avancer de 1 seconde

      // Act
      module.publish();

      // Assert
      expect(module.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      expect(module.updatedAt).toBeInstanceOf(Date);

      jest.useRealTimers();
    });

    it("devrait rejeter la publication d'un module déjà publié", () => {
      // Arrange
      module.publish(); // Publier une première fois

      // Act & Assert
      expect(() => module.publish()).toThrow('Le module est déjà publié');
    });
  });

  describe('updateTitle method', () => {
    let module: Module;

    beforeEach(() => {
      module = new Module(validModuleProps);
    });

    it('devrait mettre à jour le titre avec une valeur valide', () => {
      // Arrange
      const newTitle = 'Nouveau titre du module';

      // Act
      module.updateTitle(newTitle);

      // Assert
      expect(module.title).toBe(newTitle);
    });

    it('devrait mettre à jour la date de modification', () => {
      // Arrange
      const originalUpdatedAt = module.updatedAt.getTime();
      const newTitle = 'Nouveau titre du module';

      // Attendre un tout petit peu pour garantir une différence de timestamp
      jest.useFakeTimers();
      jest.setSystemTime(new Date(originalUpdatedAt + 1000)); // +1 seconde

      // Act
      module.updateTitle(newTitle);

      // Assert
      expect(module.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);

      jest.useRealTimers();
    });

    it('devrait rejeter un titre vide', () => {
      // Act & Assert
      expect(() => module.updateTitle('')).toThrow('Le titre du module est obligatoire');
    });

    it('devrait rejeter un titre contenant uniquement des espaces', () => {
      // Act & Assert
      expect(() => module.updateTitle('   ')).toThrow('Le titre du module est obligatoire');
    });
  });

  describe('updateImageUrl method', () => {
    let module: Module;

    beforeEach(() => {
      module = new Module(validModuleProps);
    });

    it("devrait mettre à jour l'URL d'image avec une valeur valide", () => {
      // Arrange
      const newImageUrl = 'https://example.com/new-image.jpg';

      // Act
      module.updateImageUrl(newImageUrl);

      // Assert
      expect(module.imageUrl).toBe(newImageUrl);
    });

    it('devrait mettre à jour la date de modification', () => {
      // Arrange
      const originalUpdatedAt = module.updatedAt.getTime();
      const newImageUrl = 'https://example.com/new-image.jpg';

      // Attendre un tout petit peu pour garantir une différence de timestamp
      jest.useFakeTimers();
      jest.setSystemTime(new Date(originalUpdatedAt + 1000)); // +1 seconde

      // Act
      module.updateImageUrl(newImageUrl);

      // Assert
      expect(module.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);

      jest.useRealTimers();
    });

    it("devrait rejeter une URL d'image vide", () => {
      // Act & Assert
      expect(() => module.updateImageUrl('')).toThrow("L'URL de l'image est obligatoire");
    });

    it("devrait rejeter une URL d'image contenant uniquement des espaces", () => {
      // Act & Assert
      expect(() => module.updateImageUrl('   ')).toThrow("L'URL de l'image est obligatoire");
    });
  });

  describe('updateDescription method', () => {
    let module: Module;

    beforeEach(() => {
      module = new Module(validModuleProps);
    });

    it('devrait mettre à jour la description avec une valeur valide', () => {
      // Arrange
      const newDescription = 'Nouvelle description du module avec plus de détails';

      // Act
      module.updateDescription(newDescription);

      // Assert
      expect(module.description).toBe(newDescription);
    });

    it('devrait mettre à jour la date de modification', () => {
      // Arrange
      const originalUpdatedAt = module.updatedAt.getTime();
      const newDescription = 'Nouvelle description du module';

      // Attendre un tout petit peu pour garantir une différence de timestamp
      jest.useFakeTimers();
      jest.setSystemTime(new Date(originalUpdatedAt + 1000)); // +1 seconde

      // Act
      module.updateDescription(newDescription);

      // Assert
      expect(module.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);

      jest.useRealTimers();
    });

    it('devrait rejeter une description vide', () => {
      // Act & Assert
      expect(() => module.updateDescription('')).toThrow(
        'La description du module est obligatoire'
      );
    });

    it('devrait rejeter une description contenant uniquement des espaces', () => {
      // Act & Assert
      expect(() => module.updateDescription('   ')).toThrow(
        'La description du module est obligatoire'
      );
    });
  });

  describe('Thematic management methods', () => {
    let module: Module;

    beforeEach(() => {
      module = new Module(validModuleProps);
    });

    describe('addThematic method', () => {
      it('devrait ajouter une nouvelle thématique', () => {
        // Arrange
        const newThematic = Thematic.INVESTMENT;
        expect(module.hasThematic(newThematic)).toBe(false);

        // Act
        module.addThematic(newThematic);

        // Assert
        expect(module.hasThematic(newThematic)).toBe(true);
        expect(module.thematics).toContain(newThematic);
      });

      it('ne devrait pas ajouter une thématique déjà présente', () => {
        // Arrange
        const existingThematic = Thematic.FINANCIAL_EDUCATION;
        const originalLength = module.thematics.length;
        expect(module.hasThematic(existingThematic)).toBe(true);

        // Act
        module.addThematic(existingThematic);

        // Assert
        expect(module.thematics.length).toBe(originalLength);
      });

      it("devrait mettre à jour la date de modification lors de l'ajout", () => {
        // Arrange
        const originalUpdatedAt = module.updatedAt.getTime();
        const newThematic = Thematic.INVESTMENT;

        // Attendre un tout petit peu pour garantir une différence de timestamp
        jest.useFakeTimers();
        jest.setSystemTime(new Date(originalUpdatedAt + 1000)); // +1 seconde

        // Act
        module.addThematic(newThematic);

        // Assert
        expect(module.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);

        jest.useRealTimers();
      });
    });

    describe('removeThematic method', () => {
      it('devrait supprimer une thématique existante', () => {
        // Arrange
        const thematicToRemove = Thematic.BUDGET_MANAGEMENT;
        expect(module.hasThematic(thematicToRemove)).toBe(true);

        // Act
        module.removeThematic(thematicToRemove);

        // Assert
        expect(module.hasThematic(thematicToRemove)).toBe(false);
        expect(module.thematics).not.toContain(thematicToRemove);
      });

      it("ne devrait rien faire si la thématique n'existe pas", () => {
        // Arrange
        const nonExistentThematic = Thematic.INVESTMENT;
        const originalLength = module.thematics.length;
        expect(module.hasThematic(nonExistentThematic)).toBe(false);

        // Act
        module.removeThematic(nonExistentThematic);

        // Assert
        expect(module.thematics.length).toBe(originalLength);
      });

      it('devrait rejeter la suppression de la dernière thématique', () => {
        // Arrange
        const moduleWithOneThematic = new Module({
          ...validModuleProps,
          thematics: [Thematic.FINANCIAL_EDUCATION],
        });

        // Act & Assert
        expect(() => moduleWithOneThematic.removeThematic(Thematic.FINANCIAL_EDUCATION)).toThrow(
          'Le module doit avoir au moins une thématique'
        );
      });

      it('devrait mettre à jour la date de modification lors de la suppression', () => {
        // Arrange
        const originalUpdatedAt = module.updatedAt.getTime();
        const thematicToRemove = Thematic.BUDGET_MANAGEMENT;

        // Attendre un tout petit peu pour garantir une différence de timestamp
        jest.useFakeTimers();
        jest.setSystemTime(new Date(originalUpdatedAt + 1000)); // +1 seconde

        // Act
        module.removeThematic(thematicToRemove);

        // Assert
        expect(module.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);

        jest.useRealTimers();
      });
    });

    describe('hasThematic method', () => {
      it('devrait retourner true pour une thématique présente', () => {
        // Act & Assert
        expect(module.hasThematic(Thematic.FINANCIAL_EDUCATION)).toBe(true);
        expect(module.hasThematic(Thematic.BUDGET_MANAGEMENT)).toBe(true);
      });

      it('devrait retourner false pour une thématique absente', () => {
        // Act & Assert
        expect(module.hasThematic(Thematic.INVESTMENT)).toBe(false);
        expect(module.hasThematic(Thematic.ENTREPRENEURSHIP)).toBe(false);
      });
    });
  });

  describe('Status check methods', () => {
    it('devrait identifier correctement un module publié', () => {
      // Arrange
      const publishedModule = new Module({
        ...validModuleProps,
        status: ModuleStatus.PUBLISHED,
      });

      // Act & Assert
      expect(publishedModule.isPublished()).toBe(true);
      expect(publishedModule.isDraft()).toBe(false);
      expect(publishedModule.isArchived()).toBe(false);
    });

    it('devrait identifier correctement un module en brouillon', () => {
      // Arrange
      const draftModule = new Module({
        ...validModuleProps,
        status: ModuleStatus.DRAFT,
      });

      // Act & Assert
      expect(draftModule.isDraft()).toBe(true);
      expect(draftModule.isPublished()).toBe(false);
      expect(draftModule.isArchived()).toBe(false);
    });

    it('devrait identifier correctement un module archivé', () => {
      // Arrange
      const archivedModule = new Module({
        ...validModuleProps,
        status: ModuleStatus.ARCHIVED,
      });

      // Act & Assert
      expect(archivedModule.isArchived()).toBe(true);
      expect(archivedModule.isPublished()).toBe(false);
      expect(archivedModule.isDraft()).toBe(false);
    });
  });

  describe('toDTO method', () => {
    let module: Module;

    beforeEach(() => {
      module = new Module(validModuleProps);
    });

    it('devrait convertir le module en DTO correctement', () => {
      // Act
      const dto = module.toDTO();

      // Assert
      expect(dto).toEqual({
        id: mockEntityId.getValue(),
        title: validModuleProps.title,
        description: validModuleProps.description,
        thematics: validModuleProps.thematics,
        imageUrl: validModuleProps.imageUrl,
        difficultyLevel: validModuleProps.difficultyLevel,
        estimatedDuration: validModuleProps.estimatedDuration,
        status: validModuleProps.status,
        createdAt: module.createdAt, // Utiliser les dates du module créé
        updatedAt: module.updatedAt, // Utiliser les dates du module créé
      });
    });

    it('devrait retourner un objet plain (pas une instance de Module)', () => {
      // Act
      const dto = module.toDTO();

      // Assert
      expect(dto).not.toBeInstanceOf(Module);
      expect(typeof dto).toBe('object');
    });

    it("devrait convertir l'ID en string via getValue()", () => {
      // Act
      const dto = module.toDTO();

      // Assert
      expect(typeof dto.id).toBe('string');
      expect(dto.id).toBe(mockEntityId.getValue());
    });
  });

  describe('Enums', () => {
    describe('ModuleStatus', () => {
      it('devrait avoir toutes les valeurs attendues', () => {
        expect(ModuleStatus.DRAFT).toBe('DRAFT');
        expect(ModuleStatus.PUBLISHED).toBe('PUBLISHED');
        expect(ModuleStatus.ARCHIVED).toBe('ARCHIVED');
      });
    });

    describe('DifficultyLevel', () => {
      it('devrait avoir toutes les valeurs attendues', () => {
        expect(DifficultyLevel.BEGINNER).toBe('BEGINNER');
        expect(DifficultyLevel.INTERMEDIATE).toBe('INTERMEDIATE');
        expect(DifficultyLevel.ADVANCED).toBe('ADVANCED');
        expect(DifficultyLevel.EXPERT).toBe('EXPERT');
      });
    });
  });

  describe('Integration tests', () => {
    it('devrait permettre un workflow complet de création et modification', () => {
      // Arrange & Act - Créer un module
      const module = Module.create(validModuleProps);

      // Assert - Vérifier la création
      expect(module.isDraft()).toBe(true);

      // Act - Modifier le titre
      module.updateTitle('Titre Modifié');
      expect(module.title).toBe('Titre Modifié');

      // Act - Ajouter une thématique
      module.addThematic(Thematic.INVESTMENT);
      expect(module.hasThematic(Thematic.INVESTMENT)).toBe(true);

      // Act - Publier le module
      module.publish();
      expect(module.isPublished()).toBe(true);

      // Act - Convertir en DTO
      const dto = module.toDTO();
      expect(dto.title).toBe('Titre Modifié');
      expect(dto.status).toBe(ModuleStatus.PUBLISHED);
      expect(dto.thematics).toContain(Thematic.INVESTMENT);
    });

    it("devrait maintenir l'immutabilité des thématiques", () => {
      // Arrange
      const module = new Module(validModuleProps);
      const originalThematics = module.thematics;

      // Act - Modifier la copie retournée
      originalThematics.push(Thematic.INVESTMENT);

      // Assert - L'original ne doit pas être modifié
      expect(module.thematics).toHaveLength(2);
      expect(module.hasThematic(Thematic.INVESTMENT)).toBe(false);
    });
  });
});
