import type { RemboursementMode } from '@/types/RemboursementMode';
import type { ServiceType } from '@/types/ServiceType';

export interface Service {
  id: number;
  designation: string;
  montantMin: number;
  montantMax: number;
  type: ServiceType;
  modesRemboursement: RemboursementMode;
  institutionId: number;
  zoneId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
