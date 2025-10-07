// src/domain/entities/InstitutionService.ts
import type { ProductType } from '@/domain/entities/types/ProductType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';

export class Product {
  constructor(
    public id: string,
    public designation: string,
    public montantMin: number,
    public montantMax: number,
    public type: ProductType,
    public modesRemboursement: RemboursementMode,
    public institutionId: string,
    public zone: string, // ← scalaire côté domaine/API
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
