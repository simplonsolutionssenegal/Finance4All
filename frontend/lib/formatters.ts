export const formatCurrency = (amount?: number | string): string => {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  return `${new Intl.NumberFormat('fr-FR').format(num)} FCFA`;
};

export const formatPercentage = (rate?: number | string): string => {
  const num = typeof rate === 'number' ? rate : Number(rate) || 0;
  return `${Number.isInteger(num) ? num : num.toFixed(2)}%`;
};

export default {
  formatCurrency,
  formatPercentage,
};
