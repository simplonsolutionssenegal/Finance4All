import type { Service } from '@/types/Service';

import type { SimulationParams, Estimation } from './simulator-types';

/**
 * Calcule les frais réels d'un service
 * @param amount - Montant de la transaction
 * @param service - Service avec ses frais
 * @returns Objet contenant les frais calculés et la description
 */
const calculateServiceFees = (
  amount: number,
  service: Service
): { totalFees: number; description: string } => {
  if (!service.frais) {
    return { totalFees: 0, description: 'Gratuit' };
  }

  const frais = service.frais;
  let totalFees = 0;
  let description = '';

  // Déterminer le type de frais
  const typeCalculation = frais._typeCalculation;
  const isFree = typeCalculation === 0 || frais.type === 'FREE';
  const isPercentage = typeCalculation === 1 || frais.type === 'POURCENTAGE';
  const isFix = typeCalculation === 2 || frais.type === 'FIX';

  if (isFree) {
    return { totalFees: 0, description: 'Gratuit' };
  }

  if (isFix) {
    // Frais fixes : montant fixe + optionnel pourcentage + frais de change
    const amountValue = frais._amount || frais.amount || 0;
    const rateValue = frais._rate || frais.rate || 0;
    const fxSurchargeValue = frais._fxSurcharge || frais.fxSurcharge || 0;

    totalFees = amountValue;

    if (rateValue) {
      const percentageFees = amount * rateValue;
      totalFees += percentageFees;
    }

    if (fxSurchargeValue) {
      totalFees += fxSurchargeValue;
    }

    // Construire la description
    description = `${amountValue} F CFA`;
    if (rateValue) {
      description += ` + ${(rateValue * 100).toFixed(2).replace(/\.00$/, '')}%`;
    }
    if (fxSurchargeValue) {
      description += ` + Frais de change`;
    }
  }

  if (isPercentage) {
    // Frais en pourcentage avec plafond min/max
    const rateValue = frais._rate || frais.rate || 0;
    const capValue = frais._cap || frais.cap;
    const floorValue = frais._floor || frais.floor;

    totalFees = amount * rateValue;

    // Appliquer le plafond minimum
    if (floorValue && totalFees < floorValue) {
      totalFees = floorValue;
    }

    // Appliquer le plafond maximum
    if (capValue && totalFees > capValue) {
      totalFees = capValue;
    }

    // Construire la description
    description = `${(rateValue * 100).toFixed(2).replace(/\.00$/, '')}%`;

    if (capValue !== undefined && floorValue !== undefined) {
      description += ` (frais min ${floorValue} et frais max ${capValue})`;
    } else if (capValue !== undefined) {
      description += ` (plafonné à ${capValue})`;
    } else if (floorValue !== undefined) {
      description += ` (frais minimum ${floorValue})`;
    }
  }

  return { totalFees: Math.round(totalFees), description };
};

/**
 * Calcule l'estimation financière basée sur les paramètres de simulation
 * @param params - Paramètres de simulation
 * @returns Estimation financière
 */
export const calculateEstimation = (params: SimulationParams): Estimation => {
  if (!params.service) {
    return {
      serviceType: 'Aucun service sélectionné',
      feeDescription: 'Aucun frais',
    };
  }

  const { amount, service } = params;

  // Calculer les frais réels du service
  const { totalFees, description } = calculateServiceFees(amount, service);

  // Déterminer le type de calcul selon le type de service
  const serviceTypeLower = service.type.toLowerCase();

  if (
    serviceTypeLower.includes('paiement') ||
    serviceTypeLower.includes('transfert') ||
    serviceTypeLower.includes('dépôt') ||
    serviceTypeLower.includes('retrait') ||
    serviceTypeLower.includes('wallet') ||
    serviceTypeLower.includes('achat')
  ) {
    return {
      totalFees,
      netAmount: amount + totalFees, // Les frais s'ajoutent au montant
      serviceType: service.type,
      feeDescription: description,
    };
  }

  // Services d'épargne (ajout des frais sans calcul sur la durée)
  if (serviceTypeLower.includes('épargne') || serviceTypeLower.includes('epargne')) {
    // Ajouter simplement les frais à l'épargne
    const finalAmount = amount + totalFees;
    const totalGain = totalFees; // Le gain correspond aux frais ajoutés

    return {
      finalAmount: Math.round(finalAmount),
      totalGain: Math.round(totalGain),
      annualRate: 0, // Pas de calcul de taux annuel
      serviceType: service.type,
      feeDescription: description,
    };
  }

  // Services de crédit (ajout des frais sans calcul sur la durée)
  if (serviceTypeLower.includes('crédit') || serviceTypeLower.includes('credit')) {
    // Ajouter simplement les frais au montant
    const totalCost = amount + totalFees;
    const totalInterest = totalFees; // Les intérêts correspondent aux frais ajoutés
    const monthlyPayment = totalCost / 12; // Répartition sur 12 mois par défaut

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalCost),
      serviceType: service.type,
      feeDescription: description,
    };
  }

  // Services d'assurance
  if (serviceTypeLower.includes('assurance')) {
    // Utiliser le taux des frais du service seulement s'il est défini
    const isPercentage =
      service.frais?._typeCalculation === 1 || service.frais?.type === 'POURCENTAGE';
    const rateValue = service.frais?._rate || service.frais?.rate;
    const annualRate = isPercentage && rateValue ? rateValue * 100 : 0; // Convertir en pourcentage pour l'affichage
    const annualPremium = annualRate > 0 ? amount * (rateValue || 0) + totalFees : totalFees; // Utiliser le taux décimal directement

    return {
      annualPremium: Math.round(annualPremium),
      totalPremium: Math.round(annualPremium),
      serviceType: service.type,
      feeDescription: description,
    };
  }

  // Services divers/autres
  return {
    totalFees,
    netAmount: amount + totalFees,
    serviceType: service.type,
    feeDescription: description,
  };
};
