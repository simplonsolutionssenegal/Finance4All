// __tests__/module-constants.test.ts
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  THEMATIC_LABELS,
  THEMATIC_ICONS,
} from '@/lib/constants/module-constants';
import { DifficultyLevel, Thematic } from '@/types/modules/module';

describe('Module Constants', () => {
  describe('DIFFICULTY_LABELS', () => {
    it('contient tous les niveaux de difficulté', () => {
      const expectedLevels = [
        DifficultyLevel.BEGINNER,
        DifficultyLevel.INTERMEDIATE,
        DifficultyLevel.ADVANCED,
        DifficultyLevel.EXPERT,
      ];

      expectedLevels.forEach(level => {
        expect(DIFFICULTY_LABELS[level]).toBeDefined();
      });
    });

    it('a les bonnes valeurs pour chaque niveau', () => {
      expect(DIFFICULTY_LABELS[DifficultyLevel.BEGINNER]).toBe('Débutant');
      expect(DIFFICULTY_LABELS[DifficultyLevel.INTERMEDIATE]).toBe('Intermédiaire');
      expect(DIFFICULTY_LABELS[DifficultyLevel.ADVANCED]).toBe('Avancé');
      expect(DIFFICULTY_LABELS[DifficultyLevel.EXPERT]).toBe('Expert');
    });

    it('contient exactement 4 niveaux', () => {
      expect(Object.keys(DIFFICULTY_LABELS)).toHaveLength(4);
    });

    it('toutes les valeurs sont des chaînes non vides', () => {
      Object.values(DIFFICULTY_LABELS).forEach(label => {
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('DIFFICULTY_COLORS', () => {
    it('contient tous les niveaux de difficulté', () => {
      const expectedLevels = [
        DifficultyLevel.BEGINNER,
        DifficultyLevel.INTERMEDIATE,
        DifficultyLevel.ADVANCED,
        DifficultyLevel.EXPERT,
      ];

      expectedLevels.forEach(level => {
        expect(DIFFICULTY_COLORS[level]).toBeDefined();
      });
    });

    it('a les bonnes classes CSS pour chaque niveau', () => {
      expect(DIFFICULTY_COLORS[DifficultyLevel.BEGINNER]).toContain('bg-green-100');
      expect(DIFFICULTY_COLORS[DifficultyLevel.BEGINNER]).toContain('text-green-800');

      expect(DIFFICULTY_COLORS[DifficultyLevel.INTERMEDIATE]).toContain('bg-blue-100');
      expect(DIFFICULTY_COLORS[DifficultyLevel.INTERMEDIATE]).toContain('text-blue-800');

      expect(DIFFICULTY_COLORS[DifficultyLevel.ADVANCED]).toContain('bg-orange-100');
      expect(DIFFICULTY_COLORS[DifficultyLevel.ADVANCED]).toContain('text-orange-800');

      expect(DIFFICULTY_COLORS[DifficultyLevel.EXPERT]).toContain('bg-red-100');
      expect(DIFFICULTY_COLORS[DifficultyLevel.EXPERT]).toContain('text-red-800');
    });

    it('toutes les couleurs incluent les classes hover', () => {
      Object.values(DIFFICULTY_COLORS).forEach(color => {
        expect(color).toMatch(/hover:bg-\w+-100/);
      });
    });

    it('contient exactement 4 couleurs', () => {
      expect(Object.keys(DIFFICULTY_COLORS)).toHaveLength(4);
    });
  });

  describe('THEMATIC_LABELS', () => {
    it('contient toutes les thématiques', () => {
      const expectedThematics = [
        Thematic.FINANCIAL_EDUCATION,
        Thematic.PERSONAL_DEVELOPMENT,
        Thematic.FINANCIAL_LOAN,
        Thematic.BANK_CREDIT,
        Thematic.INVESTMENT,
        Thematic.BUDGET_MANAGEMENT,
        Thematic.SAVING,
        Thematic.ENTREPRENEURSHIP,
        Thematic.TAXATION,
        Thematic.INSURANCE,
      ];

      expectedThematics.forEach(thematic => {
        expect(THEMATIC_LABELS[thematic]).toBeDefined();
      });
    });

    it('a les bonnes valeurs pour chaque thématique', () => {
      expect(THEMATIC_LABELS[Thematic.FINANCIAL_EDUCATION]).toBe('Éducation financière');
      expect(THEMATIC_LABELS[Thematic.PERSONAL_DEVELOPMENT]).toBe('Développement personnel');
      expect(THEMATIC_LABELS[Thematic.FINANCIAL_LOAN]).toBe('Prêt financier');
      expect(THEMATIC_LABELS[Thematic.BANK_CREDIT]).toBe('Crédit bancaire');
      expect(THEMATIC_LABELS[Thematic.INVESTMENT]).toBe('Investissement');
      expect(THEMATIC_LABELS[Thematic.BUDGET_MANAGEMENT]).toBe('Gestion de budget');
      expect(THEMATIC_LABELS[Thematic.SAVING]).toBe('Épargne');
      expect(THEMATIC_LABELS[Thematic.ENTREPRENEURSHIP]).toBe('Entrepreneuriat');
      expect(THEMATIC_LABELS[Thematic.TAXATION]).toBe('Fiscalité');
      expect(THEMATIC_LABELS[Thematic.INSURANCE]).toBe('Assurance');
    });

    it('contient exactement 10 thématiques', () => {
      expect(Object.keys(THEMATIC_LABELS)).toHaveLength(10);
    });

    it('toutes les valeurs sont des chaînes non vides', () => {
      Object.values(THEMATIC_LABELS).forEach(label => {
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('THEMATIC_ICONS', () => {
    it('contient toutes les thématiques', () => {
      const expectedThematics = [
        Thematic.FINANCIAL_EDUCATION,
        Thematic.PERSONAL_DEVELOPMENT,
        Thematic.FINANCIAL_LOAN,
        Thematic.BANK_CREDIT,
        Thematic.INVESTMENT,
        Thematic.BUDGET_MANAGEMENT,
        Thematic.SAVING,
        Thematic.ENTREPRENEURSHIP,
        Thematic.TAXATION,
        Thematic.INSURANCE,
      ];

      expectedThematics.forEach(thematic => {
        expect(THEMATIC_ICONS[thematic]).toBeDefined();
      });
    });

    it('a les bonnes icônes pour chaque thématique', () => {
      expect(THEMATIC_ICONS[Thematic.FINANCIAL_EDUCATION]).toBe('📚');
      expect(THEMATIC_ICONS[Thematic.PERSONAL_DEVELOPMENT]).toBe('🚀');
      expect(THEMATIC_ICONS[Thematic.FINANCIAL_LOAN]).toBe('💰');
      expect(THEMATIC_ICONS[Thematic.BANK_CREDIT]).toBe('🏦');
      expect(THEMATIC_ICONS[Thematic.INVESTMENT]).toBe('📈');
      expect(THEMATIC_ICONS[Thematic.BUDGET_MANAGEMENT]).toBe('💳');
      expect(THEMATIC_ICONS[Thematic.SAVING]).toBe('🐷');
      expect(THEMATIC_ICONS[Thematic.ENTREPRENEURSHIP]).toBe('💼');
      expect(THEMATIC_ICONS[Thematic.TAXATION]).toBe('📊');
      expect(THEMATIC_ICONS[Thematic.INSURANCE]).toBe('🛡️');
    });

    it('contient exactement 10 icônes', () => {
      expect(Object.keys(THEMATIC_ICONS)).toHaveLength(10);
    });

    it('toutes les valeurs sont des emojis', () => {
      Object.values(THEMATIC_ICONS).forEach(icon => {
        expect(typeof icon).toBe('string');
        expect(icon.length).toBeGreaterThan(0);
        // Vérifier que c'est un emoji (contient des caractères Unicode spéciaux)
        expect(/[\u{1F300}-\u{1F9FF}]/u.test(icon)).toBe(true);
      });
    });
  });
});
