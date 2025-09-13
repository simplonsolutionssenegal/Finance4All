import { ContactPerson } from '@/domain/entities/ContactPerson';

// Input boundary (application layer) for creating an Institution (no id or timestamps)
export interface CreateInstitutionFinanciereDTO {
  nom: string;
  type: string;
  description: string;
  siteWeb: string;
  logo?: string | null;
  contact?: ContactPerson | null;
  regionsDesservies: string[];
}
