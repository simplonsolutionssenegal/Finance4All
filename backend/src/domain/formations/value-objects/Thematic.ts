//domain/formations/value-objects/Thematic.ts

export enum Thematic {
  FINANCIAL_EDUCATION = 'FINANCIAL_EDUCATION',
  PERSONAL_DEVELOPMENT = 'PERSONAL_DEVELOPMENT',
  FINANCIAL_LOAN = 'FINANCIAL_LOAN',
  BANK_CREDIT = 'BANK_CREDIT',
  INVESTMENT = 'INVESTMENT',
  BUDGET_MANAGEMENT = 'BUDGET_MANAGEMENT',
  SAVING = 'SAVING',
  ENTREPRENEURSHIP = 'ENTREPRENEURSHIP',
  TAXATION = 'TAXATION',
  INSURANCE = 'INSURANCE',
}

export const ThematicLabels: Record<Thematic, string> = {
  [Thematic.FINANCIAL_EDUCATION]: 'Éducation Financière',
  [Thematic.PERSONAL_DEVELOPMENT]: 'Développement Personnel',
  [Thematic.FINANCIAL_LOAN]: 'Prêt Financier',
  [Thematic.BANK_CREDIT]: 'Crédit Bancaire',
  [Thematic.INVESTMENT]: 'Investissement',
  [Thematic.BUDGET_MANAGEMENT]: 'Gestion de Budget',
  [Thematic.SAVING]: 'Épargne',
  [Thematic.ENTREPRENEURSHIP]: 'Entrepreneuriat',
  [Thematic.TAXATION]: 'Fiscalité',
  [Thematic.INSURANCE]: 'Assurance',
};

export const ThematicDescriptions: Record<Thematic, string> = {
  [Thematic.FINANCIAL_EDUCATION]: 'Comprendre les bases de la finance personnelle',
  [Thematic.PERSONAL_DEVELOPMENT]: 'Développer ses compétences et son potentiel',
  [Thematic.FINANCIAL_LOAN]: 'Maîtriser les mécanismes du prêt financier',
  [Thematic.BANK_CREDIT]: 'Comprendre et gérer le crédit bancaire',
  [Thematic.INVESTMENT]: 'Apprendre à investir intelligemment',
  [Thematic.BUDGET_MANAGEMENT]: 'Gérer efficacement son budget',
  [Thematic.SAVING]: "Stratégies d'épargne et de constitution de patrimoine",
  [Thematic.ENTREPRENEURSHIP]: 'Créer et développer son entreprise',
  [Thematic.TAXATION]: 'Comprendre le système fiscal',
  [Thematic.INSURANCE]: 'Protéger ses biens et sa famille',
};

/**
 * Classe utilitaire pour travailler avec les thématiques
 */
export class ThematicUtils {
  /**
   * Obtenir le label d'une thématique
   */
  static getLabel(thematic: Thematic): string {
    return ThematicLabels[thematic];
  }

  /**
   * Obtenir la description d'une thématique
   */
  static getDescription(thematic: Thematic): string {
    return ThematicDescriptions[thematic];
  }

  /**
   * Valider si une valeur est une thématique valide
   */
  static isValid(value: string): value is Thematic {
    return Object.values(Thematic).includes(value as Thematic);
  }

  /**
   * Obtenir toutes les thématiques disponibles
   */
  static getAll(): Thematic[] {
    return Object.values(Thematic);
  }

  /**
   * Obtenir toutes les thématiques avec leurs labels
   */
  static getAllWithLabels(): Array<{ value: Thematic; label: string; description: string }> {
    return this.getAll().map(thematic => ({
      value: thematic,
      label: this.getLabel(thematic),
      description: this.getDescription(thematic),
    }));
  }
}
