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
    if (!institutionData.nom || institutionData.nom.length < 2) {
      throw new Error('Le nom de l\'institution doit contenir au moins 2 caractères');
    }

    if (!institutionData.type) {
      throw new Error('Le type d\'institution est requis');
    }

    if (!institutionData.description || institutionData.description.length < 10) {
      throw new Error('La description doit contenir au moins 10 caractères');
    }

    if (!institutionData.siteWeb || !this.isValidUrl(institutionData.siteWeb)) {
      throw new Error('Une URL valide est requise pour le site web');
    }

    if (institutionData.regionsDesservies.length < 1) {
      throw new Error('Au moins une région desservie doit être spécifiée');
    }

    // Validation conditionnelle des champs de contact
    if (institutionData.contactEmail && !this.isValidEmail(institutionData.contactEmail)) {
      throw new Error('L\'adresse email du contact n\'est pas valide');
    }

    if (institutionData.contactTelephone && institutionData.contactTelephone.length < 8) {
      throw new Error('Le numéro de téléphone n\'est pas valide');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      // Error is intentionally ignored as we just return false
      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
