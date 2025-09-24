import type { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import type { InstitutionFinancierePersistence } from '@/infrastructure/database/models/InstitutionFinancierePersistence';
import type { ContactPerson } from '@/domain/entities/ContactPerson';

export function toDomainInstitution(record: InstitutionFinancierePersistence): InstitutionFinanciere {
  const contact: ContactPerson | null = record.contactNom
    ? {
        nom: record.contactNom,
        email: record.contactEmail,
        telephone: record.contactTelephone,
      }
    : null;

  return {
    id: record.id,
    nom: record.nom,
    type: record.type,
    description: record.description,
    siteWeb: record.siteWeb,
    logo: record.logo,
    contact,
    regionsDesservies: record.regionsDesservies,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
