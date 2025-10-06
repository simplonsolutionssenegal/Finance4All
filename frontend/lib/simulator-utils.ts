import { INSTITUTION_NAMES, PRODUCT_TYPES, INSTITUTION_LOGOS } from './simulator-constants';
import type { Institution, SimulationParams, Estimation } from './simulator-types';

/**
 * Générateur de nombres aléatoires sécurisé pour la simulation
 * Utilise une graine basée sur l'index pour assurer la reproductibilité
 */
const createSeededRandom = (seed: number) => {
  let current = seed;
  return () => {
    current = (current * 9301 + 49297) % 233280;
    return current / 233280;
  };
};

/**
 * Génère dynamiquement des institutions
 * @returns Tableau d'institutions générées
 */
export const generateInstitutions = (): Institution[] => {
  return INSTITUTION_NAMES.map((name, index) => {
    const random = createSeededRandom(index + 1);
    const numProducts = Math.floor(random() * 4) + 2; // 2-5 produits par institution

    // Mélange déterministe basé sur l'index
    const shuffledProducts = [...PRODUCT_TYPES].sort((a, b) => {
      const hashA = (a.name.charCodeAt(0) + index) % 1000;
      const hashB = (b.name.charCodeAt(0) + index) % 1000;
      return hashA - hashB;
    });

    const selectedProducts = shuffledProducts.slice(0, numProducts).map(product => {
      const rateVariation = (random() - 0.5) * 0.5;
      return {
        id: `${name.toLowerCase().replace(/\s+/g, '-')}-${product.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: product.name,
        description: `Produit ${product.name.toLowerCase()} de ${name}`,
        icon: product.icon,
        type: product.type,
        rates: {
          min: product.rates.min + rateVariation,
          max: product.rates.max + rateVariation,
        },
        limits: product.limits,
      };
    });

    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      logo: INSTITUTION_LOGOS[index % INSTITUTION_LOGOS.length],
      products: selectedProducts,
    };
  });
};

/**
 * Calcule l'estimation financière basée sur les paramètres de simulation
 * @param params - Paramètres de simulation
 * @returns Estimation financière
 */
export const calculateEstimation = (params: SimulationParams): Estimation => {
  if (!params.product) return { annualRate: 0 };

  const { amount, duration, product } = params;
  const rate = (product.rates.min + product.rates.max) / 2;

  switch (product.type) {
    case 'CREDIT': {
      const monthlyRate = rate / 100 / 12;
      const monthlyPayment =
        (amount * (monthlyRate * Math.pow(1 + monthlyRate, duration * 12))) /
        (Math.pow(1 + monthlyRate, duration * 12) - 1);
      const totalCost = monthlyPayment * duration * 12;
      const totalInterest = totalCost - amount;

      return {
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: Math.round(totalInterest),
        totalCost: Math.round(totalCost),
        annualRate: rate,
      };
    }
    case 'INVESTISSEMENT': {
      const finalAmount = amount * Math.pow(1 + rate / 100, duration);
      const totalGain = finalAmount - amount;

      return {
        finalAmount: Math.round(finalAmount),
        totalInterest: Math.round(totalGain),
        annualRate: rate,
      };
    }
    case 'EPARGNE': {
      const finalAmount = amount * Math.pow(1 + rate / 100, duration);
      const totalGain = finalAmount - amount;

      return {
        finalAmount: Math.round(finalAmount),
        totalInterest: Math.round(totalGain),
        annualRate: rate,
      };
    }
    case 'ASSURANCE': {
      // Pour l'assurance, on calcule généralement une prime annuelle
      const annualPremium = amount * (rate / 100);
      const totalPremium = annualPremium * duration;

      return {
        monthlyPayment: Math.round(annualPremium / 12),
        totalInterest: Math.round(totalPremium),
        annualRate: rate,
      };
    }
    default:
      return { annualRate: 0 };
  }
};

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
 * Formate une durée en années
 * @param value - Valeur en années
 * @returns Durée formatée
 */
export const formatDuration = (value: number): string => {
  return `${value} an${value > 1 ? 's' : ''}`;
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
