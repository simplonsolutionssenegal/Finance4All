import { InstitutionFinanciere } from '../../domain/entities/InstitutionFinanciere';
import { InstitutionFinanciereRepository } from '../../domain/repositories/InstitutionFinanciereRepository';

export class CreateInstitutionFinanciereUseCase {
  constructor(private readonly institutionFinanciereRepository: InstitutionFinanciereRepository) {}

  async execute(institutionData: InstitutionFinanciere): Promise<InstitutionFinanciere> {
    // Validation des données
    this.validateInstitutionData(institutionData);

    // Création de l'institution
    return this.institutionFinanciereRepository.create(institutionData);
  }

  private validateInstitutionData(institutionData: InstitutionFinanciere): void {
    // Protection contre les attaques par déni de service : limiter les tailles
    if (!institutionData.nom || institutionData.nom.length < 2 || institutionData.nom.length > 100) {
      throw new Error('Le nom de l\'institution doit contenir entre 2 et 100 caractères');
    }

    if (!institutionData.type || institutionData.type.length > 50) {
      throw new Error('Le type d\'institution est requis et doit faire moins de 50 caractères');
    }

    if (!institutionData.description || institutionData.description.length < 10 || institutionData.description.length > 1000) {
      throw new Error('La description doit contenir entre 10 et 1000 caractères');
    }

    if (!institutionData.siteWeb || !this.isValidUrl(institutionData.siteWeb)) {
      throw new Error('Une URL valide est requise pour le site web');
    }

    if (!institutionData.regionsDesservies || institutionData.regionsDesservies.length < 1 || institutionData.regionsDesservies.length > 20) {
      throw new Error('Entre 1 et 20 régions desservies doivent être spécifiées');
    }

    // Vérifier que chaque région n'est pas trop longue
    for (const region of institutionData.regionsDesservies) {
      if (!region || region.length > 100) {
        throw new Error('Chaque région desservie doit faire moins de 100 caractères');
      }
    }

    // Validation conditionnelle des champs de contact avec limites
    if (institutionData.contactEmail && !this.isValidEmail(institutionData.contactEmail)) {
      throw new Error('L\'adresse email du contact n\'est pas valide');
    }

    if (institutionData.contactTelephone && (institutionData.contactTelephone.length < 8 || institutionData.contactTelephone.length > 20)) {
      throw new Error('Le numéro de téléphone doit contenir entre 8 et 20 caractères');
    }

    if (institutionData.contactNom && institutionData.contactNom.length > 100) {
      throw new Error('Le nom du contact doit faire moins de 100 caractères');
    }

    if (institutionData.logo && institutionData.logo.length > 500) {
      throw new Error('L\'URL du logo doit faire moins de 500 caractères');
    }
  }

  private isValidUrl(url: string): boolean {
    // Protection contre les URLs malicieuses : limiter la longueur
    if (!url || url.length > 2048) {
      return false; // Limite raisonnable pour une URL
    }
    
    try {
      const parsedUrl = new URL(url);
      // Vérifier que le protocole est sûr
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      // Error is intentionally ignored as we just return false
      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    // Protection contre ReDoS : limiter la longueur et utiliser une regex plus sûre
    if (!email || email.length > 254) {
      return false; // RFC 5321 limite à 254 caractères
    }
    
    // Regex plus sûre sans quantificateurs imbriqués vulnérables au backtracking
    const emailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return emailRegex.test(email);
  }
}
