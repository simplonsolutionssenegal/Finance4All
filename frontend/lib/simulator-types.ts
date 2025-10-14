// Types pour le simulateur de produits financiers

import type { Institution } from '@/types/Institution';
import type { Service } from '@/types/Service';

export type DurationUnit = 'YEARS' | 'MONTHS';

// Réexporter les types backend
export type { Institution } from '@/types/Institution';
export type { Service } from '@/types/Service';

export interface SimulationParams {
  institution: Institution | null;
  service: Service | null;
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
