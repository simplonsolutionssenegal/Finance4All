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

  describe("Cas d'utilisation pratiques", () => {
    it("devrait permettre d'obtenir le label à partir du niveau de difficulté", () => {
      const level = DifficultyLevel.BEGINNER;
      const label = DIFFICULTY_LABELS[level];
      expect(label).toBe('Débutant');
    });

    it("devrait permettre d'obtenir les couleurs à partir du niveau de difficulté", () => {
      const level = DifficultyLevel.ADVANCED;
      const colors = DIFFICULTY_COLORS[level];
      expect(colors).toContain('orange');
    });

    it("devrait permettre d'obtenir le label à partir du statut du module", () => {
      const status = ModuleStatus.PUBLISHED;
      const label = MODULE_STATUS_LABELS[status];
      expect(label).toBe('Publié');
    });

    it("devrait permettre d'obtenir les couleurs à partir du statut du module", () => {
      const status = ModuleStatus.DRAFT;
      const colors = MODULE_STATUS_COLORS[status];
      expect(colors).toContain('gray');
    });

    it('devrait créer une fonction helper pour obtenir le label de difficulté', () => {
      const getDifficultyLabel = (level: DifficultyLevel): string => {
        return DIFFICULTY_LABELS[level];
      };

      expect(getDifficultyLabel(DifficultyLevel.EXPERT)).toBe('Expert');
      expect(getDifficultyLabel(DifficultyLevel.INTERMEDIATE)).toBe('Intermédiaire');
    });

    it('devrait créer une fonction helper pour obtenir les couleurs de difficulté', () => {
      const getDifficultyColors = (level: DifficultyLevel): string => {
        return DIFFICULTY_COLORS[level];
      };

      expect(getDifficultyColors(DifficultyLevel.BEGINNER)).toContain('green');
      expect(getDifficultyColors(DifficultyLevel.EXPERT)).toContain('red');
    });

    it('devrait créer une fonction helper pour obtenir le label de statut', () => {
      const getStatusLabel = (status: ModuleStatus): string => {
        return MODULE_STATUS_LABELS[status];
      };

      expect(getStatusLabel(ModuleStatus.ARCHIVED)).toBe('Archivé');
      expect(getStatusLabel(ModuleStatus.DRAFT)).toBe('Brouillon');
    });

    it('devrait créer une fonction helper pour obtenir les couleurs de statut', () => {
      const getStatusColors = (status: ModuleStatus): string => {
        return MODULE_STATUS_COLORS[status];
      };

      expect(getStatusColors(ModuleStatus.PUBLISHED)).toContain('green');
      expect(getStatusColors(ModuleStatus.ARCHIVED)).toContain('orange');
    });
  });

  describe('Validation des valeurs spécifiques', () => {
    it('DIFFICULTY_LABELS devrait avoir des valeurs exactes', () => {
      expect(DIFFICULTY_LABELS[DifficultyLevel.BEGINNER]).toBe('Débutant');
      expect(DIFFICULTY_LABELS[DifficultyLevel.INTERMEDIATE]).toBe('Intermédiaire');
      expect(DIFFICULTY_LABELS[DifficultyLevel.ADVANCED]).toBe('Avancé');
      expect(DIFFICULTY_LABELS[DifficultyLevel.EXPERT]).toBe('Expert');
    });

    it('DIFFICULTY_COLORS devrait avoir des classes Tailwind exactes', () => {
      expect(DIFFICULTY_COLORS[DifficultyLevel.BEGINNER]).toBe(
        'bg-green-100 text-green-800 hover:bg-green-100 '
      );
      expect(DIFFICULTY_COLORS[DifficultyLevel.INTERMEDIATE]).toBe(
        'bg-blue-100 text-blue-800 hover:bg-blue-100 '
      );
      expect(DIFFICULTY_COLORS[DifficultyLevel.ADVANCED]).toBe(
        'bg-orange-100 text-orange-800 hover:bg-orange-100 '
      );
      expect(DIFFICULTY_COLORS[DifficultyLevel.EXPERT]).toBe(
        'bg-red-100 text-red-800 hover:bg-red-100 '
      );
    });

    it('MODULE_STATUS_LABELS devrait avoir des valeurs exactes', () => {
      expect(MODULE_STATUS_LABELS[ModuleStatus.DRAFT]).toBe('Brouillon');
      expect(MODULE_STATUS_LABELS[ModuleStatus.PUBLISHED]).toBe('Publié');
      expect(MODULE_STATUS_LABELS[ModuleStatus.ARCHIVED]).toBe('Archivé');
    });

    it('MODULE_STATUS_COLORS devrait avoir des classes Tailwind exactes', () => {
      expect(MODULE_STATUS_COLORS[ModuleStatus.DRAFT]).toBe('bg-gray-100 text-gray-700');
      expect(MODULE_STATUS_COLORS[ModuleStatus.PUBLISHED]).toBe('bg-green-100 text-green-700');
      expect(MODULE_STATUS_COLORS[ModuleStatus.ARCHIVED]).toBe('bg-orange-100 text-orange-700');
    });
  });

  describe('Immutabilité des constantes', () => {
    it('DIFFICULTY_LABELS ne devrait pas être modifiable', () => {
      const originalValue = DIFFICULTY_LABELS[DifficultyLevel.BEGINNER];
      expect(() => {
        (DIFFICULTY_LABELS as any)[DifficultyLevel.BEGINNER] = 'Modifié';
      }).toThrow();
      expect(DIFFICULTY_LABELS[DifficultyLevel.BEGINNER]).toBe(originalValue);
    });

    it('DIFFICULTY_COLORS ne devrait pas être modifiable', () => {
      const originalValue = DIFFICULTY_COLORS[DifficultyLevel.BEGINNER];
      expect(() => {
        (DIFFICULTY_COLORS as any)[DifficultyLevel.BEGINNER] = 'bg-red-100';
      }).toThrow();
      expect(DIFFICULTY_COLORS[DifficultyLevel.BEGINNER]).toBe(originalValue);
    });

    it('MODULE_STATUS_LABELS ne devrait pas être modifiable', () => {
      const originalValue = MODULE_STATUS_LABELS[ModuleStatus.DRAFT];
      expect(() => {
        (MODULE_STATUS_LABELS as any)[ModuleStatus.DRAFT] = 'Modifié';
      }).toThrow();
      expect(MODULE_STATUS_LABELS[ModuleStatus.DRAFT]).toBe(originalValue);
    });

    it('MODULE_STATUS_COLORS ne devrait pas être modifiable', () => {
      const originalValue = MODULE_STATUS_COLORS[ModuleStatus.DRAFT];
      expect(() => {
        (MODULE_STATUS_COLORS as any)[ModuleStatus.DRAFT] = 'bg-red-100';
      }).toThrow();
      expect(MODULE_STATUS_COLORS[ModuleStatus.DRAFT]).toBe(originalValue);
    });
  });

  describe('Couverture complète des énumérations', () => {
    it('devrait couvrir tous les DifficultyLevel sans manquer', () => {
      const enumValues = Object.values(DifficultyLevel);
      const labelKeys = Object.keys(DIFFICULTY_LABELS);
      const colorKeys = Object.keys(DIFFICULTY_COLORS);

      expect(enumValues.length).toBe(labelKeys.length);
      expect(enumValues.length).toBe(colorKeys.length);

      enumValues.forEach(value => {
        expect(labelKeys).toContain(value);
        expect(colorKeys).toContain(value);
      });
    });

    it('devrait couvrir tous les ModuleStatus sans manquer', () => {
      const enumValues = Object.values(ModuleStatus);
      const labelKeys = Object.keys(MODULE_STATUS_LABELS);
      const colorKeys = Object.keys(MODULE_STATUS_COLORS);

      expect(enumValues.length).toBe(labelKeys.length);
      expect(enumValues.length).toBe(colorKeys.length);

      enumValues.forEach(value => {
        expect(labelKeys).toContain(value);
        expect(colorKeys).toContain(value);
      });
    });

    it('ne devrait pas avoir de clés supplémentaires dans DIFFICULTY_LABELS', () => {
      const labelKeys = Object.keys(DIFFICULTY_LABELS);
      const enumValues = Object.values(DifficultyLevel);

      labelKeys.forEach(key => {
        expect(enumValues).toContain(key);
      });
    });

    it('ne devrait pas avoir de clés supplémentaires dans MODULE_STATUS_LABELS', () => {
      const labelKeys = Object.keys(MODULE_STATUS_LABELS);
      const enumValues = Object.values(ModuleStatus);

      labelKeys.forEach(key => {
        expect(enumValues).toContain(key);
      });
    });
  });

  describe('Format des classes CSS', () => {
    it('toutes les DIFFICULTY_COLORS devraient avoir des classes hover', () => {
      const allColors = Object.values(DIFFICULTY_COLORS);
      allColors.forEach(colorClasses => {
        expect(colorClasses).toContain('hover:');
      });
    });

    it('toutes les DIFFICULTY_COLORS devraient se terminer par un espace', () => {
      const allColors = Object.values(DIFFICULTY_COLORS);
      allColors.forEach(colorClasses => {
        expect(colorClasses).toMatch(/\s$/);
      });
    });

    it('toutes les classes de couleur devraient utiliser des niveaux de couleur valides', () => {
      const allDifficultyColors = Object.values(DIFFICULTY_COLORS);
      const allStatusColors = Object.values(MODULE_STATUS_COLORS);

      [...allDifficultyColors, ...allStatusColors].forEach(colorClasses => {
        const matches = colorClasses.match(/\d+/g);
        if (matches) {
          matches.forEach(num => {
            const level = parseInt(num, 10);
            expect([50, 100, 200, 300, 400, 500, 600, 700, 800, 900]).toContain(level);
          });
        }
      });
    });

    it('devrait utiliser des paires cohérentes bg/text', () => {
      const checkColorPair = (colorClasses: string) => {
        if (colorClasses.includes('bg-green')) {
          expect(colorClasses).toContain('text-green');
        }
        if (colorClasses.includes('bg-blue')) {
          expect(colorClasses).toContain('text-blue');
        }
        if (colorClasses.includes('bg-orange')) {
          expect(colorClasses).toContain('text-orange');
        }
        if (colorClasses.includes('bg-red')) {
          expect(colorClasses).toContain('text-red');
        }
        if (colorClasses.includes('bg-gray')) {
          expect(colorClasses).toContain('text-gray');
        }
      };

      Object.values(DIFFICULTY_COLORS).forEach(checkColorPair);
      Object.values(MODULE_STATUS_COLORS).forEach(checkColorPair);
    });
  });

  describe('Type safety', () => {
    it('devrait avoir le type Record correct pour DIFFICULTY_LABELS', () => {
      const testFunction = (labels: Record<DifficultyLevel, string>) => {
        return Object.keys(labels).length;
      };

      expect(testFunction(DIFFICULTY_LABELS)).toBe(4);
    });

    it('devrait avoir le type Record correct pour DIFFICULTY_COLORS', () => {
      const testFunction = (colors: Record<DifficultyLevel, string>) => {
        return Object.keys(colors).length;
      };

      expect(testFunction(DIFFICULTY_COLORS)).toBe(4);
    });

    it('devrait avoir le type Record correct pour MODULE_STATUS_LABELS', () => {
      const testFunction = (labels: Record<ModuleStatus, string>) => {
        return Object.keys(labels).length;
      };

      expect(testFunction(MODULE_STATUS_LABELS)).toBe(3);
    });

    it('devrait avoir le type Record correct pour MODULE_STATUS_COLORS', () => {
      const testFunction = (colors: Record<ModuleStatus, string>) => {
        return Object.keys(colors).length;
      };

      expect(testFunction(MODULE_STATUS_COLORS)).toBe(3);
    });
  });
});
