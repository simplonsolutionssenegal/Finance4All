// domain/institutions/value-objects/ComparedServiceDTO.ts
import type { ServiceDTO } from '@/domain/institutions/value-objects/ServiceDTO';
import type { CountryType } from './Country';

export interface ComparedServiceDTO extends ServiceDTO {
  institution: {
    id: string;
    name: string;
    logoUrl: string | null;
    pays: CountryType;
  };
}
