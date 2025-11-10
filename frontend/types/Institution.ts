import type { Service } from './Service';

export interface CreateInstitutionDto {
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
  type: Institution['type'];
  pays: Institution['pays'];
}

export interface UpdateInstitutionDto {
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
  type: Institution['type'];
  pays: Institution['pays'];
}

export interface Institution {
  id: string;
  name: string;
  description: string;
  website: string;
  geographicZones: string[];
  logoUrl: string;
  status: InstitutionStatus;
  type:
    | 'ETABLISSEMENT_MONNAIE_ELECTRONIQUE'
    | 'PORTEFEUILLE_NUMERIQUE'
    | 'SERVICE_PAIEMENT_ELECTRONIQUE'
    | 'BANQUE_NUMERIQUE'
    | 'SERVICE_FINANCIER_DECENTRALISE'
    | 'SERVICE_FINANCEMENT_PARTICIPATIF'
    | 'SERVICE_INVESTISSEMENT'
    | 'SERVICE_GESTION_FINANCIERE'
    | 'SERVICE_ASSURANCE_NUMERIQUE';
  pays: 'SENEGAL' | 'CAMEROUN';
  services?: Service[];
  createdAt: string;
  updatedAt: string;
}

export enum InstitutionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}
