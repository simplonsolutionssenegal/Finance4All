import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import { InstitutionFinanciereRepository } from '@/domain/repositories/InstitutionFinanciereRepository';
import { isValidUrl } from '@/utils/isValidUrl';
import { isValidEmail } from '@/utils/isValidEmail';

export class CreateInstitutionFinanciereUseCase {
  constructor(private readonly institutionFinanciereRepository: InstitutionFinanciereRepository) {}

  async execute(data: Omit<InstitutionFinanciere, 'id' | 'createdAt' | 'updatedAt'>): Promise<InstitutionFinanciere> {
    // 1. Nom
    if (!data.nom || data.nom.length < 2 || data.nom.length > 100) {
      throw new Error('Le nom de l\'institution doit contenir entre 2 et 100 caractères');
    }
    // 2. Type
    if (!data.type || data.type.length > 50) {
      throw new Error('Le type d\'institution est requis et doit faire moins de 50 caractères');
    }
    // 3. Description
    if (!data.description || data.description.length < 10 || data.description.length > 1000) {
      throw new Error('La description doit contenir entre 10 et 1000 caractères');
    }
    // 4. URL site web
  if (!isValidUrl(data.siteWeb)) {
      throw new Error('Une URL valide est requise pour le site web');
    }
    // 5. Régions desservies
    if (!Array.isArray(data.regionsDesservies) || data.regionsDesservies.length < 1 || data.regionsDesservies.length > 20) {
      throw new Error('Entre 1 et 20 régions desservies doivent être spécifiées');
    }
    for (const region of data.regionsDesservies) {
      if (!region || region.length > 100) {
        throw new Error('Chaque région desservie doit faire moins de 100 caractères');
      }
    }
    // 6. Email contact (optionnel)
  if (data.contactEmail && !isValidEmail(data.contactEmail)) {
      throw new Error('L\'adresse email du contact n\'est pas valide');
    }
    // 7. Téléphone contact (optionnel)
    if (data.contactTelephone && (data.contactTelephone.length < 8 || data.contactTelephone.length > 20)) {
      throw new Error('Le numéro de téléphone doit contenir entre 8 et 20 caractères');
    }
    // 8. Nom contact (optionnel)
    if (data.contactNom && data.contactNom.length > 100) {
      throw new Error('Le nom du contact doit faire moins de 100 caractères');
    }
    // 9. Logo URL length (optionnel)
    if (data.logo && data.logo.length > 500) {
      throw new Error('L\'URL du logo doit faire moins de 500 caractères');
    }

    // Normalisation simple
    const institution: InstitutionFinanciere = {
      id: '',
      nom: data.nom.trim(),
      type: data.type.trim(),
      description: data.description.trim(),
      siteWeb: data.siteWeb.trim(),
      logo: data.logo ?? null,
      contactNom: data.contactNom ?? null,
      contactEmail: data.contactEmail ?? null,
      contactTelephone: data.contactTelephone ?? null,
      regionsDesservies: data.regionsDesservies.map(r => r.trim()),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.institutionFinanciereRepository.create(institution);
  }

}

