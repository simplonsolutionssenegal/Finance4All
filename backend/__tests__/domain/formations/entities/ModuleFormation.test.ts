import {
  Module,
  ModuleStatus,
  DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';
// eslint-disable-next-line no-duplicate-imports
import type { ModuleProps } from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';

// Création d'une fonction utilitaire pour générer les propriétés de base d'un module
const baseProps: ModuleProps = {
  id: EntityId.generate(),
  title: 'Introduction à la finance',
  description: 'Un module pour comprendre les bases de la finance',
  imageMediaId: 'image-123',
  thematics: 'finance et comptabilité',
  difficultyLevel: DifficultyLevel.BEGINNER,
  estimatedDuration: 60,
  status: ModuleStatus.DRAFT,
};

describe('Module', () => {
  // Tests de création du module
  describe('create', () => {
    it('devrait créer un module valide avec les propriétés de base', () => {
      const module = Module.create(baseProps);
      expect(module).toBeDefined();
      expect(module.title).toBe(baseProps.title);
      expect(module.description).toBe(baseProps.description);
      expect(module.imageMediaId).toBe(baseProps.imageMediaId);
      expect(module.thematics).toEqual(baseProps.thematics);
      expect(module.difficultyLevel).toBe(baseProps.difficultyLevel);
      expect(module.estimatedDuration).toBe(baseProps.estimatedDuration);
      expect(module.status).toBe(baseProps.status);
    });

    it('devrait lever une erreur si le titre est vide', () => {
      expect(() => Module.create({ ...baseProps, title: '' })).toThrow(
        'Le titre du module est obligatoire'
      );
    });

    it('devrait lever une erreur si le titre contient uniquement des espaces', () => {
      expect(() => Module.create({ ...baseProps, title: '   ' })).toThrow(
        'Le titre du module est obligatoire'
      );
    });

    it('devrait lever une erreur si le titre dépasse 200 caractères', () => {
      expect(() => Module.create({ ...baseProps, title: 'a'.repeat(201) })).toThrow(
        'Le titre ne peut pas dépasser 200 caractères'
      );
    });

    it('devrait accepter un titre de 200 caractères exactement', () => {
      const module = Module.create({ ...baseProps, title: 'a'.repeat(200) });
      expect(module.title).toHaveLength(200);
    });

    it('devrait lever une erreur si la description est vide', () => {
      expect(() => Module.create({ ...baseProps, description: '' })).toThrow(
        'La description du module est obligatoire'
      );
    });

    it('devrait lever une erreur si la description contient uniquement des espaces', () => {
      expect(() => Module.create({ ...baseProps, description: '   ' })).toThrow(
        'La description du module est obligatoire'
      );
    });

    it('devrait lever une erreur si la thématique est vide', () => {
      expect(() => Module.create({ ...baseProps, thematics: '' })).toThrow(
        'Au moins une thématique est requise'
      );
    });

    it('devrait lever une erreur si la thématique contient uniquement des espaces', () => {
      expect(() => Module.create({ ...baseProps, thematics: '   ' })).toThrow(
        'Au moins une thématique est requise'
      );
    });

    it('devrait lever une erreur si la durée estimée est 0', () => {
      expect(() => Module.create({ ...baseProps, estimatedDuration: 0 })).toThrow(
        'La durée estimée doit être supérieure à 0'
      );
    });

    it('devrait lever une erreur si la durée estimée est négative', () => {
      expect(() => Module.create({ ...baseProps, estimatedDuration: -10 })).toThrow(
        'La durée estimée doit être supérieure à 0'
      );
    });

    it('devrait lever une erreur si la durée estimée dépasse 7 jours (10080 minutes)', () => {
      expect(() => Module.create({ ...baseProps, estimatedDuration: 10081 })).toThrow(
        'La durée maximale est de 7 jours'
      );
    });

    it('devrait accepter une durée estimée de 7 jours exactement (10080 minutes)', () => {
      const module = Module.create({ ...baseProps, estimatedDuration: 10080 });
      expect(module.estimatedDuration).toBe(10080);
    });

    it('devrait créer un module avec imageMediaId null', () => {
      const module = Module.create({ ...baseProps, imageMediaId: null });
      expect(module.imageMediaId).toBeNull();
    });

    it('devrait lever une erreur avec un niveau de difficulté invalide', () => {
      expect(() =>
        Module.create({ ...baseProps, difficultyLevel: 'INVALID' as DifficultyLevel })
      ).toThrow("Le niveau de difficulté n'est pas valide");
    });

    it('devrait lever une erreur avec un statut invalide', () => {
      expect(() => Module.create({ ...baseProps, status: 'INVALID' as ModuleStatus })).toThrow(
        "Le statut du module n'est pas valide"
      );
    });

    it('devrait créer un module avec tous les niveaux de difficulté valides', () => {
      Object.values(DifficultyLevel).forEach(level => {
        const module = Module.create({ ...baseProps, difficultyLevel: level });
        expect(module.difficultyLevel).toBe(level);
      });
    });

    it('devrait créer un module avec tous les statuts valides', () => {
      Object.values(ModuleStatus).forEach(status => {
        const module = Module.create({ ...baseProps, status });
        expect(module.status).toBe(status);
      });
    });
  });

  // Tests du constructeur direct
  describe('constructor', () => {
    it('devrait créer un module via le constructeur', () => {
      const module = new Module(baseProps);
      expect(module).toBeDefined();
      expect(module.title).toBe(baseProps.title);
      expect(module.description).toBe(baseProps.description);
    });

    it('devrait initialiser les dates createdAt et updatedAt', () => {
      const module = new Module(baseProps);
      expect(module.createdAt).toBeInstanceOf(Date);
      expect(module.updatedAt).toBeInstanceOf(Date);
    });
  });

  // Tests des méthodes de gestion d'état
  describe("méthodes d'état", () => {
    let module: Module;

    beforeEach(() => {
      module = Module.create(baseProps);
    });

    it('devrait correctement vérifier si le module est en brouillon', () => {
      expect(module.isDraft()).toBe(true);
      expect(module.isPublished()).toBe(false);
      expect(module.isArchived()).toBe(false);
    });

    it('devrait publier un module en brouillon', () => {
      const oldUpdatedAt = module.updatedAt;
      // Attendre un peu pour voir la différence de date
      module.publish();
      expect(module.isPublished()).toBe(true);
      expect(module.isDraft()).toBe(false);
      expect(module.status).toBe(ModuleStatus.PUBLISHED);
      expect(module.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it("devrait lever une erreur lors de la publication d'un module déjà publié", () => {
      module.publish();
      expect(() => module.publish()).toThrow('Le module est déjà publié');
    });

    it('devrait vérifier correctement un module publié', () => {
      const publishedModule = Module.create({ ...baseProps, status: ModuleStatus.PUBLISHED });
      expect(publishedModule.isPublished()).toBe(true);
      expect(publishedModule.isDraft()).toBe(false);
      expect(publishedModule.isArchived()).toBe(false);
    });

    it('devrait vérifier correctement un module archivé', () => {
      const archivedModule = Module.create({ ...baseProps, status: ModuleStatus.ARCHIVED });
      expect(archivedModule.isArchived()).toBe(true);
      expect(archivedModule.isDraft()).toBe(false);
      expect(archivedModule.isPublished()).toBe(false);
    });
  });

  // Tests des méthodes de mise à jour
  describe('méthodes de mise à jour', () => {
    let module: Module;

    beforeEach(() => {
      module = Module.create(baseProps);
    });

    it('devrait mettre à jour le titre', () => {
      const oldUpdatedAt = module.updatedAt;
      const newTitle = 'Nouveau titre';
      module.updateTitle(newTitle);
      expect(module.title).toBe(newTitle);
      expect(module.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('devrait lever une erreur lors de la mise à jour avec un titre vide', () => {
      expect(() => module.updateTitle('')).toThrow('Le titre du module est obligatoire');
    });

    it('devrait lever une erreur lors de la mise à jour avec un titre contenant uniquement des espaces', () => {
      expect(() => module.updateTitle('   ')).toThrow('Le titre du module est obligatoire');
    });

    it('devrait mettre à jour la description', () => {
      const oldUpdatedAt = module.updatedAt;
      const newDescription = 'Nouvelle description détaillée';
      module.updateDescription(newDescription);
      expect(module.description).toBe(newDescription);
      expect(module.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('devrait lever une erreur lors de la mise à jour avec une description vide', () => {
      expect(() => module.updateDescription('')).toThrow(
        'La description du module est obligatoire'
      );
    });

    it('devrait lever une erreur lors de la mise à jour avec une description contenant uniquement des espaces', () => {
      expect(() => module.updateDescription('   ')).toThrow(
        'La description du module est obligatoire'
      );
    });
  });

  // Tests des getters
  describe('getters', () => {
    let module: Module;

    beforeEach(() => {
      module = Module.create(baseProps);
    });

    it('devrait retourner le titre via le getter', () => {
      expect(module.title).toBe(baseProps.title);
    });

    it('devrait retourner la description via le getter', () => {
      expect(module.description).toBe(baseProps.description);
    });

    it('devrait retourner imageMediaId via le getter', () => {
      expect(module.imageMediaId).toBe(baseProps.imageMediaId);
    });

    it('devrait retourner la thématique via le getter', () => {
      expect(module.thematics).toBe(baseProps.thematics);
    });

    it('devrait retourner le niveau de difficulté via le getter', () => {
      expect(module.difficultyLevel).toBe(baseProps.difficultyLevel);
    });

    it('devrait retourner la durée estimée via le getter', () => {
      expect(module.estimatedDuration).toBe(baseProps.estimatedDuration);
    });

    it('devrait retourner le statut via le getter', () => {
      expect(module.status).toBe(baseProps.status);
    });

    it('devrait retourner createdAt via le getter', () => {
      expect(module.createdAt).toBeInstanceOf(Date);
    });

    it('devrait retourner updatedAt via le getter', () => {
      expect(module.updatedAt).toBeInstanceOf(Date);
    });
  });

  // Tests de conversion en DTO
  describe('toDTO', () => {
    it('devrait convertir le module en DTO avec toutes les propriétés', () => {
      const module = Module.create(baseProps);
      const dto = module.toDTO();

      expect(dto).toMatchObject({
        id: module.id.getValue(),
        title: module.title,
        description: module.description,
        imageMediaId: module.imageMediaId,
        thematics: module.thematics,
        difficultyLevel: module.difficultyLevel,
        estimatedDuration: module.estimatedDuration,
        status: module.status,
      });
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });

    it('devrait convertir un module avec imageMediaId null en DTO', () => {
      const module = Module.create({ ...baseProps, imageMediaId: null });
      const dto = module.toDTO();
      expect(dto.imageMediaId).toBeNull();
    });

    it('devrait inclure les dates dans le DTO', () => {
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-15T14:30:00Z');
      const module = new Module({ ...baseProps, createdAt, updatedAt });
      const dto = module.toDTO();

      expect(dto.createdAt).toEqual(createdAt);
      expect(dto.updatedAt).toEqual(updatedAt);
    });
  });

  // Tests d'intégration
  describe("scénarios d'intégration", () => {
    it('devrait gérer un cycle de vie complet du module', () => {
      // Création
      const module = Module.create(baseProps);
      expect(module.isDraft()).toBe(true);

      // Mise à jour
      module.updateTitle('Titre mis à jour');
      module.updateDescription('Description mise à jour');
      expect(module.title).toBe('Titre mis à jour');

      // Publication
      module.publish();
      expect(module.isPublished()).toBe(true);

      // Conversion en DTO
      const dto = module.toDTO();
      expect(dto.title).toBe('Titre mis à jour');
      expect(dto.status).toBe(ModuleStatus.PUBLISHED);
    });

    it("devrait préserver l'immutabilité de l'ID", () => {
      const module = Module.create(baseProps);
      const originalId = module.id.getValue();

      module.updateTitle('Nouveau titre');
      module.publish();

      expect(module.id.getValue()).toBe(originalId);
    });
  });
});
