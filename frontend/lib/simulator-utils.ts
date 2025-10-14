import { convertToMonths, convertToYears } from './format-utils';
import type { SimulationParams, Estimation } from './simulator-types';

/**
 * Calcule les frais réels d'un service
 * @param amount - Montant de la transaction
 * @param frais - Objet frais du service
 * @returns Montant des frais calculés
 */
const calculateServiceFees = (
  amount: number,
  frais?: { montantFixe?: number; pourcentage?: number; minimum?: number; maximum?: number }
): number => {
  if (!frais) return 0;

  let fees = 0;

  // Calculer les frais en fonction du type
  if (frais.pourcentage) {
    fees = (amount * frais.pourcentage) / 100;
  }

  if (frais.montantFixe) {
    fees += frais.montantFixe;
  }

  // Appliquer le minimum
  if (frais.minimum && fees < frais.minimum) {
    fees = frais.minimum;
  }

  // Appliquer le maximum
  if (frais.maximum && fees > frais.maximum) {
    fees = frais.maximum;
  }

  return fees;
};

/**
 * Calcule l'estimation financière basée sur les paramètres de simulation
 * @param params - Paramètres de simulation
 * @returns Estimation financière
 */
export const calculateEstimation = (params: SimulationParams): Estimation => {
  if (!params.service) return { annualRate: 0 };

  const { amount, duration, durationUnit, service } = params;
  const durationInMonths = convertToMonths(duration, durationUnit);
  const durationInYears = convertToYears(duration, durationUnit);

  // Calculer les frais réels du service
  const serviceFees = calculateServiceFees(amount, service.frais);

  // Calculer le taux depuis les frais (pourcentage si disponible, sinon taux par défaut)
  const rate = service.frais.pourcentage || 3;

  // Déterminer le type de calcul selon le type de service
  const serviceTypeLower = service.type.toLowerCase();

  if (serviceTypeLower.includes('crédit') || serviceTypeLower.includes('credit')) {
    const monthlyRate = rate / 100 / 12;
    let monthlyPayment =
      (amount * (monthlyRate * Math.pow(1 + monthlyRate, durationInMonths))) /
      (Math.pow(1 + monthlyRate, durationInMonths) - 1);

    // Ajouter les frais mensuels si applicables
    const monthlyFees = serviceFees / durationInMonths;
    monthlyPayment += monthlyFees;

    const totalCost = monthlyPayment * durationInMonths;
    const totalInterest = totalCost - amount;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalCost),
      annualRate: rate,
    };
  } else if (serviceTypeLower.includes('épargne') || serviceTypeLower.includes('epargne')) {
    // Pour l'épargne, on déduit les frais du montant final
    const finalAmount = amount * Math.pow(1 + rate / 100, durationInYears) - serviceFees;
    const totalGain = finalAmount - amount;

    return {
      finalAmount: Math.round(finalAmount),
      totalInterest: Math.round(totalGain),
      annualRate: rate,
    };
  } else if (serviceTypeLower.includes('assurance')) {
    // Pour l'assurance, on calcule généralement une prime annuelle
    const annualPremium = amount * (rate / 100) + serviceFees / durationInYears;
    const totalPremium = annualPremium * durationInYears;

    return {
      monthlyPayment: Math.round(annualPremium / 12),
      totalInterest: Math.round(totalPremium),
      annualRate: rate,
    };
  } else {
    // Par défaut, calcul type épargne
    const finalAmount = amount * Math.pow(1 + rate / 100, durationInYears) - serviceFees;
    const totalGain = finalAmount - amount;

    return {
      finalAmount: Math.round(finalAmount),
      totalInterest: Math.round(totalGain),
      annualRate: rate,
    };
  }
};
