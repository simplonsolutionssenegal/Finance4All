import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';

// Shape exposed by the API (can evolve independently)
export interface InstitutionFinanciereResponse {
  id: string;
  nom: string;
  type: string;
  description: string;
  siteWeb: string;
  logo: string | null;
  contact: {
    nom: string;
    email: string | null;
    telephone: string | null;
  } | null;
  regionsDesservies: string[];
  createdAt: string; // ISO string for transport
  updatedAt: string; // ISO string for transport
}

export class InstitutionFinancierePresenter {
  static toResponse(domain: InstitutionFinanciere): InstitutionFinanciereResponse {
    return {
      id: domain.id,
      nom: domain.nom,
      type: domain.type,
      description: domain.description,
      siteWeb: domain.siteWeb,
      logo: domain.logo ?? null,
      contact: domain.contact
        ? {
            nom: domain.contact.nom,
            email: domain.contact.email ?? null,
            telephone: domain.contact.telephone ?? null,
          }
        : null,
      regionsDesservies: domain.regionsDesservies,
      createdAt: domain.createdAt.toISOString(),
      updatedAt: domain.updatedAt.toISOString(),
    };
  }
}
