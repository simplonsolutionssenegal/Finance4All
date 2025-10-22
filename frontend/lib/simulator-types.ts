// Types pour le simulateur de produits financiers

import type { Institution } from '@/types/Institution';
import type { Service } from '@/types/Service';

// Réexporter les types backend
export type { Institution } from '@/types/Institution';
export type { Service } from '@/types/Service';

export interface SimulationParams {
  institution: Institution | null;
  service: Service | null;
  amount: number;
  selectedPlafondIndex: number;
}

export interface Estimation {
  // Pour les services de paiement/transfert
  totalFees?: number;
  netAmount?: number;

  // Pour les services d'épargne
  finalAmount?: number;
  totalGain?: number;
  annualRate?: number;

  // Pour les services de crédit
  monthlyPayment?: number;
  totalInterest?: number;
  totalCost?: number;

  // Pour l'assurance
  annualPremium?: number;
  totalPremium?: number;

  // Informations générales
  serviceType: string;
  feeDescription: string;
}
