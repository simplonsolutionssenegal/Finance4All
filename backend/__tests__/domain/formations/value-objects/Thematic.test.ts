// backend/__tests__/domain/formations/value-objects/Thematic.test.ts

import {
  Thematic,
  ThematicLabels,
  ThematicDescriptions,
  ThematicUtils,
} from '../../../../src/domain/formations/value-objects/Thematic';

describe('Thematic Value Object', () => {
  describe('Thematic Enum', () => {
    it('devrait avoir toutes les valeurs attendues', () => {
      const expectedValues = [
        'FINANCIAL_EDUCATION',
        'PERSONAL_DEVELOPMENT',
        'FINANCIAL_LOAN',
        'BANK_CREDIT',
        'INVESTMENT',
        'BUDGET_MANAGEMENT',
        'SAVING',
        'ENTREPRENEURSHIP',
        'TAXATION',
        'INSURANCE',
      ];

      const actualValues = Object.values(Thematic);
      expect(actualValues).toHaveLength(expectedValues.length);
      expectedValues.forEach(value => {
        expect(actualValues).toContain(value);
      });
    });

    it('devrait avoir des clés correspondant aux valeurs', () => {
      expect(Thematic.FINANCIAL_EDUCATION).toBe('FINANCIAL_EDUCATION');
      expect(Thematic.PERSONAL_DEVELOPMENT).toBe('PERSONAL_DEVELOPMENT');
      expect(Thematic.FINANCIAL_LOAN).toBe('FINANCIAL_LOAN');
      expect(Thematic.BANK_CREDIT).toBe('BANK_CREDIT');
      expect(Thematic.INVESTMENT).toBe('INVESTMENT');
      expect(Thematic.BUDGET_MANAGEMENT).toBe('BUDGET_MANAGEMENT');
      expect(Thematic.SAVING).toBe('SAVING');
      expect(Thematic.ENTREPRENEURSHIP).toBe('ENTREPRENEURSHIP');
      expect(Thematic.TAXATION).toBe('TAXATION');
      expect(Thematic.INSURANCE).toBe('INSURANCE');
    });
  });

  describe('ThematicLabels', () => {
    it('devrait avoir un label pour chaque thématique', () => {
      Object.values(Thematic).forEach(thematic => {
        expect(ThematicLabels[thematic]).toBeDefined();
        expect(typeof ThematicLabels[thematic]).toBe('string');
        expect(ThematicLabels[thematic].length).toBeGreaterThan(0);
      });
    });

    it('devrait avoir les labels attendus en français', () => {
      expect(ThematicLabels[Thematic.FINANCIAL_EDUCATION]).toBe('Éducation Financière');
      expect(ThematicLabels[Thematic.PERSONAL_DEVELOPMENT]).toBe('Développement Personnel');
      expect(ThematicLabels[Thematic.FINANCIAL_LOAN]).toBe('Prêt Financier');
      expect(ThematicLabels[Thematic.BANK_CREDIT]).toBe('Crédit Bancaire');
      expect(ThematicLabels[Thematic.INVESTMENT]).toBe('Investissement');
      expect(ThematicLabels[Thematic.BUDGET_MANAGEMENT]).toBe('Gestion de Budget');
      expect(ThematicLabels[Thematic.SAVING]).toBe('Épargne');
      expect(ThematicLabels[Thematic.ENTREPRENEURSHIP]).toBe('Entrepreneuriat');
      expect(ThematicLabels[Thematic.TAXATION]).toBe('Fiscalité');
      expect(ThematicLabels[Thematic.INSURANCE]).toBe('Assurance');
    });

    it('devrait couvrir exactement toutes les thématiques', () => {
      const labelKeys = Object.keys(ThematicLabels);
      const thematicValues = Object.values(Thematic);

      expect(labelKeys).toHaveLength(thematicValues.length);
      thematicValues.forEach(thematic => {
        expect(labelKeys).toContain(thematic);
      });
    });
  });

  describe('ThematicDescriptions', () => {
    it('devrait avoir une description pour chaque thématique', () => {
      Object.values(Thematic).forEach(thematic => {
        expect(ThematicDescriptions[thematic]).toBeDefined();
        expect(typeof ThematicDescriptions[thematic]).toBe('string');
        expect(ThematicDescriptions[thematic].length).toBeGreaterThan(0);
      });
    });

    it('devrait avoir des descriptions significatives', () => {
      expect(ThematicDescriptions[Thematic.FINANCIAL_EDUCATION]).toBe(
        'Comprendre les bases de la finance personnelle'
      );
      expect(ThematicDescriptions[Thematic.INVESTMENT]).toBe('Apprendre à investir intelligemment');
      expect(ThematicDescriptions[Thematic.BUDGET_MANAGEMENT]).toBe(
        'Gérer efficacement son budget'
      );
      expect(ThematicDescriptions[Thematic.ENTREPRENEURSHIP]).toBe(
        'Créer et développer son entreprise'
      );
    });

    it('devrait couvrir exactement toutes les thématiques', () => {
      const descriptionKeys = Object.keys(ThematicDescriptions);
      const thematicValues = Object.values(Thematic);

      expect(descriptionKeys).toHaveLength(thematicValues.length);
      thematicValues.forEach(thematic => {
        expect(descriptionKeys).toContain(thematic);
      });
    });
  });

  describe('ThematicUtils', () => {
    describe('getLabel method', () => {
      it('devrait retourner le bon label pour chaque thématique', () => {
        expect(ThematicUtils.getLabel(Thematic.FINANCIAL_EDUCATION)).toBe('Éducation Financière');
        expect(ThematicUtils.getLabel(Thematic.INVESTMENT)).toBe('Investissement');
        expect(ThematicUtils.getLabel(Thematic.SAVING)).toBe('Épargne');
      });

      it('devrait retourner le même résultat que ThematicLabels', () => {
        Object.values(Thematic).forEach(thematic => {
          expect(ThematicUtils.getLabel(thematic)).toBe(ThematicLabels[thematic]);
        });
      });
    });

    describe('getDescription method', () => {
      it('devrait retourner la bonne description pour chaque thématique', () => {
        expect(ThematicUtils.getDescription(Thematic.FINANCIAL_EDUCATION)).toBe(
          'Comprendre les bases de la finance personnelle'
        );
        expect(ThematicUtils.getDescription(Thematic.INVESTMENT)).toBe(
          'Apprendre à investir intelligemment'
        );
        expect(ThematicUtils.getDescription(Thematic.BUDGET_MANAGEMENT)).toBe(
          'Gérer efficacement son budget'
        );
      });

      it('devrait retourner le même résultat que ThematicDescriptions', () => {
        Object.values(Thematic).forEach(thematic => {
          expect(ThematicUtils.getDescription(thematic)).toBe(ThematicDescriptions[thematic]);
        });
      });
    });

    describe('isValid method', () => {
      it('devrait retourner true pour des valeurs de thématiques valides', () => {
        Object.values(Thematic).forEach(thematic => {
          expect(ThematicUtils.isValid(thematic)).toBe(true);
        });
      });

      it('devrait retourner false pour des valeurs invalides', () => {
        expect(ThematicUtils.isValid('INVALID_THEMATIC')).toBe(false);
        expect(ThematicUtils.isValid('')).toBe(false);
        expect(ThematicUtils.isValid('financial_education')).toBe(false); // case sensitive
        expect(ThematicUtils.isValid('UNKNOWN')).toBe(false);
      });

      it('devrait avoir une signature de type correcte (type guard)', () => {
        const value: string = 'FINANCIAL_EDUCATION';
        if (ThematicUtils.isValid(value)) {
          // Dans ce bloc, TypeScript sait que value est de type Thematic
          expect(ThematicUtils.getLabel(value)).toBeDefined();
        }
      });
    });

    describe('getAll method', () => {
      it('devrait retourner toutes les thématiques disponibles', () => {
        const allThematics = ThematicUtils.getAll();
        const enumValues = Object.values(Thematic);

        expect(allThematics).toHaveLength(enumValues.length);
        enumValues.forEach(thematic => {
          expect(allThematics).toContain(thematic);
        });
      });

      it('devrait retourner un tableau non vide', () => {
        const allThematics = ThematicUtils.getAll();
        expect(Array.isArray(allThematics)).toBe(true);
        expect(allThematics.length).toBeGreaterThan(0);
      });

      it('devrait retourner une nouvelle instance de tableau à chaque appel', () => {
        const firstCall = ThematicUtils.getAll();
        const secondCall = ThematicUtils.getAll();

        expect(firstCall).toEqual(secondCall);
        expect(firstCall).not.toBe(secondCall); // Différentes références
      });
    });

    describe('getAllWithLabels method', () => {
      it('devrait retourner toutes les thématiques avec leurs labels et descriptions', () => {
        const allWithLabels = ThematicUtils.getAllWithLabels();
        const enumValues = Object.values(Thematic);

        expect(allWithLabels).toHaveLength(enumValues.length);

        allWithLabels.forEach(item => {
          expect(item).toHaveProperty('value');
          expect(item).toHaveProperty('label');
          expect(item).toHaveProperty('description');

          expect(Object.values(Thematic)).toContain(item.value);
          expect(typeof item.label).toBe('string');
          expect(typeof item.description).toBe('string');
          expect(item.label.length).toBeGreaterThan(0);
          expect(item.description.length).toBeGreaterThan(0);
        });
      });

      it('devrait avoir la cohérence entre value, label et description', () => {
        const allWithLabels = ThematicUtils.getAllWithLabels();

        allWithLabels.forEach(item => {
          expect(item.label).toBe(ThematicUtils.getLabel(item.value));
          expect(item.description).toBe(ThematicUtils.getDescription(item.value));
          expect(item.label).toBe(ThematicLabels[item.value]);
          expect(item.description).toBe(ThematicDescriptions[item.value]);
        });
      });

      it('devrait contenir des éléments spécifiques attendus', () => {
        const allWithLabels = ThematicUtils.getAllWithLabels();

        const financialEducationItem = allWithLabels.find(
          item => item.value === Thematic.FINANCIAL_EDUCATION
        );
        expect(financialEducationItem).toBeDefined();
        expect(financialEducationItem?.label).toBe('Éducation Financière');
        expect(financialEducationItem?.description).toBe(
          'Comprendre les bases de la finance personnelle'
        );

        const investmentItem = allWithLabels.find(item => item.value === Thematic.INVESTMENT);
        expect(investmentItem).toBeDefined();
        expect(investmentItem?.label).toBe('Investissement');
        expect(investmentItem?.description).toBe('Apprendre à investir intelligemment');
      });
    });
  });

  describe('Integration tests', () => {
    it('devrait maintenir la cohérence entre enum, labels et descriptions', () => {
      const allThematics = Object.values(Thematic);

      allThematics.forEach(thematic => {
        // Chaque thématique doit avoir un label et une description
        expect(ThematicLabels[thematic]).toBeDefined();
        expect(ThematicDescriptions[thematic]).toBeDefined();

        // Les utilitaires doivent retourner les mêmes valeurs
        expect(ThematicUtils.getLabel(thematic)).toBe(ThematicLabels[thematic]);
        expect(ThematicUtils.getDescription(thematic)).toBe(ThematicDescriptions[thematic]);

        // La validation doit fonctionner
        expect(ThematicUtils.isValid(thematic)).toBe(true);
      });
    });

    it('devrait fonctionner dans un workflow complet', () => {
      // Récupérer toutes les thématiques
      const allThematics = ThematicUtils.getAll();
      expect(allThematics.length).toBeGreaterThan(0);

      // Prendre la première thématique
      const firstThematic = allThematics[0];

      // Valider qu'elle est valide
      expect(ThematicUtils.isValid(firstThematic)).toBe(true);

      // Récupérer ses métadonnées
      const label = ThematicUtils.getLabel(firstThematic);
      const description = ThematicUtils.getDescription(firstThematic);

      expect(typeof label).toBe('string');
      expect(typeof description).toBe('string');
      expect(label.length).toBeGreaterThan(0);
      expect(description.length).toBeGreaterThan(0);

      // Vérifier dans getAllWithLabels
      const allWithLabels = ThematicUtils.getAllWithLabels();
      const foundItem = allWithLabels.find(item => item.value === firstThematic);

      expect(foundItem).toBeDefined();
      expect(foundItem?.label).toBe(label);
      expect(foundItem?.description).toBe(description);
    });
  });
});
