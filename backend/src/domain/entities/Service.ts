import type { ServiceType } from '@/domain/entities/types/ServiceType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';

export class Service {
  constructor(
    public id: number,
    public designation: string,
    public montantMin: number,
    public montantMax: number,
    public type: ServiceType,
    public modesRemboursement: RemboursementMode,
    public institutionId: number,
    public zoneId: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
