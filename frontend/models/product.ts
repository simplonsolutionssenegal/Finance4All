import type { RemboursementMode } from '@/types/RemboursementMode';
import type { ProductType } from '@/types/ProductType';

export interface Product {
  id: string;
  designation: string;
  montantMin: number;
  montantMax: number;
  type: ProductType;
  modesRemboursement: RemboursementMode;
  institutionId: string;
  zoneId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
