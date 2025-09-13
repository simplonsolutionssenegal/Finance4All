// Persistence-layer representation matching Prisma schema (no domain concerns)
export interface InstitutionFinancierePersistence {
  id: string;
  nom: string;
  type: string;
  description: string;
  siteWeb: string;
  logo: string | null;
  contactNom: string | null;
  contactEmail: string | null;
  contactTelephone: string | null;
  regionsDesservies: string[];
  createdAt: Date;
  updatedAt: Date;
}
