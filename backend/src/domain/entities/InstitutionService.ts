// src/domain/entities/InstitutionService.ts
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';

export class InstitutionService {
  constructor(
    public id: string,
    public designation: string,
    public montantMin: number,
    public montantMax: number,
    public type: ServiceType,
    public modesRemboursement: RemboursementMode,
    public institutionId: string,
    public zone: string, // ← scalaire côté domaine/API
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
