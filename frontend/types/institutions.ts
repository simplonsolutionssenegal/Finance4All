/**
 * Types et interfaces pour les institutions financières
 * 
 * Ce fichier contient toutes les définitions de types liées aux institutions financières,
 * respectant le principe de responsabilité unique (SRP) des principes SOLID.
 */

// Types de base pour les institutions
export interface CreateInstitutionPayload {
  nom: string;
  type: string;
  description: string;
  siteWeb: string;
  contactNom?: string;
  contactEmail?: string;
  contactTelephone?: string;
  regionsDesservies: string[];
  logo?: File | null;
}

export interface InstitutionCreatedResponse {
  id: string;
  nom: string;
  type: string;
  description: string;
  siteWeb: string;
  statut: string;
  createdAt: string;
}

export interface InstitutionListItem {
  id: string | number;
  nom: string;
  type: string;
  statut: string;
  siteWeb?: string;
}

export interface FetchInstitutionsResult {
  institutions: InstitutionListItem[];
  total: number;
}