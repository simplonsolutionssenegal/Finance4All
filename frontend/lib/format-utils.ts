/**
 * Utilitaires de formatage pour l'application
 */

/**
 * Formate un montant en Franc CFA
 * @param amount - Montant à formater
 * @returns Montant formaté
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
  }).format(amount);
};

/**
 * Formate une durée selon l'unité
 * @param value - Valeur de la durée
 * @param unit - Unité (YEARS ou MONTHS)
 * @returns Durée formatée
 */
export const formatDuration = (value: number, unit: 'YEARS' | 'MONTHS' = 'YEARS'): string => {
  if (unit === 'MONTHS') {
    return `${value} mois`;
  }
  return `${value} an${value > 1 ? 's' : ''}`;
};

/**
 * Convertit une durée en mois
 * @param value - Valeur de la durée
 * @param unit - Unité (YEARS ou MONTHS)
 * @returns Durée en mois
 */
export const convertToMonths = (value: number, unit: 'YEARS' | 'MONTHS'): number => {
  return unit === 'YEARS' ? value * 12 : value;
};

/**
 * Convertit une durée en années
 * @param value - Valeur de la durée
 * @param unit - Unité (YEARS ou MONTHS)
 * @returns Durée en années
 */
export const convertToYears = (value: number, unit: 'YEARS' | 'MONTHS'): number => {
  return unit === 'MONTHS' ? value / 12 : value;
};

/**
 * Valide et ajuste une valeur dans les limites données
 * @param value - Valeur à valider
 * @param min - Valeur minimale
 * @param max - Valeur maximale
 * @returns Valeur validée
 */
export const validateValue = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Calcule le pas approprié pour un slider
 * @param min - Valeur minimale
 * @returns Pas approprié
 */
export const calculateStep = (min: number): number => {
  return min < 10000 ? 100 : 1000;
};
