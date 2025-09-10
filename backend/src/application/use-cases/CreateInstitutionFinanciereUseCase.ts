import { InstitutionFinanciere } from '../../domain/entities/InstitutionFinanciere';
import { InstitutionFinanciereRepository } from '../../domain/repositories/InstitutionFinanciereRepository';

export class CreateInstitutionFinanciereUseCase {
	constructor(private readonly institutionFinanciereRepository: InstitutionFinanciereRepository) {}

	async execute(data: Omit<InstitutionFinanciere, 'id' | 'createdAt' | 'updatedAt'>): Promise<InstitutionFinanciere> {
		// Basic presence validation
		const requiredFields: Array<keyof typeof data> = ['nom', 'type', 'description', 'siteWeb', 'regionsDesservies'];
		for (const field of requiredFields) {
			if (!data[field] || (Array.isArray(data[field]) && (data[field] as unknown[]).length === 0)) {
				throw new Error(`Champ requis manquant: ${String(field)}`);
			}
		}

		// Length constraints (defensive)
		if (data.nom.length > 150) {
			throw new Error('Le nom ne doit pas dépasser 150 caractères');
		}
		if (data.description.length > 2000) {
			throw new Error('La description ne doit pas dépasser 2000 caractères');
		}

		// URL validation
		try {
			const url = new URL(data.siteWeb);
			if (!['http:', 'https:'].includes(url.protocol)) {
				throw new Error();
			}
		} catch {
			throw new Error("URL du site web invalide");
		}

		// Email validation (optional field)
		if (data.contactEmail) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(data.contactEmail)) {
				throw new Error("Adresse email de contact invalide");
			}
		}

		// Regions validation
		if (!Array.isArray(data.regionsDesservies) || data.regionsDesservies.length === 0) {
			throw new Error('Au moins une région desservie est requise');
		}
		if (data.regionsDesservies.length > 50) {
			throw new Error('Nombre de régions desservies trop élevé');
		}
		for (const region of data.regionsDesservies) {
			if (typeof region !== 'string' || region.length === 0) {
				throw new Error('Nom de région invalide');
			}
			if (region.length > 100) {
				throw new Error('Nom de région trop long');
			}
		}

		// Create domain object (repository persists raw object)
		const institution: InstitutionFinanciere = {
			id: '', // will be assigned by DB
			nom: data.nom.trim(),
			type: data.type,
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

		// Persist
		const created = await this.institutionFinanciereRepository.create(institution);
		return created;
	}
}

