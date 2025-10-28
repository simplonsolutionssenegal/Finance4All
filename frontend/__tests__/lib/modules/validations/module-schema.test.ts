// __tests__/lib/modules/validations/module-schema.test.ts
import { createModuleSchema } from '@/lib/validations/module-schema';
import { DifficultyLevel, Thematic } from '@/types/modules/module';

describe('Module Schema Validation', () => {
  const validModuleData = {
    title: 'Module de test financier',
    description: 'Description complète du module de test avec suffisamment de caractères',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    thematics: [Thematic.FINANCIAL_EDUCATION],
  };

  describe('Validation réussie', () => {
    it('valide un module avec toutes les données requises', () => {
      const result = createModuleSchema.safeParse(validModuleData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validModuleData);
      }
    });

    it('valide un module avec imageUrl optionnelle', () => {
      const data = {
        ...validModuleData,
        imageUrl: 'https://example.com/image.jpg',
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.imageUrl).toBe('https://example.com/image.jpg');
      }
    });

    it('valide un module avec imageUrl vide', () => {
      const data = {
        ...validModuleData,
        imageUrl: '',
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('valide un module sans imageUrl', () => {
      const result = createModuleSchema.safeParse(validModuleData);

      expect(result.success).toBe(true);
    });

    it('valide avec plusieurs thématiques', () => {
      const data = {
        ...validModuleData,
        thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.INVESTMENT, Thematic.SAVING],
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('valide avec la durée minimale (5 minutes)', () => {
      const data = {
        ...validModuleData,
        estimatedDuration: 5,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('valide avec la durée maximale (7 jours = 10080 minutes)', () => {
      const data = {
        ...validModuleData,
        estimatedDuration: 10080,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('Validation du titre', () => {
    it('rejette un titre trop court (moins de 3 caractères)', () => {
      const data = {
        ...validModuleData,
        title: 'Ab',
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le titre doit contenir au moins 3 caractères');
      }
    });

    it('rejette un titre trop long (plus de 200 caractères)', () => {
      const data = {
        ...validModuleData,
        title: 'A'.repeat(201),
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Le titre ne peut pas dépasser 200 caractères');
      }
    });

    it('rejette un titre vide', () => {
      const data = {
        ...validModuleData,
        title: '',
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('accepte un titre de 3 caractères exactement', () => {
      const data = {
        ...validModuleData,
        title: 'ABC',
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('accepte un titre de 200 caractères exactement', () => {
      const data = {
        ...validModuleData,
        title: 'A'.repeat(200),
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('Validation de la description', () => {
    it('rejette une description trop courte (moins de 10 caractères)', () => {
      const data = {
        ...validModuleData,
        description: 'Court',
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'La description doit contenir au moins 10 caractères'
        );
      }
    });

    it('rejette une description trop longue (plus de 5000 caractères)', () => {
      const data = {
        ...validModuleData,
        description: 'A'.repeat(5001),
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'La description ne peut pas dépasser 5000 caractères'
        );
      }
    });

    it('accepte une description de 10 caractères exactement', () => {
      const data = {
        ...validModuleData,
        description: '1234567890',
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('accepte une description de 5000 caractères exactement', () => {
      const data = {
        ...validModuleData,
        description: 'A'.repeat(5000),
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe("Validation de l'URL d'image", () => {
    it("accepte une URL d'image valide", () => {
      const data = {
        ...validModuleData,
        imageUrl: 'https://example.com/image.jpg',
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('accepte une chaîne vide pour imageUrl', () => {
      const data = {
        ...validModuleData,
        imageUrl: '',
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("rejette une URL d'image invalide", () => {
      const data = {
        ...validModuleData,
        imageUrl: 'not-a-valid-url',
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("L'URL de l'image doit être valide");
      }
    });

    it("accepte différents formats d'URL", () => {
      const validUrls = [
        'https://example.com/image.png',
        'http://test.org/photo.gif',
        'https://cdn.example.com/assets/images/module.webp',
      ];

      validUrls.forEach(url => {
        const data = {
          ...validModuleData,
          imageUrl: url,
        };

        const result = createModuleSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Validation du niveau de difficulté', () => {
    it('accepte tous les niveaux de difficulté valides', () => {
      const levels = [
        DifficultyLevel.BEGINNER,
        DifficultyLevel.INTERMEDIATE,
        DifficultyLevel.ADVANCED,
        DifficultyLevel.EXPERT,
      ];

      levels.forEach(level => {
        const data = {
          ...validModuleData,
          difficultyLevel: level,
        };

        const result = createModuleSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('rejette un niveau de difficulté invalide', () => {
      const data = {
        ...validModuleData,
        difficultyLevel: 'invalid' as any,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejette undefined pour difficultyLevel', () => {
      const data = {
        ...validModuleData,
        difficultyLevel: undefined as any,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('Validation de la durée estimée', () => {
    it('rejette une durée inférieure à 5 minutes', () => {
      const data = {
        ...validModuleData,
        estimatedDuration: 4,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La durée minimale est de 5 minutes');
      }
    });

    it('rejette une durée supérieure à 7 jours (10080 minutes)', () => {
      const data = {
        ...validModuleData,
        estimatedDuration: 10081,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La durée maximale est de 7 jours');
      }
    });

    it('rejette une durée négative', () => {
      const data = {
        ...validModuleData,
        estimatedDuration: -10,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejette une durée non numérique', () => {
      const data = {
        ...validModuleData,
        estimatedDuration: 'soixante' as any,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('accepte des durées valides variées', () => {
      const validDurations = [5, 30, 60, 120, 480, 1440, 10080];

      validDurations.forEach(duration => {
        const data = {
          ...validModuleData,
          estimatedDuration: duration,
        };

        const result = createModuleSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Validation des thématiques', () => {
    it('rejette un tableau vide de thématiques', () => {
      const data = {
        ...validModuleData,
        thematics: [],
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Au moins une thématique est requise');
      }
    });

    it('accepte toutes les thématiques valides', () => {
      const thematics = Object.values(Thematic);

      thematics.forEach(thematic => {
        const data = {
          ...validModuleData,
          thematics: [thematic],
        };

        const result = createModuleSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('rejette une thématique invalide', () => {
      const data = {
        ...validModuleData,
        thematics: ['invalid_thematic' as any],
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('accepte plusieurs thématiques valides', () => {
      const data = {
        ...validModuleData,
        thematics: [
          Thematic.FINANCIAL_EDUCATION,
          Thematic.INVESTMENT,
          Thematic.SAVING,
          Thematic.BUDGET_MANAGEMENT,
        ],
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('rejette si une thématique du tableau est invalide', () => {
      const data = {
        ...validModuleData,
        thematics: [Thematic.FINANCIAL_EDUCATION, 'invalid' as any],
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('Validation de champs manquants', () => {
    it('rejette si le titre est manquant', () => {
      const data = {
        description: 'Description complète du module',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: [Thematic.FINANCIAL_EDUCATION],
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejette si la description est manquante', () => {
      const data = {
        title: 'Module de test',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: [Thematic.FINANCIAL_EDUCATION],
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejette si difficultyLevel est manquant', () => {
      const data = {
        title: 'Module de test',
        description: 'Description complète du module',
        estimatedDuration: 60,
        thematics: [Thematic.FINANCIAL_EDUCATION],
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejette si estimatedDuration est manquant', () => {
      const data = {
        title: 'Module de test',
        description: 'Description complète du module',
        difficultyLevel: DifficultyLevel.BEGINNER,
        thematics: [Thematic.FINANCIAL_EDUCATION],
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejette si thematics est manquant', () => {
      const data = {
        title: 'Module de test',
        description: 'Description complète du module',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('Validation de types incorrects', () => {
    it("rejette si title n'est pas une chaîne", () => {
      const data = {
        ...validModuleData,
        title: 123 as any,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("rejette si description n'est pas une chaîne", () => {
      const data = {
        ...validModuleData,
        description: ['description', 'array'] as any,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("rejette si estimatedDuration n'est pas un nombre", () => {
      const data = {
        ...validModuleData,
        estimatedDuration: '60' as any,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it("rejette si thematics n'est pas un tableau", () => {
      const data = {
        ...validModuleData,
        thematics: Thematic.FINANCIAL_EDUCATION as any,
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('Validation de plusieurs erreurs simultanées', () => {
    it('retourne toutes les erreurs de validation', () => {
      const data = {
        title: 'Ab', // trop court
        description: 'Court', // trop court
        difficultyLevel: 'invalid' as any, // invalide
        estimatedDuration: 0, // trop court
        thematics: [], // vide
        imageUrl: 'not-a-url', // URL invalide
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);

        // Vérifier que certaines erreurs spécifiques sont présentes
        const messages = result.error.issues.map(issue => issue.message);
        expect(messages).toContain('Le titre doit contenir au moins 3 caractères');
        expect(messages).toContain('La description doit contenir au moins 10 caractères');
        expect(messages).toContain('Au moins une thématique est requise');
      }
    });

    it('valide avec des corrections appropriées', () => {
      const data = {
        title: 'Module corrigé de test financier',
        description: 'Description corrigée et complète du module de test',
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 60,
        thematics: [Thematic.FINANCIAL_EDUCATION],
        imageUrl: 'https://example.com/corrected-image.jpg',
      };

      const result = createModuleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe("Test d'inférence de type", () => {
    it('génère le bon type TypeScript', () => {
      const data = {
        title: 'Module TypeScript',
        description: "Test d'inférence de type pour le module",
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        thematics: [Thematic.FINANCIAL_EDUCATION, Thematic.INVESTMENT],
        imageUrl: 'https://example.com/typescript.png',
      };

      const result = createModuleSchema.safeParse(data);

      if (result.success) {
        // Vérification du type inféré
        const typed: typeof result.data = result.data;
        expect(typed.title).toBe('Module TypeScript');
        expect(typed.thematics).toHaveLength(2);
        expect(typed.imageUrl).toBe('https://example.com/typescript.png');
      }
    });
  });
});
