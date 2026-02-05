// frontend/__tests__/lib/validations/module-schema.test.ts

import type { z } from 'zod';

import { createModuleSchema, updateModuleSchema } from '@/lib/validations/module-schema';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

describe('createModuleSchema', () => {
  describe('title validation', () => {
    it('should validate a valid title', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject title with less than 3 characters', () => {
      const data = {
        title: 'Ab',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le titre doit contenir au moins 3 caractères');
      }
    });

    it('should reject title with more than 200 characters', () => {
      const data = {
        title: 'A'.repeat(201),
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le titre ne peut pas dépasser 200 caractères');
      }
    });

    it('should accept title with exactly 3 characters', () => {
      const data = {
        title: 'ABC',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept title with exactly 200 characters', () => {
      const data = {
        title: 'A'.repeat(200),
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('description validation', () => {
    it('should validate a valid description', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module de test',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject description with less than 10 characters', () => {
      const data = {
        title: 'Module de test',
        description: 'Court',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'La description doit contenir au moins 10 caractères'
        );
      }
    });

    it('should reject description with more than 5000 characters', () => {
      const data = {
        title: 'Module de test',
        description: 'A'.repeat(5001),
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'La description ne peut pas dépasser 5000 caractères'
        );
      }
    });

    it('should accept description with exactly 10 characters', () => {
      const data = {
        title: 'Module de test',
        description: 'A'.repeat(10),
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept description with exactly 5000 characters', () => {
      const data = {
        title: 'Module de test',
        description: 'A'.repeat(5000),
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('imageUrl validation', () => {
    it('should validate a valid image URL', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty string for imageUrl', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: '',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept undefined imageUrl', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL format', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'not-a-valid-url',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("L'URL de l'image doit être valide");
      }
    });

    it('should validate http and https URLs', () => {
      const dataHttps = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const dataHttp = {
        ...dataHttps,
        imageUrl: 'http://example.com/image.jpg',
      };

      expect(createModuleSchema.safeParse(dataHttps).success).toBe(true);
      expect(createModuleSchema.safeParse(dataHttp).success).toBe(true);
    });
  });

  describe('difficultyLevel validation', () => {
    it('should validate BEGINNER difficulty level', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate INTERMEDIATE difficulty level', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate ADVANCED difficulty level', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate EXPERT difficulty level', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.EXPERT,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid difficulty level', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: 'INVALID_LEVEL',
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('estimatedDuration validation', () => {
    it('should validate duration of 60 minutes', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject duration less than 5 minutes', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 4,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La durée minimale est de 5 minutes');
      }
    });

    it('should reject duration more than 10080 minutes (7 days)', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 10081,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La durée maximale est de 7 jours');
      }
    });

    it('should accept duration of exactly 5 minutes', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 5,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept duration of exactly 10080 minutes', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 10080,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject non-numeric duration', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: '60' as any,
        thematics: 'Finance',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('thematics validation', () => {
    it('should validate valid thematics', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Finance et Comptabilité',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject thematics with less than 3 characters', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'AB',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Doit contenir au moins 3 caractères');
      }
    });

    it('should reject thematics with more than 100 characters', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'A'.repeat(101),
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Ne peut pas dépasser 100 caractères');
      }
    });

    it('should accept thematics with exactly 3 characters', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'ABC',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept thematics with exactly 100 characters', () => {
      const data = {
        title: 'Module de test',
        description: 'Description valide pour ce module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'A'.repeat(100),
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('complete schema validation', () => {
    it('should validate a complete valid module', () => {
      const data = {
        title: 'Introduction à la Finance',
        description: 'Ce module couvre les bases de la finance personnelle et professionnelle',
        imageUrl: 'https://example.com/finance.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 120,
        thematics: 'Finance Personnelle',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should reject when multiple fields are invalid', () => {
      const data = {
        title: 'AB',
        description: 'Court',
        imageUrl: 'invalid-url',
        difficultyLevel: 'INVALID',
        estimatedDuration: 2,
        thematics: 'AB',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });

    it('should reject when required fields are missing', () => {
      const data = {
        title: 'Module de test',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate module without optional imageUrl', () => {
      const data = {
        title: 'Introduction à la Finance',
        description: 'Ce module couvre les bases de la finance personnelle et professionnelle',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        thematics: 'Finance Personnelle',
      };

      const result = createModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('type inference', () => {
    it('should infer correct TypeScript type from schema', () => {
      const data = {
        title: 'Test Module',
        description: 'Description for test module',
        imageUrl: 'https://example.com/image.jpg',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: 'Testing',
      };

      const result = createModuleSchema.safeParse(data);
      if (result.success) {
        // Type check - should compile without errors
        const typed: z.infer<typeof createModuleSchema> = result.data;
        expect(typed.title).toBe(data.title);
        expect(typed.description).toBe(data.description);
        expect(typed.difficultyLevel).toBe(data.difficultyLevel);
        expect(typed.estimatedDuration).toBe(data.estimatedDuration);
        expect(typed.thematics).toBe(data.thematics);
      }
    });
  });
});

describe('updateModuleSchema', () => {
  describe('title validation (optional)', () => {
    it('devrait valider un titre valide', () => {
      const data = {
        title: 'Module mis à jour',
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait accepter un objet vide (tous les champs optionnels)', () => {
      const data = {};

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un titre avec moins de 3 caractères', () => {
      const data = {
        title: 'Ab',
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('title');
      }
    });

    it('devrait rejeter un titre avec plus de 200 caractères', () => {
      const data = {
        title: 'A'.repeat(201),
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('title');
      }
    });

    it('devrait accepter un titre avec exactement 3 caractères', () => {
      const data = {
        title: 'ABC',
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait accepter un titre avec exactement 200 caractères', () => {
      const data = {
        title: 'A'.repeat(200),
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('description validation (optional)', () => {
    it('devrait valider une description valide', () => {
      const data = {
        description: 'Description mise à jour pour ce module',
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter une description avec moins de 10 caractères', () => {
      const data = {
        description: 'Court',
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('description');
      }
    });

    it('devrait rejeter une description avec plus de 5000 caractères', () => {
      const data = {
        description: 'A'.repeat(5001),
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('description');
      }
    });

    it('devrait accepter une description avec exactement 10 caractères', () => {
      const data = {
        description: 'A'.repeat(10),
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait accepter une description avec exactement 5000 caractères', () => {
      const data = {
        description: 'A'.repeat(5000),
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('thematics validation (optional)', () => {
    it('devrait valider une thématique valide', () => {
      const data = {
        thematics: 'Finance et Comptabilité',
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter une thématique avec moins de 3 caractères', () => {
      const data = {
        thematics: 'AB',
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('thematics');
      }
    });

    it('devrait rejeter une thématique avec plus de 100 caractères', () => {
      const data = {
        thematics: 'A'.repeat(101),
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('thematics');
      }
    });

    it('devrait accepter une thématique avec exactement 3 caractères', () => {
      const data = {
        thematics: 'ABC',
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait accepter une thématique avec exactement 100 caractères', () => {
      const data = {
        thematics: 'A'.repeat(100),
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('difficultyLevel validation (optional)', () => {
    it('devrait valider BEGINNER', () => {
      const data = {
        difficultyLevel: DifficultyLevel.BEGINNER,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait valider INTERMEDIATE', () => {
      const data = {
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait valider ADVANCED', () => {
      const data = {
        difficultyLevel: DifficultyLevel.ADVANCED,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait valider EXPERT', () => {
      const data = {
        difficultyLevel: DifficultyLevel.EXPERT,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un niveau de difficulté invalide', () => {
      const data = {
        difficultyLevel: 'INVALID_LEVEL',
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('estimatedDuration validation (optional)', () => {
    it('devrait valider une durée de 60 minutes', () => {
      const data = {
        estimatedDuration: 60,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter une durée inférieure à 5 minutes', () => {
      const data = {
        estimatedDuration: 4,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('estimatedDuration');
      }
    });

    it('devrait rejeter une durée supérieure à 10080 minutes', () => {
      const data = {
        estimatedDuration: 10081,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('estimatedDuration');
      }
    });

    it('devrait accepter une durée de exactement 5 minutes', () => {
      const data = {
        estimatedDuration: 5,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait accepter une durée de exactement 10080 minutes', () => {
      const data = {
        estimatedDuration: 10080,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter une durée non numérique', () => {
      const data = {
        estimatedDuration: '60' as any,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('status validation (optional)', () => {
    it('devrait valider DRAFT', () => {
      const data = {
        status: ModuleStatus.DRAFT,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait valider PUBLISHED', () => {
      const data = {
        status: ModuleStatus.PUBLISHED,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait valider ARCHIVED', () => {
      const data = {
        status: ModuleStatus.ARCHIVED,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un statut invalide', () => {
      const data = {
        status: 'INVALID_STATUS',
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('validation combinée', () => {
    it('devrait valider la mise à jour de plusieurs champs', () => {
      const data = {
        title: 'Titre mis à jour',
        description: 'Description mise à jour avec suffisamment de texte',
        thematics: 'Épargne',
        difficultyLevel: DifficultyLevel.ADVANCED,
        estimatedDuration: 90,
        status: ModuleStatus.PUBLISHED,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it("devrait valider la mise à jour d'un seul champ", () => {
      const data = {
        title: 'Nouveau titre uniquement',
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter si plusieurs champs sont invalides', () => {
      const data = {
        title: 'AB',
        description: 'Court',
        thematics: 'AB',
        estimatedDuration: 2,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });

    it('devrait accepter uniquement la modification du statut', () => {
      const data = {
        status: ModuleStatus.ARCHIVED,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait accepter uniquement la modification de la difficulté', () => {
      const data = {
        difficultyLevel: DifficultyLevel.EXPERT,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('devrait valider la mise à jour partielle avec des champs valides', () => {
      const data = {
        title: 'Titre valide mis à jour',
        estimatedDuration: 120,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('inférence de type', () => {
    it('devrait inférer le bon type TypeScript depuis le schéma', () => {
      const data = {
        title: 'Test Module Update',
        description: 'Description for test module update',
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 75,
        thematics: 'Testing Update',
        status: ModuleStatus.DRAFT,
      };

      const result = updateModuleSchema.safeParse(data);
      if (result.success) {
        // Type check - devrait compiler sans erreurs
        const typed: z.infer<typeof updateModuleSchema> = result.data;
        expect(typed.title).toBe(data.title);
        expect(typed.description).toBe(data.description);
        expect(typed.difficultyLevel).toBe(data.difficultyLevel);
        expect(typed.estimatedDuration).toBe(data.estimatedDuration);
        expect(typed.thematics).toBe(data.thematics);
        expect(typed.status).toBe(data.status);
      }
    });

    it('devrait accepter des champs optionnels undefined', () => {
      const data = {
        title: 'Only title',
        description: undefined,
        thematics: undefined,
      };

      const result = updateModuleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
