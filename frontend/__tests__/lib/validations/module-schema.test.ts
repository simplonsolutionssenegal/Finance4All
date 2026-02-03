// frontend/__tests__/lib/validations/module-schema.test.ts

import type { z } from 'zod';

import { createModuleSchema } from '@/lib/validations/module-schema';
import { DifficultyLevel } from '@/types/modules/module';

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
