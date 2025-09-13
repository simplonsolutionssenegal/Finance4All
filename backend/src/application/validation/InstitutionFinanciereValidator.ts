import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import { ContactPerson } from '@/domain/entities/ContactPerson';
import { isValidUrl } from '@/utils/isValidUrl';
import { isValidEmail } from '@/utils/isValidEmail';

export type InstitutionFinanciereInput = Omit<InstitutionFinanciere, 'id' | 'createdAt' | 'updatedAt'>;

export class InstitutionFinanciereValidator {
  validate(input: InstitutionFinanciereInput): InstitutionFinanciereInput {
    this.validateNom(input.nom);
    this.validateType(input.type);
    this.validateDescription(input.description);
    this.validateSiteWeb(input.siteWeb);
    this.validateRegions(input.regionsDesservies);
    const contact = this.validateContact(input.contact || null);
    this.validateLogo(input.logo || null);

    return {
      nom: input.nom.trim(),
      type: input.type.trim(),
      description: input.description.trim(),
      siteWeb: input.siteWeb.trim(),
      logo: input.logo ?? null,
      contact,
      regionsDesservies: input.regionsDesservies.map(r => r.trim()),
    };
  }

  private validateNom(nom: string | undefined) {
    if (!nom || nom.length < 2 || nom.length > 100) {
      throw new Error("Le nom de l'institution doit contenir entre 2 et 100 caractères");
    }
  }

  private validateType(type: string | undefined) {
    if (!type || type.length > 50) {
      throw new Error("Le type d'institution est requis et doit faire moins de 50 caractères");
    }
  }

  private validateDescription(description: string | undefined) {
    if (!description || description.length < 10 || description.length > 1000) {
      throw new Error('La description doit contenir entre 10 et 1000 caractères');
    }
  }

  private validateSiteWeb(siteWeb: string | undefined) {
    if (!isValidUrl(siteWeb || '')) {
      throw new Error('Une URL valide est requise pour le site web');
    }
  }

  private validateRegions(regions: string[] | undefined) {
    if (!Array.isArray(regions) || regions.length < 1 || regions.length > 20) {
      throw new Error('Entre 1 et 20 régions desservies doivent être spécifiées');
    }
    for (const region of regions) {
      if (!region || region.length > 100) {
        throw new Error('Chaque région desservie doit faire moins de 100 caractères');
      }
    }
  }

  private validateContact(contact: ContactPerson | null): ContactPerson | null {
    if (!contact) return null;
    const { email, telephone, nom } = contact;
    if (email && !isValidEmail(email)) {
      throw new Error("L'adresse email du contact n'est pas valide");
    }
    if (telephone && (telephone.length < 8 || telephone.length > 20)) {
      throw new Error('Le numéro de téléphone doit contenir entre 8 et 20 caractères');
    }
    if (nom && nom.length > 100) {
      throw new Error('Le nom du contact doit faire moins de 100 caractères');
    }
    if (!nom && !email && !telephone) {
      return null; // entirely empty optional contact
    }
    return {
      nom: nom?.trim() || '',
      email: email?.trim() || null,
      telephone: telephone?.trim() || null,
    };
  }

  private validateLogo(logo: string | null) {
    if (logo && logo.length > 500) {
      throw new Error("L'URL du logo doit faire moins de 500 caractères");
    }
  }
}
