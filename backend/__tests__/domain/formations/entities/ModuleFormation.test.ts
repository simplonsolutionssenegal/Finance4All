import {
  Module,
  ModuleStatus,
  DifficultyLevel,
} from '@/domain/formations/entities/ModuleFormation';
// eslint-disable-next-line no-duplicate-imports
import type { ModuleProps } from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';
import { Thematic } from '@/domain/formations/value-objects/Thematic';

// Création d'une fonction utilitaire pour générer les propriétés de base d'un module
const baseProps: ModuleProps = {
  id: EntityId.generate(),
  title: 'Introduction à la finance',
  description: 'Un module pour comprendre les bases de la finance',
  imageUrl: 'https://example.com/image.jpg',
  thematics: [Thematic.FINANCIAL_EDUCATION],
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
      expect(module.imageUrl).toBe(baseProps.imageUrl);
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

    it('devrait lever une erreur si le titre dépasse 200 caractères', () => {
      expect(() => Module.create({ ...baseProps, title: 'a'.repeat(201) })).toThrow(
        'Le titre ne peut pas dépasser 200 caractères'
      );
    });

    it('devrait lever une erreur si la description est vide', () => {
      expect(() => Module.create({ ...baseProps, description: '' })).toThrow(
        'La description du module est obligatoire'
      );
    });

    it("devrait lever une erreur si aucune thématique n'est fournie", () => {
      expect(() => Module.create({ ...baseProps, thematics: [] })).toThrow(
        'Au moins une thématique est requise'
      );
    });

    it('devrait lever une erreur si la durée estimée est inférieure ou égale à 0', () => {
      expect(() => Module.create({ ...baseProps, estimatedDuration: 0 })).toThrow(
        'La durée estimée doit être supérieure à 0'
      );
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
      module.publish();
      expect(module.isPublished()).toBe(true);
      expect(module.isDraft()).toBe(false);
    });

    it("devrait lever une erreur lors de la publication d'un module déjà publié", () => {
      module.publish();
      expect(() => module.publish()).toThrow('Le module est déjà publié');
    });
  });

  // Tests des méthodes de mise à jour
  describe('méthodes de mise à jour', () => {
    let module: Module;

    beforeEach(() => {
      module = Module.create(baseProps);
    });

    it('devrait mettre à jour le titre', () => {
      const newTitle = 'Nouveau titre';
      module.updateTitle(newTitle);
      expect(module.title).toBe(newTitle);
    });

    it('devrait lever une erreur lors de la mise à jour avec un titre vide', () => {
      expect(() => module.updateTitle('')).toThrow('Le titre du module est obligatoire');
    });

    it("devrait mettre à jour l'URL de l'image", () => {
      const newImageUrl = 'https://example.com/new-image.jpg';
      module.updateImageUrl(newImageUrl);
      expect(module.imageUrl).toBe(newImageUrl);
    });

    it("devrait lever une erreur lors de la mise à jour avec une URL d'image vide", () => {
      expect(() => module.updateImageUrl('')).toThrow("L'URL de l'image est obligatoire");
    });

    it('devrait mettre à jour la description', () => {
      const newDescription = 'Nouvelle description';
      module.updateDescription(newDescription);
      expect(module.description).toBe(newDescription);
    });

    it('devrait lever une erreur lors de la mise à jour avec une description vide', () => {
      expect(() => module.updateDescription('')).toThrow(
        'La description du module est obligatoire'
      );
    });
  });

  // Tests de gestion des thématiques
  describe('gestion des thématiques', () => {
    let module: Module;

    beforeEach(() => {
      module = Module.create(baseProps);
    });

    it('devrait ajouter une nouvelle thématique', () => {
      const newThematic = Thematic.INVESTMENT;
      module.addThematic(newThematic);
      expect(module.hasThematic(newThematic)).toBe(true);
      expect(module.thematics).toContain(newThematic);
    });

    it('devrait supprimer une thématique existante', () => {
      const newThematic = Thematic.INVESTMENT;
      module.addThematic(newThematic);
      module.removeThematic(newThematic);
      expect(module.hasThematic(newThematic)).toBe(false);
    });

    it('devrait lever une erreur lors de la suppression de la dernière thématique', () => {
      expect(() => module.removeThematic(baseProps.thematics[0])).toThrow(
        'Le module doit avoir au moins une thématique'
      );
    });
  });

  // Tests de conversion en DTO
  describe('toDTO', () => {
    it('devrait convertir le module en DTO avec toutes les propriétés', () => {
      const module = Module.create(baseProps);
      const dto = module.toDTO();

      expect(dto).toEqual({
        id: module.id.getValue(),
        title: module.title,
        description: module.description,
        imageUrl: module.imageUrl,
        thematics: module.thematics,
        difficultyLevel: module.difficultyLevel,
        estimatedDuration: module.estimatedDuration,
        status: module.status,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      });
    });
  });
});
