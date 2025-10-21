const coerceToFiniteNumber = (value?: number | string): number => {
  if (value === null || value === undefined) return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const formatCurrency = (amount?: number | string): string => {
  const num = coerceToFiniteNumber(amount);
  return `${new Intl.NumberFormat('fr-FR').format(num)} FCFA`;
};

export const formatPercentage = (rate?: number | string): string => {
  const num = coerceToFiniteNumber(rate);
  return `${Number.isInteger(num) ? num : num.toFixed(2)}%`;
};

const defaultFormatters = {
  formatCurrency,
  formatPercentage,
};

export default defaultFormatters;
