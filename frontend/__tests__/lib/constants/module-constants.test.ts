import {
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  MODULE_STATUS_LABELS,
  MODULE_STATUS_COLORS,
} from '@/lib/constants/module-constants';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

describe('module-constants', () => {
  describe('DIFFICULTY_LABELS', () => {
    it('devrait contenir tous les labels de difficulté', () => {
      expect(DIFFICULTY_LABELS).toBeDefined();
      expect(Object.keys(DIFFICULTY_LABELS)).toHaveLength(4);
    });

    it('devrait avoir le label correct pour BEGINNER', () => {
      expect(DIFFICULTY_LABELS[DifficultyLevel.BEGINNER]).toBe('Débutant');
    });

    it('devrait avoir le label correct pour INTERMEDIATE', () => {
      expect(DIFFICULTY_LABELS[DifficultyLevel.INTERMEDIATE]).toBe('Intermédiaire');
    });

    it('devrait avoir le label correct pour ADVANCED', () => {
      expect(DIFFICULTY_LABELS[DifficultyLevel.ADVANCED]).toBe('Avancé');
    });

    it('devrait avoir le label correct pour EXPERT', () => {
      expect(DIFFICULTY_LABELS[DifficultyLevel.EXPERT]).toBe('Expert');
    });

    it('devrait mapper tous les niveaux de DifficultyLevel', () => {
      const allLevels = Object.values(DifficultyLevel);
      allLevels.forEach(level => {
        expect(DIFFICULTY_LABELS[level]).toBeDefined();
        expect(typeof DIFFICULTY_LABELS[level]).toBe('string');
      });
    });
  });

  describe('DIFFICULTY_COLORS', () => {
    it('devrait contenir toutes les couleurs de difficulté', () => {
      expect(DIFFICULTY_COLORS).toBeDefined();
      expect(Object.keys(DIFFICULTY_COLORS)).toHaveLength(4);
    });

    it('devrait avoir les classes CSS correctes pour BEGINNER', () => {
      expect(DIFFICULTY_COLORS[DifficultyLevel.BEGINNER]).toContain('green');
    });

    it('devrait avoir les classes CSS correctes pour INTERMEDIATE', () => {
      expect(DIFFICULTY_COLORS[DifficultyLevel.INTERMEDIATE]).toContain('blue');
    });

    it('devrait avoir les classes CSS correctes pour ADVANCED', () => {
      expect(DIFFICULTY_COLORS[DifficultyLevel.ADVANCED]).toContain('orange');
    });

    it('devrait avoir les classes CSS correctes pour EXPERT', () => {
      expect(DIFFICULTY_COLORS[DifficultyLevel.EXPERT]).toContain('red');
    });

    it('devrait mapper tous les niveaux de DifficultyLevel avec des classes CSS', () => {
      const allLevels = Object.values(DifficultyLevel);
      allLevels.forEach(level => {
        expect(DIFFICULTY_COLORS[level]).toBeDefined();
        expect(typeof DIFFICULTY_COLORS[level]).toBe('string');
        expect(DIFFICULTY_COLORS[level].length).toBeGreaterThan(0);
      });
    });

    it('devrait contenir des classes Tailwind CSS valides', () => {
      const allColors = Object.values(DIFFICULTY_COLORS);
      allColors.forEach(colorClasses => {
        expect(colorClasses).toMatch(/bg-\w+-\d+/);
        expect(colorClasses).toMatch(/text-\w+-\d+/);
      });
    });
  });

  describe('MODULE_STATUS_LABELS', () => {
    it('devrait contenir tous les labels de statut', () => {
      expect(MODULE_STATUS_LABELS).toBeDefined();
      expect(Object.keys(MODULE_STATUS_LABELS)).toHaveLength(3);
    });

    it('devrait avoir le label correct pour DRAFT', () => {
      expect(MODULE_STATUS_LABELS[ModuleStatus.DRAFT]).toBe('Brouillon');
    });

    it('devrait avoir le label correct pour PUBLISHED', () => {
      expect(MODULE_STATUS_LABELS[ModuleStatus.PUBLISHED]).toBe('Publié');
    });

    it('devrait avoir le label correct pour ARCHIVED', () => {
      expect(MODULE_STATUS_LABELS[ModuleStatus.ARCHIVED]).toBe('Archivé');
    });

    it('devrait mapper tous les statuts de ModuleStatus', () => {
      const allStatuses = Object.values(ModuleStatus);
      allStatuses.forEach(status => {
        expect(MODULE_STATUS_LABELS[status]).toBeDefined();
        expect(typeof MODULE_STATUS_LABELS[status]).toBe('string');
      });
    });
  });

  describe('MODULE_STATUS_COLORS', () => {
    it('devrait contenir toutes les couleurs de statut', () => {
      expect(MODULE_STATUS_COLORS).toBeDefined();
      expect(Object.keys(MODULE_STATUS_COLORS)).toHaveLength(3);
    });

    it('devrait avoir les classes CSS correctes pour DRAFT', () => {
      expect(MODULE_STATUS_COLORS[ModuleStatus.DRAFT]).toContain('gray');
    });

    it('devrait avoir les classes CSS correctes pour PUBLISHED', () => {
      expect(MODULE_STATUS_COLORS[ModuleStatus.PUBLISHED]).toContain('green');
    });

    it('devrait avoir les classes CSS correctes pour ARCHIVED', () => {
      expect(MODULE_STATUS_COLORS[ModuleStatus.ARCHIVED]).toContain('orange');
    });

    it('devrait mapper tous les statuts de ModuleStatus avec des classes CSS', () => {
      const allStatuses = Object.values(ModuleStatus);
      allStatuses.forEach(status => {
        expect(MODULE_STATUS_COLORS[status]).toBeDefined();
        expect(typeof MODULE_STATUS_COLORS[status]).toBe('string');
        expect(MODULE_STATUS_COLORS[status].length).toBeGreaterThan(0);
      });
    });

    it('devrait contenir des classes Tailwind CSS valides', () => {
      const allColors = Object.values(MODULE_STATUS_COLORS);
      allColors.forEach(colorClasses => {
        expect(colorClasses).toMatch(/bg-\w+-\d+/);
        expect(colorClasses).toMatch(/text-\w+-\d+/);
      });
    });
  });

  describe('Cohérence entre les constantes', () => {
    it('devrait avoir le même nombre de difficultés dans LABELS et COLORS', () => {
      expect(Object.keys(DIFFICULTY_LABELS).length).toBe(Object.keys(DIFFICULTY_COLORS).length);
    });

    it('devrait avoir les mêmes clés pour DIFFICULTY_LABELS et DIFFICULTY_COLORS', () => {
      const labelKeys = Object.keys(DIFFICULTY_LABELS).sort();
      const colorKeys = Object.keys(DIFFICULTY_COLORS).sort();
      expect(labelKeys).toEqual(colorKeys);
    });

    it('devrait avoir le même nombre de statuts dans LABELS et COLORS', () => {
      expect(Object.keys(MODULE_STATUS_LABELS).length).toBe(
        Object.keys(MODULE_STATUS_COLORS).length
      );
    });

    it('devrait avoir les mêmes clés pour MODULE_STATUS_LABELS et MODULE_STATUS_COLORS', () => {
      const labelKeys = Object.keys(MODULE_STATUS_LABELS).sort();
      const colorKeys = Object.keys(MODULE_STATUS_COLORS).sort();
      expect(labelKeys).toEqual(colorKeys);
    });
  });

  describe('Exports', () => {
    it('devrait exporter DIFFICULTY_LABELS', () => {
      expect(DIFFICULTY_LABELS).toBeDefined();
      expect(typeof DIFFICULTY_LABELS).toBe('object');
    });

    it('devrait exporter DIFFICULTY_COLORS', () => {
      expect(DIFFICULTY_COLORS).toBeDefined();
      expect(typeof DIFFICULTY_COLORS).toBe('object');
    });

    it('devrait exporter MODULE_STATUS_LABELS', () => {
      expect(MODULE_STATUS_LABELS).toBeDefined();
      expect(typeof MODULE_STATUS_LABELS).toBe('object');
    });

    it('devrait exporter MODULE_STATUS_COLORS', () => {
      expect(MODULE_STATUS_COLORS).toBeDefined();
      expect(typeof MODULE_STATUS_COLORS).toBe('object');
    });
  });
});
