// Types pour le simulateur de produits financiers

import type { Institution, InstitutionProduct } from '@/types/Institution';

export type DurationUnit = 'YEARS' | 'MONTHS';

export interface SimulationParams {
  institution: Institution | null;
  product: InstitutionProduct | null;
  amount: number;
  duration: number;
  durationUnit: DurationUnit;
}

export interface Estimation {
  monthlyPayment?: number;
  totalInterest?: number;
  finalAmount?: number;
  annualRate: number;
  totalCost?: number;
}

export interface ProductType {
  name: string;
  icon: string;
  type: 'CREDIT' | 'EPARGNE' | 'INVESTISSEMENT' | 'ASSURANCE';
  rates: {
    min: number;
    max: number;
  };
  limits: {
    amount: { min: number; max: number };
    duration: { min: number; max: number };
  };
}

// Réexport des types backend pour la compatibilité
export type { Institution, InstitutionProduct } from '@/types/Institution';
