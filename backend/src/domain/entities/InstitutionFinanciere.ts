import { ContactPerson } from './ContactPerson';

export interface InstitutionFinanciere {
  id?: string;
  nom: string;
  type: string;
  description: string;
  siteWeb: string;
  logo?: string | null;
  contact?: ContactPerson | null; // Normalized contact info
  regionsDesservies: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
