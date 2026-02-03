/**
 * @jest-environment node
 */

import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';

describe('ModuleFormation DTOs', () => {
  describe('ModuleResponseDTO', () => {
    it("devrait permettre la création d'un ModuleResponseDTO valide avec toutes les propriétés", () => {
      const response: ModuleResponseDTO = {
        id: 'module-123',
        title: 'Introduction à la finance',
        description: 'Un module complet pour comprendre les bases de la finance',
        imageMediaId: 'image-456',
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 120,
        status: ModuleStatus.DRAFT,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-15T14:30:00Z'),
      };

      // Assertions de type
      expect(typeof response.id).toBe('string');
      expect(typeof response.title).toBe('string');
      expect(typeof response.description).toBe('string');
      expect(typeof response.imageMediaId).toBe('string');
      expect(typeof response.thematics).toBe('string');
      expect(typeof response.difficultyLevel).toBe('string');
      expect(typeof response.estimatedDuration).toBe('number');
      expect(typeof response.status).toBe('string');
      expect(response.createdAt).toBeInstanceOf(Date);
      expect(response.updatedAt).toBeInstanceOf(Date);

      // Vérification des valeurs
      expect(response.id).toBe('module-123');
      expect(response.title).toBe('Introduction à la finance');
      expect(response.thematics).toBe('finance et comptabilité');
      expect(response.estimatedDuration).toBe(120);
    });

    it('devrait accepter imageMediaId comme null', () => {
      const response: ModuleResponseDTO = {
        id: 'module-456',
        title: 'Module sans image',
        description: 'Description du module',
        imageMediaId: null,
        thematics: 'gestion budgétaire',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(response.imageMediaId).toBeNull();
    });

    it('devrait accepter imageMediaId comme string', () => {
      const response: ModuleResponseDTO = {
        id: 'module-789',
        title: 'Module avec image',
        description: 'Description du module',
        imageMediaId: 'media-xyz-123',
        thematics: 'investissement',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 45,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof response.imageMediaId).toBe('string');
      expect(response.imageMediaId).toBe('media-xyz-123');
    });

    it('devrait inclure tous les champs requis pour ModuleResponseDTO', () => {
      const response: ModuleResponseDTO = {
        id: 'module-001',
        title: 'Introduction aux finances personnelles',
        description: 'Un module complet pour gérer ses finances',
        imageMediaId: 'image-001',
        thematics: 'éducation financière',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date('2024-01-01T08:00:00Z'),
        updatedAt: new Date('2024-01-02T10:00:00Z'),
      };

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('title');
      expect(response).toHaveProperty('description');
      expect(response).toHaveProperty('imageMediaId');
      expect(response).toHaveProperty('thematics');
      expect(response).toHaveProperty('difficultyLevel');
      expect(response).toHaveProperty('estimatedDuration');
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('createdAt');
      expect(response).toHaveProperty('updatedAt');
    });

    it('devrait accepter tous les niveaux de difficulté valides', () => {
      const baseDTOProps = {
        id: 'module-test',
        title: 'Test Module',
        description: 'Test description',
        imageMediaId: null,
        thematics: 'test',
        estimatedDuration: 60,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const beginnerDTO: ModuleResponseDTO = {
        ...baseDTOProps,
        difficultyLevel: DifficultyLevel.BEGINNER,
      };
      expect(beginnerDTO.difficultyLevel).toBe(DifficultyLevel.BEGINNER);

      const intermediateDTO: ModuleResponseDTO = {
        ...baseDTOProps,
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
      };
      expect(intermediateDTO.difficultyLevel).toBe(DifficultyLevel.INTERMEDIATE);

      const advancedDTO: ModuleResponseDTO = {
        ...baseDTOProps,
        difficultyLevel: DifficultyLevel.ADVANCED,
      };
      expect(advancedDTO.difficultyLevel).toBe(DifficultyLevel.ADVANCED);
    });

    it('devrait accepter tous les statuts de module valides', () => {
      const baseDTOProps = {
        id: 'module-test',
        title: 'Test Module',
        description: 'Test description',
        imageMediaId: null,
        thematics: 'test',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const draftDTO: ModuleResponseDTO = {
        ...baseDTOProps,
        status: ModuleStatus.DRAFT,
      };
      expect(draftDTO.status).toBe(ModuleStatus.DRAFT);

      const publishedDTO: ModuleResponseDTO = {
        ...baseDTOProps,
        status: ModuleStatus.PUBLISHED,
      };
      expect(publishedDTO.status).toBe(ModuleStatus.PUBLISHED);

      const archivedDTO: ModuleResponseDTO = {
        ...baseDTOProps,
        status: ModuleStatus.ARCHIVED,
      };
      expect(archivedDTO.status).toBe(ModuleStatus.ARCHIVED);
    });

    it('devrait gérer correctement les dates pour createdAt et updatedAt', () => {
      const createdDate = new Date('2024-01-01T10:00:00Z');
      const updatedDate = new Date('2024-01-15T14:30:00Z');

      const response: ModuleResponseDTO = {
        id: 'module-dates-test',
        title: 'Test des dates',
        description: 'Module pour tester les dates',
        imageMediaId: null,
        thematics: 'test dates',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30,
        status: ModuleStatus.DRAFT,
        createdAt: createdDate,
        updatedAt: updatedDate,
      };

      expect(response.createdAt).toEqual(createdDate);
      expect(response.updatedAt).toEqual(updatedDate);
      expect(response.createdAt).toBeInstanceOf(Date);
      expect(response.updatedAt).toBeInstanceOf(Date);
      expect(response.updatedAt.getTime()).toBeGreaterThanOrEqual(response.createdAt.getTime());
    });

    it('devrait accepter une thématique comme chaîne de caractères', () => {
      const response: ModuleResponseDTO = {
        id: 'module-thematics',
        title: 'Module thématique',
        description: 'Test de la thématique',
        imageMediaId: null,
        thematics: 'finance et comptabilité',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof response.thematics).toBe('string');
      expect(response.thematics).toBe('finance et comptabilité');
    });

    it('devrait représenter correctement un module complet en tant que DTO', () => {
      const completeDTO: ModuleResponseDTO = {
        id: 'complete-module-001',
        title: 'Gestion financière avancée',
        description:
          'Module complet couvrant tous les aspects de la gestion financière pour les professionnels',
        imageMediaId: 'premium-image-789',
        thematics: 'finance avancée et gestion de patrimoine',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 180,
        status: ModuleStatus.PUBLISHED,
        createdAt: new Date('2024-01-01T09:00:00Z'),
        updatedAt: new Date('2024-01-20T15:45:00Z'),
      };

      // Vérification de la structure complète
      expect(completeDTO.id).toBe('complete-module-001');
      expect(completeDTO.title).toBe('Gestion financière avancée');
      expect(completeDTO.description).toContain('tous les aspects');
      expect(completeDTO.imageMediaId).toBe('premium-image-789');
      expect(completeDTO.thematics).toBe('finance avancée et gestion de patrimoine');
      expect(completeDTO.difficultyLevel).toBe(DifficultyLevel.ADVANCED);
      expect(completeDTO.estimatedDuration).toBe(180);
      expect(completeDTO.status).toBe(ModuleStatus.PUBLISHED);
      expect(completeDTO.createdAt).toBeInstanceOf(Date);
      expect(completeDTO.updatedAt).toBeInstanceOf(Date);
    });
  });
});