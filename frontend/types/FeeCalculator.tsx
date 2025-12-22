import { formatCurrency } from '@/lib/format-utils';
import type { ServiceDTO } from '@/types/Service';

interface FraisWithTypeCalc {
  _typeCalculation?: number;
  typeCalculation?: number;
  pourcentage?: number;
  minimum?: number;
  maximum?: number;
  montantFixe?: number;
  fraisChange?: {
    fxSurcharge: number;
    devise: string;
  };
}

const DEFAULT_FEE = { label: 'Non défini', value: 0 };
const FREE_FEE = { label: 'Gratuit !', value: 0 };

const getTypeCalculation = (frais: FraisWithTypeCalc): number | undefined =>
  frais._typeCalculation ?? frais.typeCalculation;

const computePercentageFee = (
  frais: FraisWithTypeCalc,
  montant: number
): { label: string; value: number } => {
  const pourcentage = frais.pourcentage ?? 0;

  let fee = montant * pourcentage;

  const min = typeof frais.minimum === 'number' ? frais.minimum : undefined;
  const max = typeof frais.maximum === 'number' ? frais.maximum : undefined;

  if (montant > 0) {
    if (min !== undefined) {
      fee = Math.max(fee, min);
    }
    if (max !== undefined) {
      fee = Math.min(fee, max);
    }
  } else {
    fee = 0;
  }

  const intervalParts: string[] = [];
  if (min !== undefined) {
    intervalParts.push(`min ${formatCurrency(min)}`);
  }
  if (max !== undefined) {
    intervalParts.push(`max ${formatCurrency(max)}`);
  }

  const intervalText = intervalParts.length > 0 ? ` (${intervalParts.join(' · ')})` : '';

  return {
    label: `${pourcentage * 100}% du montant${intervalText}`,
    value: fee,
  };
};

const computeFixedFee = (
  frais: FraisWithTypeCalc,
  montant: number
): { label: string; value: number } => {
  if (frais.fraisChange) {
    const { fxSurcharge, devise } = frais.fraisChange;
    return {
      label: `Frais de change (${devise})`,
      value: fxSurcharge,
    };
  }

  const montantFixe = frais.montantFixe ?? 0;
  const pourcentage = frais.pourcentage ?? 0;

  if (montantFixe === 0 && pourcentage === 0) {
    return FREE_FEE;
  }

  const fee = montantFixe + montant * pourcentage;

  const label =
    pourcentage > 0 ? `${formatCurrency(montantFixe)} + ${pourcentage * 100}%` : 'Frais fixe';

  return {
    label,
    value: fee,
  };
};

export const computeFee = (
  service: ServiceDTO,
  montant: number
): { label: string; value: number } => {
  const frais = service.frais as FraisWithTypeCalc | undefined;

  if (!frais) {
    return DEFAULT_FEE;
  }

  const typeCalc = getTypeCalculation(frais);

  switch (typeCalc) {
    case 0:
      return FREE_FEE;
    case 1:
      return computePercentageFee(frais, montant);
    case 2:
      return computeFixedFee(frais, montant);
    default:
      return DEFAULT_FEE;
  }
};
