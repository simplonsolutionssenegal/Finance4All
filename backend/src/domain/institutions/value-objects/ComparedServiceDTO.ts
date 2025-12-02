// domain/institutions/value-objects/ComparedServiceDTO.ts
import type { ServiceDTO } from '@/domain/institutions/value-objects/ServiceDTO';

export interface ComparedServiceDTO extends ServiceDTO {
  institution: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
}
